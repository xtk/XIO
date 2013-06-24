goog.provide('X.io');

goog.require('X');

/**
 * The IO namespace and singleton access to all X.io-functions and -parsers.
 * 
 * @const
 * @namespace
 */
X.io = {
  'version' : '0.0.1'
};
//
// Object.defineProperty(X.io, 'version', {
// /**
// * Get the version of XIO.
// *
// * @return {!string} Returns the version of XIO.
// * @this {X.io}
// *
// */
// get : function() {
// return this._version;
// }
// });

X.io.uint8 = true;

X.io.onloading = function(id, progress) {

  // do nothing, should be overloaded
};

X.io.onload = function(id) {

  // do nothing, should be overloaded
};

X.io.onparsing = function(id, progress) {

  // do nothing, should be overloaded
};

X.io.onparse = function(id) {

  // do nothing, should be overloaded
};

X.io.oncomplete = function() {

  // do nothing, should be overloaded
};

goog.exportSymbol('X.io.version', X.io.version);
goog.exportSymbol('X.io.uint8', X.io.uint8);
goog.exportSymbol('X.io.onloading', X.io.onloading);
goog.exportSymbol('X.io.onload', X.io.onload);
goog.exportSymbol('X.io.onparsing', X.io.onparsing);
goog.exportSymbol('X.io.onparse', X.io.onparse);
goog.exportSymbol('X.io.oncomplete', X.io.oncomplete);
