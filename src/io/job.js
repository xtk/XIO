goog.provide('X.io.job');

/**
 * @constructor
 */
X.io.job = function(id, extension, status) {

  this._id = id;
  this._extension = extension;
  this._status = status;
  this._files = [];
  this._data = null;
  
  this._loaded = 0;
  this._total = 0;

};
