goog.provide('X.io.parserVTK');

// requires
goog.require('X.io.parser');
goog.require('goog.vec.Mat4');

/**
 * Create a parser for VTK polydata files.
 *
 * @constructor
 * @extends X.io.parser
 */
X.io.parserVTK = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'io.parserVTK';

};
// inherit from X.parser
goog.inherits(X.io.parserVTK, X.io.parser);

/**
 * @inheritDoc
 */
X.io.parserVTK.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since VTK meshes are a single file formats
  // use the first attached file
  var _data = new Uint8Array(job._files[0]._data);

  var _str = '';

  // convert the char array to a string
  // the quantum is necessary to deal with large data
  var QUANTUM = 32768;
  for ( var i = 0, len = _data.length; i < len; i += QUANTUM) {

    _str += this.parseChars(_data, i, Math.min(i + QUANTUM, len));

  }

  var data_as_array = _str.split('\n');
  var line_count = data_as_array.length;
  var split = /[ ]+/;

  var header = {
    'comments': '',
    'name':'',
    'file_type':'',
    'data_set_type':'',
    'vertex_count':'',
    'points_type':'',
    'face_type':'',
    'face_count':''
  };

  var l = 0;
  header['comments'] += data_as_array[l];
  while (data_as_array[++l][0] == '#') {
    // comments/header
    header['comments'] += '\n'+data_as_array[l];
  }

  // next one is a name
  header['name'] = data_as_array[l++];

  // next one is the file type
  header['file_type'] = data_as_array[l++].toUpperCase();

  if (header['file_type'].trim() != 'ASCII'.trim()) {

    throw new Error('VTK binary files are not supported.');

  }

  // next one is the dataset type
  header['dataset_type'] = data_as_array[l++].split(split)[1].toUpperCase();

  if (header['dataset_type'].trim() == 'POLYDATA'.trim()) {

    // next one is points
    var points = data_as_array[l++].split(split);
    if (points[0].toUpperCase().trim() != 'POINTS'.trim()) {
      throw new Error('Expecting POINTS at this point.');
    }
    header['vertex_count'] = parseInt(points[1], 10);
    header['points_type'] = points[2];

    // parse all vertices
    var vertices = [];
    if (header['points_type'].toUpperCase().trim() == 'FLOAT'.trim()) {
      vertices = new Float32Array(header['vertex_count']*3);
    }

    var vertices_added = 0;
    do {

      var v = data_as_array[l++].trim().split(split);
      if (!v) {
        break;
      }
      vertices.set(v, vertices_added);
      vertices_added += v.length;


    } while(vertices_added != header['vertex_count']*3);

    // next one might be a face type
    var face_type = data_as_array[l++].split(split);
    header['face_type'] = face_type[0].toUpperCase();
    header['face_count'] = parseInt(face_type[1], 10);

    // parse all faces
    var faces = new Uint32Array(parseInt(face_type[2], 10) - header['face_count']);
    var faces_added = 0;
    do {

      var f = data_as_array[l++].trim().split(split);
      if (!f) {
        break;
      }
      // remove the first item (it is a counter)
      f.splice(0,1);
      faces.set(f, faces_added);
      faces_added += f.length;

    } while(faces_added != (parseInt(face_type[1], 10) - header['face_count']));

  } else {

    throw new Error('Currently only VTK POLYDATA is supported.');

  }

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));


  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 50));

  //this.parse_footer(_header);

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 10));

  // update the data of this job
  job._data = {
    'header': header,
    'data': {
      'vertices': vertices,
      'faces': faces
    }
  };

  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};

X.io.parserFSM.prototype.parse_header = function() {

  // Go through two newlines
  var iters = 0;
  var curChar;
  do {
    curChar = this.scan('uchar');
    iters++;
  } while ((iters < 200) && (curChar != 0x0A))

  // Read one more newline
  curChar = this.scan('uchar');

  //
  var header = {
    'vertex_count': this.scan('uint'),
    'face_count': this.scan('uint'),
    'xyz_to_ras': goog.vec.Mat4.createFloat32Identity()
  };

  return header;

};

X.io.parserFSM.prototype.parse_footer = function(header) {

  // currently we just grab the cras information

  var _rest_of_file = this.scan('uchar', this._data.byteLength-this._dataPointer);
  // find the cras field
  var _cras = null;
  for (var i=0; i<_rest_of_file.length;i++) {

    // c == 99
    // r == 114
    // a == 97
    // s == 115
    if (_rest_of_file[i] == 99 && _rest_of_file[i+1] == 114 && _rest_of_file[i+2] == 97 && _rest_of_file[i+3] == 115) {

      // start from 8 bytes until a linebreak or EOF
      var _cras_values_start = i+9;
      var _cras_values_stop = _cras_values_start;

      while(_rest_of_file[i] != 10 && i<_rest_of_file.length) {

        // part of cras
        _cras_values_stop++;

        // .. jump one byte
        i++;

      }

      _cras = this.parseChars(_rest_of_file.subarray(_cras_values_start, _cras_values_stop)).split(' ');

      break;

    }

  }

  if (_cras) {

    header['xyz_to_ras'] = goog.vec.Mat4.translate(header['xyz_to_ras'], parseFloat(_cras[0]), parseFloat(_cras[1]), parseFloat(_cras[2]));

  }

};

goog.exportSymbol('X.io.parserFSM', X.io.parserFSM);
goog.exportSymbol('X.io.parserFSM.prototype.parse', X.io.parserFSM.prototype.parse);
