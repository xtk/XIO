goog.provide('X.io.extensions');

goog.require('X.io');
goog.require('X.io.parserFSM');
goog.require('X.io.parserNII');
goog.require('X.io.parserVTK');
goog.require('goog.net.XhrIo.ResponseType');

/**
 * Supported data types by extension.
 *
 * @enum {Object}
 */
X.io.extensions = {
  'DICOM' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserNII
  },
  'NII' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserNII
  },
  'GZ' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserNII
  },
  'FSM' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'INFLATED' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'SMOOTHWM' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'SPHERE' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'PIAL' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'ORIG' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserFSM
  },
  'VTK' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserVTK
  }
};

goog.exportSymbol('X.io.extensions', X.io.extensions);