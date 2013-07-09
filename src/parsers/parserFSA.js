goog.provide('X.io.parserFSA');

// requires
goog.require('X.io.parser');

/**
 * Create a parser for Freesurfer annotation files.
 *
 * @constructor
 * @extends X.io.parser
 */
X.io.parserFSA = function() {

  //
  // call the standard constructor of X.parser
  goog.base(this);

  //
  // class attributes

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'io.parserFSA';

  /**
   * Here, the data stream is big endian.
   *
   * @inheritDoc
   */
  this._littleEndian = false;

};
// inherit from X.parser
goog.inherits(X.io.parserFSA, X.io.parser);

/**
 * @inheritDoc
 */
X.io.parserFSA.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since Freesurfer annotation are a single file formats
  // use the first attached file
  this._data = job._files[0]._data;

  var _header = {};

  console.log(this._data);

  console.log(this.scan('uint', 4));
  
  // dispatch parsing progress event
  this.dispatchEvent(new X.io.event.ParsingEvent(job, 100));

  // update the data of this job
  job._data = {
    'header': _header,
    'data': {
      'labels': _labels,
      'ctab': _ctab
    }
  };

  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};


goog.exportSymbol('X.io.parserFSA', X.io.parserFSA);
goog.exportSymbol('X.io.parserFSA.prototype.parse', X.io.parserFSA.prototype.parse);
