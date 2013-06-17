/*
 * xxxxxxx xxxxxxx x:::::x x:::::x x:::::x x:::::x x:::::xx:::::x x::::::::::x
 * x::::::::x x::::::::x x::::::::::x x:::::xx:::::x x:::::x x:::::x x:::::x
 * x:::::x THE xxxxxxx xxxxxxx TOOLKIT http://www.goXTK.com Copyright (c) 2013
 * The X Toolkit Developers <dev@goXTK.com> The X Toolkit (XTK) is licensed
 * under the MIT License: http://www.opensource.org/licenses/mit-license.php
 * "Free software" is a matter of liberty, not price. "Free" as in "free
 * speech", not as in "free beer". - Richard M. Stallman
 */

goog.provide('X.io.parserNII');

// requires
goog.require('X.io.parser');


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

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 20));

  // update the data of this job
  job._data = {
    'header' : {
      'dimensions': [256,256,176]
    },
    'data' : {
      'image' : new Float32Array(100000)
    }
  };

  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};

goog.exportSymbol('X.io.parserNII', X.io.parserNII);
goog.exportSymbol('X.io.parserNII.prototype.parse',
    X.io.parserNII.prototype.parse);
