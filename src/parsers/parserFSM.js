goog.provide('X.io.parserFSM');

// requires
goog.require('X.io.parser');
goog.require('goog.vec.Mat4');

/**
 * Create a parser for Freesurfer mesh files.
 *
 * @constructor
 * @extends X.io.parser
 */
X.io.parserFSM = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'io.parserFSM';

  /**
   * Here, the data stream is big endian.
   *
   * @inheritDoc
   */
  this._littleEndian = false;

};
// inherit from X.parser
goog.inherits(X.io.parserFSM, X.io.parser);

/**
 * @inheritDoc
 */
X.io.parserFSM.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since Freesurfer meshes are a single file formats
  // use the first attached file
  this._data = job._files[0]._data;

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // parse the header
  var _header = this.parse_header();

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // parse the data

  // parse the vertex coordinates and store them in an array
  // x1,y1,z1,x2,y2,z2...
  var _vertices = this.scan('float', _header['vertex_count'] * 3);

  // parse the face indices
  var _faces = this.scan('uint', _header['face_count'] * 3);

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 50));

  this.parse_footer(_header);

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 10));

  // update the data of this job
  job._data = {
    'header': _header,
    'data': {
      'vertices': _vertices,
      'faces': _faces
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
