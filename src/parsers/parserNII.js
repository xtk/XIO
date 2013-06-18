goog.provide('X.io.parserNII');

// requires
goog.require('X.io.parser');
goog.require('goog.vec.Mat4');
goog.require('Zlib.Gunzip');

/**
 * Create a parser for .nii/.nii.gz files.
 * 
 * @constructor
 * @extends X.io.parser
 */
X.io.parserNII = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'io.parserNII';

};
// inherit from X.parser
goog.inherits(X.io.parserNII, X.io.parser);

/**
 * @inheritDoc
 */
X.io.parserNII.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since NII is a single file format
  // use the first attached file
  var _data = job._files[0]._data;

  // check if this data is compressed, then this int != 348
  var _compressionCheck = -1;
  if ( typeof DataView == 'undefined' ) {
    _compressionCheck = new Int32Array(_data, 0, 1)[0];
  } else {
    var dataview = new DataView(_data, 0);
    _compressionCheck = dataview.getInt32(0, true);
  }

  if ( _compressionCheck != 348 ) {

    // we need to decompress the datastream

    // here we start the unzipping and get a typed Uint8Array back
    var inflate = new Zlib.Gunzip(new Uint8Array(_data));
    _data = inflate.decompress();

    // .. and use the underlying array buffer
    _data = _data.buffer;

  }

  // attach the data
  this._data = _data;

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));  
  
  // parse the header
  var _header = this.parse_header();

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // parse the image data
  var _image_data = this.parse_data(_header);

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // create IJK2RAS and RAS2IJK matrices
  var _ijk2ras = this.create_IJK2RAS(_header); 
  var _ras2ijk = goog.vec.Mat4.createFloat32();
  goog.vec.Mat4.invert(_ijk2ras, _ras2ijk);
  
  // reslice the datastream
  var _image = this.reslice(_header['dim'].subarray(1,4), _image_data);
  
  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 40));

  // update the data of this job
  job._data = {
    'header' : _header,
    'data' : {
      'image' : _image
    }
  };

  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};

X.io.parserNII.prototype.parse_header = function() {

  //
  // the header fields of the official NIfTI-1 format
  // see http://nifti.nimh.nih.gov/pub/dist/src/niftilib/nifti1.h
  var header = {
    'sizeof_hdr' : this.scan('uint'),
    'data_type' : this.scan('uchar', 10), /* !< ++UNUSED++ *//*
                                                               * char
                                                               * data_type[10];
                                                               */
    'db_name' : this.scan('uchar', 18), /* !< ++UNUSED++ *//* char db_name[18]; */
    'extents' : this.scan('uint'), /* !< ++UNUSED++ *//* int extents; */
    'session_error' : this.scan('ushort'), /* !< ++UNUSED++ *//*
                                                               * short
                                                               * session_error;
                                                               */
    'regular' : this.scan('uchar'), /* !< ++UNUSED++ *//* char regular; */
    'dim_info' : this.scan('uchar'),/* !< MRI slice ordering. *//*
                                                                 * char
                                                                 * hkey_un0;
                                                                 */
    'dim' : this.scan('ushort', 8), // *!< Data array dimensions.*/ /* short
                                    // dim[8]; */
    'intent_p1' : this.scan('float'), // *!< 1st intent parameter. */ /* short
                                      // unused8; */
    'intent_p2' : this.scan('float'), // *!< 2nd intent parameter. */ /* short
                                      // unused10; */
    'intent_p3' : this.scan('float'), // *!< 3rd intent parameter. */ /* short
                                      // unused12; */
    'intent_code' : this.scan('ushort'), // *!< NIFTI_INTENT_* code. */ /*
                                          // short unused14; */
    'datatype' : this.scan('ushort'), // *!< Defines data type! */ /* short
                                      // datatype; */
    'bitpix' : this.scan('ushort'), // *!< Number bits/voxel. */ /* short
                                    // bitpix; */
    'slice_start' : this.scan('ushort'), // *!< First slice index. */ /* short
                                          // dim_un0; */
    'pixdim' : this.scan('float', 8), // *!< Grid spacings. */ /* float
                                      // pixdim[8]; */
    'vox_offset' : this.scan('float'), // *!< Offset into .nii file */ /* float
                                        // vox_offset; */
    'scl_slope' : this.scan('float'), // *!< Data scaling: slope. */ /* float
                                      // funused1; */
    'scl_inter' : this.scan('float'), // *!< Data scaling: offset. */ /* float
                                      // funused2; */
    'slice_end' : this.scan('ushort'), // *!< Last slice index. */ /* float
                                        // funused3; */
    'slice_code' : this.scan('uchar'), // *!< Slice timing order. */
    'xyzt_units' : this.scan('uchar'), // *!< Units of pixdim[1..4] */
    'cal_max' : this.scan('float'), // *!< Max display intensity */ /* float
                                    // cal_max; */
    'cal_min' : this.scan('float'), // *!< Min display intensity */ /* float
                                    // cal_min; */
    'slice_duration' : this.scan('float'), // *!< Time for 1 slice. */ /* float
                                            // compressed; */
    'toffset' : this.scan('float'), // *!< Time axis shift. */ /* float
                                    // verified; */
    'glmax' : this.scan('uint', 1),/* !< ++UNUSED++ *//* int glmax; */
    'glmin' : this.scan('uint', 1), /* !< ++UNUSED++ *//* int glmin; */
    'descrip' : this.scan('uchar', 80), // *!< any text you like. */ /* char
                                        // descrip[80]; */
    'aux_file' : this.scan('uchar', 24), // *!< auxiliary filename. */ /* char
                                          // aux_file[24]; */
    'qform_code' : this.scan('ushort'), // *!< NIFTI_XFORM_* code. */ /*-- all
                                        // ANALYZE 7.5 ---*/
    'sform_code' : this.scan('ushort'), // *!< NIFTI_XFORM_* code. */ /* fields
                                        // below here */
    'quatern_b' : this.scan('float'), // *!< Quaternion b param. */
    'quatern_c' : this.scan('float'), // *!< Quaternion c param. */
    'quatern_d' : this.scan('float'), // *!< Quaternion d param. */
    'qoffset_x' : this.scan('float'), // *!< Quaternion x shift. */
    'qoffset_y' : this.scan('float'), // *!< Quaternion y shift. */
    'qoffset_z' : this.scan('float'), // *!< Quaternion z shift. */
    'srow_x' : this.scan('float', 4), // *!< 1st row affine transform. */
    'srow_y' : this.scan('float', 4), // *!< 2nd row affine transform. */
    'srow_z' : this.scan('float', 4), // *!< 3rd row affine transform. */
    'intent_name' : this.scan('uchar', 16), // *!< 'name' or meaning of data. */
    'magic' : this.scan('uchar', 4)
  // *!< MUST be "ni1\0" or "n+1\0". */
  };

  return header;

};

X.io.parserNII.prototype.parse_data = function(header) {

  var _image_data = null;

  // jump to vox_offset which is very important since the
  // header can be shorter as the usual 348 bytes
  this.jumpTo(parseInt(header['vox_offset'], 10));

  // number of pixels in the volume
  var volsize = header['dim'][1] * header['dim'][2] * header['dim'][3];
  
  // scan the pixels regarding the data type
  switch (header['datatype']) {
  case 2:
    // unsigned char
    _image_data = this.scan('uchar', volsize);
    break;
  case 4:
    // signed short
    _image_data = this.scan('sshort', volsize);
    break;
  case 8:
    // signed int
    _image_data = this.scan('sint', volsize);
    break;
  case 16:
    // float
    _image_data = this.scan('float', volsize);
    break;
  case 32:
    // complex
    _image_data = this.scan('complex', volsize);
    break;
  case 64:
    // double
    _image_data = this.scan('double', volsize);
    break;
  case 256:
    // signed char
    _image_data = this.scan('schar', volsize);
    break;
  case 512:
    // unsigned short
    _image_data = this.scan('ushort', volsize);
    break;
  case 768:
    // unsigned int
    _image_data = this.scan('uint', volsize);
    break;

  default:
    throw new Error('Unsupported NII data type: ' + header['datatype']);

  }

  return _image_data;

};

X.io.parserNII.prototype.create_IJK2RAS = function(header) {

  var IJKToRAS = goog.vec.Mat4.createFloat32Identity();

  var _spaceorientation = [];

  // 3 known cases
  if ( header['qform_code'] == 0 ) {

    // fill IJKToRAS
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, header['pixdim'][1], 0, 0, 0);
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, 0, header['pixdim'][2], 0, 0);
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, 0, 0, header['pixdim'][3], 0);

    _spaceorientation.push(header['pixdim'][1]);
    _spaceorientation.push(0);
    _spaceorientation.push(0);
    _spaceorientation.push(0);
    _spaceorientation.push(header['pixdim'][2]);
    _spaceorientation.push(0);
    _spaceorientation.push(0);
    _spaceorientation.push(0);
    _spaceorientation.push(header['pixdim'][3]);

  } else if ( header['qform_code'] > 0 ) {

    // https://github.com/Kitware/ITK/blob/master/Modules/IO/NIFTI/src/itkNiftiImageIO.cxx
    // from ITK/Modules/ThirdParty/NIFTI/src/nifti/niftilib/nifti1_io.c

    var a = 0.0, b = header['quatern_b'], c = header['quatern_c'], d = header['quatern_d'];
    var xd = 1.0, yd = 1.0, zd = 1.0;
    var qx = header['qoffset_x'], qy = header['qoffset_y'], qz = header['qoffset_z'];

    // compute a
    a = 1.0 - (b * b + c * c + d * d);
    if ( a < 0.0000001 ) { /* special case */
      a = 1.0 / Math.sqrt(b * b + c * c + d * d);
      b *= a;
      c *= a;
      d *= a; /* normalize (b,c,d) vector */
      a = 0.0; /* a = 0 ==> 180 degree rotation */
    } else {
      a = Math.sqrt(a); /* angle = 2*arccos(a) */
    }

    // scaling factors
    if ( header['pixdim'][1] > 0.0 ) {
      xd = header['pixdim'][1];
    }

    if ( header['pixdim'][2] > 0.0 ) {
      yd = header['pixdim'][2];
    }

    if ( header['pixdim'][2] > 0.0 ) {
      zd = header['pixdim'][3];
    }

    // qfac left handed
    if ( header['pixdim'][0] < 0.0 ) {
      zd = -zd;
    }

    // fill IJKToRAS

    goog.vec.Mat4.setRowValues(IJKToRAS, 0, (a * a + b * b - c * c - d * d)
        * xd, 2 * (b * c - a * d) * yd, 2 * (b * d + a * c) * zd, qx);
    goog.vec.Mat4.setRowValues(IJKToRAS, 1, 2 * (b * c + a * d) * xd, (a * a
        + c * c - b * b - d * d)
        * yd, 2 * (c * d - a * b) * zd, qy);
    goog.vec.Mat4.setRowValues(IJKToRAS, 2, 2 * (b * d - a * c) * xd, 2
        * (c * d + a * b) * yd, (a * a + d * d - c * c - b * b) * zd, qz);

    _spaceorientation.push((a * a + b * b - c * c - d * d) * xd);
    _spaceorientation.push(2 * (b * c + a * d) * xd);
    _spaceorientation.push(2 * (b * d + a * c) * zd);
    _spaceorientation.push(2 * (b * c - a * d) * yd);
    _spaceorientation.push((a * a + c * c - b * b - d * d) * yd);
    _spaceorientation.push(2 * (c * d - a * b) * zd);
    _spaceorientation.push(2 * (b * d + a * c) * zd);
    _spaceorientation.push(2 * (c * d + a * b) * yd);
    _spaceorientation.push((a * a + d * d - c * c - b * b) * zd);

  } else if ( header['sform_code'] > 0 ) {

    var sx = header['srow_x'], sy = header['srow_y'], sz = header['srow_z'];
    // fill IJKToRAS
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, sx[0], sx[1], sx[2], sx[3]);
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, sy[0], sy[1], sy[2], sy[3]);
    goog.vec.Mat4.setRowValues(IJKToRAS, 0, sz[0], sz[1], sz[2], sz[3]);

  }
  
  return IJKToRAS;
  

};

goog.exportSymbol('X.io.parserNII', X.io.parserNII);
goog.exportSymbol('X.io.parserNII.prototype.parse',
    X.io.parserNII.prototype.parse);
