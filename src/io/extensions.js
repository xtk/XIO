goog.provide('X.io.extensions');

goog.require('X.io');
goog.require('goog.net.XhrIo.ResponseType');

/**
 * Supported data types by extension.
 * 
 * @enum {Object}
 */
X.io.extensions = {
  'DICOM' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER
  },
  'NII' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER
  },
  'GZ' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER
  },
  'TRK' : {
    response_type : goog.net.XhrIo.ResponseType.ARRAY_BUFFER
  }
};

goog.exportSymbol('X.io.extensions', X.io.extensions);