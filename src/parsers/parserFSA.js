goog.provide('X.io.parserFSA');

// requires
goog.require('X.io.parser');

var G_debug = 0;
X.DEV = 9;


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


X.io.parserFSA.prototype.CTABparse = function(version)
{
  if(version > 0) {   
    // Old version
   numEntries = version;
   if (X.DEV !== undefined) {
     window.console.log('numEntries = ' + numEntries);
   }
   
    origColorTableLen = this.scan('sint');
    str_origColorTable = this.scan('schar', origColorTableLen);
    var newStr = "";
    for (l = 0; l < str_origColorTable.length; l++)
      {
      newStr = newStr + String.fromCharCode(str_origColorTable[l]);
      }
    colortableOrigTab = newStr;
    if (X.DEV !== undefined) {
      window.console.log('colortableOrigTab = ' + colortableOrigTab);
    }
    
    colortableStructNames = new Array(numEntries);
    if (X.DEV !== undefined) {
      window.console.log('colortableStructNames = ' + colortableStructNames);
    }
    
    colortableTable = new Array(numEntries);
    for (i = 0; i < numEntries + 1; i++)
      {
      colortableTable[i] = new Int32Array(5);
      }
    if (X.DEV !== undefined) {
      window.console.log('COLORTABLETABLE LENGTH = ' + colortableTable.length);
      window.console.log("colortableTable = " + colortableTable);
    //colortableTable[64][3] = 5555;
    //window.console.log('colortableTable = ' + colorTable[64][3]);
    }
    
    numEntriesToRead = numEntries;
    for (k = 0; k < numEntriesToRead; k++)
      {
      
      len = this.scan('sint');
      if (X.DEV !== undefined) {
        window.console.log('len = ' + len);
      }
      
      colortableStructNames[k] = this.scan('schar', len);
      var str = "";
      for (l = 0; l < colortableStructNames[k].length; l++)
          {
          str = str + String.fromCharCode(colortableStructNames[k][l]);
          }
      colortableStructNames[k] = str;
      if (X.DEV !== undefined) {
        window.console.log("colortableStructNames[k] = " + colortableStructNames[k]);
      }
      
      colortableTable[k][0] = this.scan('sint');
      colortableTable[k][1] = this.scan('sint');
      colortableTable[k][2] = this.scan('sint');
      colortableTable[k][3] = this.scan('sint');
      colortableTable[k][4] = (colortableTable[k][0]) * 1 + 
          colortableTable[k][1]*Math.pow(2,8) + colortableTable[k][2]*Math.pow(2,16) + 
          colortableTable[k][3]*Math.pow(2,24);
      
      if (X.DEV !== undefined) {
      window.console.log('colortableTable[k][0] = ' + colortableTable[k][0]);
      window.console.log('colortableTable[k][1] = ' + colortableTable[k][1]);
      window.console.log('colortableTable[k][2] = ' + colortableTable[k][2]);
      window.console.log('colortableTable[k][3] = ' + colortableTable[k][3]);
      window.console.log('colortableTable[k][4] = ' + colortableTable[k][4]);
      //window.console.log('COUNT i = ' + i);
      }
      } 
  }
  else if (version < 0){
    // New version
    numEntries = this.scan('sint');
    if (X.DEV !== undefined) {
    window.console.log('numEntries = ' + numEntries);
    }
    
    origColorTableLen = this.scan('sint');
    str_origColorTable = this.scan('schar', origColorTableLen);
    var newStr = "";
    for (l = 0; l < str_origColorTable.length; l++)
      {
      newStr = newStr + String.fromCharCode(str_origColorTable[l]);
      }
    colortableOrigTab = newStr;
    if (X.DEV !== undefined) {
    window.console.log('colortableOrigTab = ' + colortableOrigTab);
    }
    
    colortableStructNames = new Array(numEntries);
    if (X.DEV !== undefined) {
    window.console.log('colortableStructNames = ' + colortableStructNames);
    }
    colortableTable = new Array(numEntries);
    for (i = 0; i < numEntries + 1; i++)
      {
      colortableTable[i] = new Int32Array(5);
      }
    if (X.DEV !== undefined) {
    window.console.log('COLORTABLETABLE LENGTH = ' + colortableTable.length);
    window.console.log("colortableTable = " + colortableTable);
    //colortableTable[64][3] = 5555;
    //window.console.log('colortableTable = ' + colorTable[64][3]);
    }
    
    numEntriesToRead = this.scan('sint');
    if (X.DEV !== undefined) {
    window.console.log('numEntriesToRead = ' + numEntriesToRead);
    }
    
    for (i = 0; i < numEntriesToRead; i++)
      {
      structure = this.scan('sint') + 1;
      if (structure < 0)
          {
          if (X.DEV !== undefined) {
          window.console.log('Error!! Read entry index ' + structure);
          }
          }
      len = this.scan('sint');
      if (X.DEV !== undefined) {
      window.console.log('structure = ' + structure);
      window.console.log('len = ' + len);
      }
      
      colortableStructNames[structure] = this.scan('schar', len);
      var str = "";
      for (l = 0; l < colortableStructNames[structure].length; l++)
          {
          str = str + String.fromCharCode(colortableStructNames[structure][l]);
          }
      colortableStructNames[structure] = str;
      if (X.DEV !== undefined) {
      window.console.log("colortableStructNames[structure] = " + colortableStructNames[structure]);
      }
      
      colortableTable[structure][0] = this.scan('sint');
      colortableTable[structure][1] = this.scan('sint');
      colortableTable[structure][2] = this.scan('sint');
      colortableTable[structure][3] = this.scan('sint');
      colortableTable[structure][4] = (colortableTable[structure][0]) * 1 + 
          colortableTable[structure][1]*Math.pow(2,8) + colortableTable[structure][2]*Math.pow(2,16) + 
          colortableTable[structure][3]*Math.pow(2,24);
      
      if (X.DEV !== undefined) {
      window.console.log('colortableTable[structure][0] = ' + colortableTable[structure][0]);
      window.console.log('colortableTable[structure][1] = ' + colortableTable[structure][1]);
      window.console.log('colortableTable[structure][2] = ' + colortableTable[structure][2]);
      window.console.log('colortableTable[structure][3] = ' + colortableTable[structure][3]);
      window.console.log('colortableTable[structure][4] = ' + colortableTable[structure][4]);
      //window.console.log('COUNT i = ' + i);
      }
      }
    if (X.DEV !== undefined) {
    window.console.log('LOOP FINISHED');
    }
  }
}


//----------------------------------------------------------------------------------------
/**
 * @inheritDoc
 */
X.io.parserFSA.prototype.parse = function(job) {

  X.TIMER(this._classname + '.parse');

  // grab the data - since Freesurfer annotation are a single file formats
  // use the first attached file
  this._data = job._files[0]._data;

  var _header = {};

  var num = this.scan('uint');
  
  array = new Uint32Array(num);
  
  var parsed = 0;
  var count = 1;
  
  var colorTable = {
      nentries: 0,
      entries: {},
      version:  0
  };
  
  for(var j=0; j<num; j++) {
    
    var vno = this.scan('uint');
    var i = this.scan('uint');
    
    if (vno > num)
      {
      throw new Exception('Vertex number does not match.');
      return;
      }
    
    array[vno] = i;

    parsed = (j/num) * 100;
    
    //for this particular file, there are 122669 elements
    if (Math.floor(parsed) == count * 10)
      {
      
      this.dispatchEvent(new X.io.event.ParsingEvent(job, j/num*100));
      
      if (X.DEV !== undefined) {
        // only print messages in uncompiled xio
        window.console.log(count * 10 + "% parsed");
        window.console.log(j);
      }
      //this.dispatchEvent(new X.io.event.ParsingEvent(count * 10, j/num*100));
      //this.dispatchEvent(new X.io.event.ParsingEvent(job, count * 10));
      count++;
      }
    
    // dispatch parsing progress event
    //this.dispatchEvent(new X.io.event.ParsingEvent(job, j/num*100));
    
  }

  colorTable_exists = this.scan('uint');
  if (X.DEV !== undefined) {
    window.console.log('colorTable_exists = ' + colorTable_exists);
  }
  version = this.scan('sint');
  if (X.DEV !== undefined) {
    window.console.log('version = ' + version);
  }
  
  this.CTABparse(version);
  //----------------------------------------------------------------------------------
  
  //--------------------------------------------------------------------------------------
  
  // update the data of this job
  job._data = {
    'header': _header,
    'data': {
      'array': array
    }
  };
  
  X.TIMERSTOP(this._classname + '.parse');

  // dispatch parse event
  this.dispatchEvent(new X.io.event.ParseEvent(job));

};


goog.exportSymbol('X.io.parserFSA', X.io.parserFSA);
goog.exportSymbol('X.io.parserFSA.prototype.parse', X.io.parserFSA.prototype.parse);
