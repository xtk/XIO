goog.provide('X.io.job');

/**
 * @constructor
 */
X.io.job = function(id, extension, parser, status) {

  this._id = id;
  this._extension = extension;
  this._parser = parser;
  this._status = status;
  this._files = [];
  this._data = null;
  
  this._loaded = 0;
  this._total = 0;
  this._parsed = 0;

};
