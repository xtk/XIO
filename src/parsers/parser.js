/*
 * xxxxxxx xxxxxxx x:::::x x:::::x x:::::x x:::::x x:::::xx:::::x x::::::::::x
 * x::::::::x x::::::::x x::::::::::x x:::::xx:::::x x:::::x x:::::x x:::::x
 * x:::::x THE xxxxxxx xxxxxxx TOOLKIT http://www.goXTK.com Copyright (c) 2013
 * The X Toolkit Developers <dev@goXTK.com> The X Toolkit (XTK) is licensed
 * under the MIT License: http://www.opensource.org/licenses/mit-license.php
 * "Free software" is a matter of liberty, not price. "Free" as in "free
 * speech", not as in "free beer". - Richard M. Stallman
 */

goog.provide('X.io.parser');

// requires
goog.require('X.io.base');

/**
 * Create a parser for binary or ascii data.
 * 
 * @constructor
 * @extends X.io.base
 * @export
 */
X.io.parser = function() {

  //
  // call the standard constructor of X.io.base
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'io.parser';

  /**
   * The data.
   * 
   * @type {?ArrayBuffer}
   * @protected
   */
  this._data = null;

  /**
   * The pointer to the current byte.
   * 
   * @type {!number}
   * @protected
   */
  this._dataPointer = 0;

  /**
   * The native endianness flag. Based on
   * https://github.com/kig/DataStream.js/blob/master/DataStream.js
   * 
   * @type {!boolean}
   * @protected
   */
  this._nativeLittleEndian = new Int8Array(new Int16Array([ 1 ]).buffer)[0] > 0;

  /**
   * The data-specific endianness flag.
   * 
   * @type {!boolean}
   * @protected
   */
  this._littleEndian = true;

  /**
   * The min value of the last parsing attempt.
   * 
   * @type {!number}
   * @protected
   */
  this._lastMin = -Infinity;

  /**
   * The max value of the last parsing attempt.
   * 
   * @type {!number}
   * @protected
   */
  this._lastMax = Infinity;

};
// inherit from X.io.base
goog.inherits(X.io.parser, X.io.base);


/**
 * Parse data and configure the given object. When complete, a
 * X.io.parser.ModifiedEvent is fired.
 * 
 * @param {!X.io.base} container A container which holds the loaded data. This can
 *            be an X.object as well.
 * @param {!ArrayBuffer} data The data to parse.
 * @param {*} flag An additional flag.
 * @throws {Error} An exception if something goes wrong.
 * @export
 */
X.io.parser.prototype.parse = function(container, object, data, flag) {

  throw new Error('The function parse() should be overloaded.');
};


//
// PARSE FUNCTIONS
//
//

/**
 * Get the min and max values of an array.
 * 
 * @param {!Array} data The data array to analyze.
 * @return {!Array} An array with length 2 containing the [min, max] values.
 * @export
 */
X.io.parser.prototype.arrayMinMax = function(data) {

  var _min = Infinity;
  var _max = -Infinity;
  // buffer the length
  var _datasize = data.length;
  var i = 0;
  for (i = 0; i < _datasize; i++) {
    var _value = data[i];
    _min = Math.min(_min, _value);
    _max = Math.max(_max, _value);
  }
  return [ _min, _max ];
};

/**
 * Create a string from a bunch of UChars. This replaces a
 * String.fromCharCode.apply call and therefor supports more platforms (like the
 * Android stock browser).
 * 
 * @param {!Array|Uint8Array} array The Uint8Array.
 * @param {?number=} start The start position. If undefined, use the whole
 *            array.
 * @param {?number=} end The end position. If undefined, use the whole array.
 * @return {string} The created string.
 * @export
 */
X.io.parser.prototype.parseChars = function(array, start, end) {

  // without borders, use the whole array
  if ( start === undefined ) {
    start = 0;
  }

  if ( end === undefined ) {
    end = array.length;
  }

  var _output = '';

  // create and append the chars
  var i = 0;
  for (i = start; i < end; ++i) {

    _output += String.fromCharCode(array[i]);

  }

  return _output;

};

/**
 * Jump to a position in the byte stream.
 * 
 * @param {!number} position The new offset.
 * @export
 */
X.io.parser.prototype.jumpTo = function(position) {

  this._dataPointer = position;
};

/**
 * Scan binary data relative to the internal position in the byte stream.
 * 
 * @param {!string} type The data type to scan, f.e.
 *            'uchar','schar','ushort','sshort','uint','sint','float'
 * @param {!number=} chunks The number of chunks to scan. By default, 1.
 * @export
 */
X.io.parser.prototype.scan = function(type, chunks) {

  if ( !goog.isDefAndNotNull(chunks) ) {
    chunks = 1;
  }
  var _chunkSize = 1;
  var _array_type = Uint8Array;
  switch (type) {
  // 1 byte data types
  case 'uchar':
    break;
  case 'schar':
    _array_type = Int8Array;
    break;
  // 2 byte data types
  case 'ushort':
    _array_type = Uint16Array;
    _chunkSize = 2;
    break;
  case 'sshort':
    _array_type = Int16Array;
    _chunkSize = 2;
    break;
  // 4 byte data types
  case 'uint':
    _array_type = Uint32Array;
    _chunkSize = 4;
    break;
  case 'sint':
    _array_type = Int32Array;
    _chunkSize = 4;
    break;
  case 'float':
    _array_type = Float32Array;
    _chunkSize = 4;
    break;
  }
  // increase the data pointer in-place
  var _bytes = new _array_type(this._data.slice(this._dataPointer,
      this._dataPointer += chunks * _chunkSize));
  // if required, flip the endianness of the bytes
  if ( this._nativeLittleEndian != this._littleEndian ) {
    // we need to flip here since the format doesn't match the native endianness
    _bytes = this.flipEndianness(_bytes, _chunkSize);
  }
  if ( chunks == 1 ) {
    // if only one chunk was requested, just return one value
    return _bytes[0];
  }
  // return the byte array
  return _bytes;
};

/**
 * Flips typed array endianness in-place. Based on
 * https://github.com/kig/DataStream.js/blob/master/DataStream.js.
 * 
 * @param {!Object} array Typed array to flip.
 * @param {!number} chunkSize The size of each element.
 * @return {!Object} The converted typed array.
 * @export
 */
X.io.parser.prototype.flipEndianness = function(array, chunkSize) {

  var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
  for ( var i = 0; i < array.byteLength; i += chunkSize) {
    for ( var j = i + chunkSize - 1, k = i; j > k; j--, k++) {
      var tmp = u8[k];
      u8[k] = u8[j];
      u8[j] = tmp;
    }
  }
  return array;
};
