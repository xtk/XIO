goog.provide('X.io.parserFSA');

// requires
goog.require('X.io.parser');

var G_debug = 0;

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

X.io.parserFSA.prototype.CTABparse = function(version, job) {

  if (version > 0) {
    // Old version
    var numEntries = version;
    // in old version, there was no "version" per se, just the number of
    // entries, but then
    // a new format was made with a version number
    if (eval('X.DEV !== undefined')) {
      window.console.log('numEntries = ' + numEntries);
    }

    var origColorTableLen = this.scan('sint');
    // length of the source of the color table
    var str_origColorTable = this.scan('schar', origColorTableLen);
    // read in the original color table

    // now transform it from an array of numbers into a string
    var newStr = "";
    for ( var l = 0; l < str_origColorTable.length; l++) {
      newStr = newStr + String.fromCharCode(str_origColorTable[l]);
    }
    var colortableOrigTab = newStr;
    if (eval('X.DEV !== undefined')) {
      window.console.log('colortableOrigTab = ' + colortableOrigTab);
    }

    // array for the structure names
    var colortableStructNames = new Array(numEntries);
    if (eval('X.DEV !== undefined')) {
      window.console.log('colortableStructNames = ' + colortableStructNames);
    }

    // each element of this array will itself contain an array of size five
    var colortableTable = new Array(numEntries);
    for ( var i = 0; i < numEntries + 1; i++) {
      colortableTable[i] = new Int32Array(5);
    }
    if (eval('X.DEV !== undefined')) {
      window.console.log('COLORTABLETABLE LENGTH = ' + colortableTable.length);
      window.console.log("colortableTable = " + colortableTable);
      // colortableTable[64][3] = 5555;
      // window.console.log('colortableTable = ' + colorTable[64][3]);
    }
    var parsedPercent;
    var newCount = 1;
    var numEntriesToRead = numEntries;
    for ( var k = 0; k < numEntriesToRead; k++) {
      parsedPercent = (2 * k) / (4 * numEntriesToRead) * 100;

      var len = this.scan('sint');
      if (eval('X.DEV !== undefined')) {
        window.console.log('len = ' + len);
      }

      // k just being the particular index to refer to in colortableStructNames
      colortableStructNames[k] = this.scan('schar', len);
      var str = "";
      for (l = 0; l < colortableStructNames[k].length; l++) {
        str = str + String.fromCharCode(colortableStructNames[k][l]);
      }
      colortableStructNames[k] = str;
      if (eval('X.DEV !== undefined')) {
        window.console.log("colortableStructNames[k] = "
            + colortableStructNames[k]);
      }

      colortableTable[k][0] = this.scan('sint');
      colortableTable[k][1] = this.scan('sint');
      colortableTable[k][2] = this.scan('sint');
      colortableTable[k][3] = this.scan('sint');
      colortableTable[k][4] = (colortableTable[k][0]) * 1
          + colortableTable[k][1] * Math.pow(2, 8) + colortableTable[k][2]
          * Math.pow(2, 16) + colortableTable[k][3] * Math.pow(2, 24);

      if (Math.floor(parsedPercent) == newCount * 5) {

        this.dispatchEvent(new X.io.event.ParsingEvent(job, 5));
        newCount = newCount + 1;
      }

      if (eval('X.DEV !== undefined')) {
        window.console.log('colortableTable[k][0] = ' + colortableTable[k][0]);
        window.console.log('colortableTable[k][1] = ' + colortableTable[k][1]);
        window.console.log('colortableTable[k][2] = ' + colortableTable[k][2]);
        window.console.log('colortableTable[k][3] = ' + colortableTable[k][3]);
        window.console.log('colortableTable[k][4] = ' + colortableTable[k][4]);
        // window.console.log('COUNT i = ' + i);
        
      }
    }
  } else if (version < 0) {
    // New version
    // has the version number, next is the number of entries
    numEntries = this.scan('sint');
    if (eval('X.DEV !== undefined')) {
      window.console.log('numEntries = ' + numEntries);
    }

    // length of the original color table name
    origColorTableLen = this.scan('sint');
    // take it in as array of numbers
    str_origColorTable = this.scan('schar', origColorTableLen);
    // transform it into a string
    var newStr = "";
    for (l = 0; l < str_origColorTable.length; l++) {
      newStr = newStr + String.fromCharCode(str_origColorTable[l]);
    }
    colortableOrigTab = newStr;
    if (eval('X.DEV !== undefined')) {
      window.console.log('colortableOrigTab = ' + colortableOrigTab);
    }
    // array to hold the struct names
    colortableStructNames = new Array(numEntries);
    if (eval('X.DEV !== undefined')) {
      window.console.log('colortableStructNames = ' + colortableStructNames);
    }
    // the actual colortable. thus, each element is an array of size five
    var colortableTable = new Array(numEntries);
    for (i = 0; i < numEntries + 1; i++) {
      colortableTable[i] = new Int32Array(5);
    }
    if (eval('X.DEV !== undefined')) {
      window.console.log('COLORTABLETABLE LENGTH = ' + colortableTable.length);
      window.console.log("colortableTable = " + colortableTable);
      // colortableTable[64][3] = 5555;
      // window.console.log('colortableTable = ' + colorTable[64][3]);
    }

    var numEntriesToRead = this.scan('sint');
    if (eval('X.DEV !== undefined')) {
      window.console.log('numEntriesToRead = ' + numEntriesToRead);
    }

    var newCount = 1;

    for (i = 0; i < numEntriesToRead; i++) {

      // structure is really just an index number
      var structure = this.scan('sint') + 1;

      if (structure < 0) {
        if (eval('X.DEV !== undefined')) {
          window.console.log('Error!! Read entry index ' + structure);
        }
      }
      // length of the structure name
      len = this.scan('sint');
      if (eval('X.DEV !== undefined')) {
        window.console.log('structure = ' + structure);
        window.console.log('len = ' + len);
      }
      // read in the name as series of numbers
      colortableStructNames[structure] = this.scan('schar', len);
      // transform it into a string
      var str = "";
      for (l = 0; l < colortableStructNames[structure].length; l++) {
        str = str + String.fromCharCode(colortableStructNames[structure][l]);
      }
      colortableStructNames[structure] = str;
      if (eval('X.DEV !== undefined')) {
        window.console.log("colortableStructNames[structure] = "
            + colortableStructNames[structure]);
      }

      colortableTable[structure][0] = this.scan('sint');
      colortableTable[structure][1] = this.scan('sint');
      colortableTable[structure][2] = this.scan('sint');
      colortableTable[structure][3] = this.scan('sint');
      colortableTable[structure][4] = (colortableTable[structure][0]) * 1
          + colortableTable[structure][1] * Math.pow(2, 8)
          + colortableTable[structure][2] * Math.pow(2, 16)
          + colortableTable[structure][3] * Math.pow(2, 24);

      if (Math.floor(parsedPercent) == newCount * 5) {

        this.dispatchEvent(new X.io.event.ParsingEvent(job, 5));
        newCount = newCount + 1;
      }

    }
    if (eval('X.DEV !== undefined')) {
      window.console.log('colortableTable[structure][0] = '
          + colortableTable[structure][0]);
      window.console.log('colortableTable[structure][1] = '
          + colortableTable[structure][1]);
      window.console.log('colortableTable[structure][2] = '
          + colortableTable[structure][2]);
      window.console.log('colortableTable[structure][3] = '
          + colortableTable[structure][3]);
      window.console.log('colortableTable[structure][4] = '
          + colortableTable[structure][4]);
      // window.console.log('COUNT i = ' + i);
      parsedPercent = (2 * i) / (numEntriesToRead * 4) * 100;

    }
    if (eval('X.DEV !== undefined')) {
      window.console.log('LOOP FINISHED');
    }
  }
}

// ----------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
X.io.parserFSA.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since Freesurfer annotation are a single file formats
  // use the first attached file
  this._data = job._files[0]._data;

  var _header = {};
  // num = the number of elements
  var num = this.scan('uint');
  // this is the array that will hold al the data
  var array = new Uint32Array(num);

  // variables used only for tracking progress. Not essential to the
  // functionality of the program
  var parsed = 0;
  var count = 1;

  var colorTable = {
    nentries : 0,
    entries : {},
    version : 0
  };
  // iterate through the whole thing scanning in the vertex number (vno) and the
  // actual data points (i)
  for ( var j = 0; j < num; j++) {

    var vno = this.scan('uint');
    var i = this.scan('uint');

    array[vno] = i;
    // again for tracking progress
    parsed = (j / num) * 100;

    // read out the progress when desired
    if (Math.floor(parsed) == count * 10) {

      this.dispatchEvent(new X.io.event.ParsingEvent(job, 5));

      if (eval('X.DEV !== undefined')) {
        // only print messages in uncompiled xio
        window.console.log(count * 10 + "% parsed");
        window.console.log(j);
      }
      // this.dispatchEvent(new X.io.event.ParsingEvent(count * 10, j/num*100));
      // this.dispatchEvent(new X.io.event.ParsingEvent(job, count * 10));
      count++;
    }

    // dispatch parsing progress event
    // this.dispatchEvent(new X.io.event.ParsingEvent(job, j/num*100));

  }
  // some files won't have a colortable
  var colorTable_exists = this.scan('uint');
  if (eval('X.DEV !== undefined')) {
    window.console.log('colorTable_exists = ' + colorTable_exists);
  }
  // to distinguish between new and old file types
  var version = this.scan('sint');
  X.DEBUG('version = ' + version);
  // parse the color tab
  this.CTABparse(version, job);

  this.dispatchEvent(new X.io.event.ParsingEvent(job, 10));
  // ----------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------

  // update the data of this job
  job._data = {
    'header' : _header,
    'data' : {
      'array' : array
    }
  };

  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};

goog.exportSymbol('X.io.parserFSA', X.io.parserFSA);
goog.exportSymbol('X.io.parserFSA.prototype.parse',
    X.io.parserFSA.prototype.parse);
