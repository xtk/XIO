goog.provide('X.io.file');

/**
 * @constructor
 */
X.io.file = function(job, uri, extension, status) {

  this._job = job;
  
  this._uri = uri;
  this._status = status;
  
  this._total = 0;
  this._loaded = 0;
  

  this._data = null;
  
};
