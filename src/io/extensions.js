goog.provide('X.io.extensions');

goog.require('X.io');
goog.require('X.io.parserNII');
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
  'TRK' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER,
    parser : X.io.parserNII
  }
};

goog.exportSymbol('X.io.extensions', X.io.extensions);