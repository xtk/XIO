goog.provide('X.io');

goog.require('X');
goog.require('goog.net.XhrManager');
goog.require('goog.struct.Map');

/**
 * @constructor
 * @private
 */
X.io_ = function() {

  this._xhr_manager = new goog.net.XhrManager();

  this._jobs = new goog.struct.Map();

  window.console.log('XIO version 0.0.1.');

};

X.io_.prototype.add = function() {

  window.console.log('load');



};

X.io_.prototype.load = function() {

  window.console.log('start');

};



/**
 * The IO namespace and singleton access to all X.io-functions and -parsers.
 *
 * @const
 * @namespace
 */
X.io = X.io || new X.io_();


goog.exportSymbol('X.io', X.io);
goog.exportSymbol('X.io.prototype.load', X.io_.prototype.load);