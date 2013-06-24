self.window = self;
importScripts('../bin/xio.js');

self.onmessage = function(e) {

  var _file = e.data; 
  
  X.io.load(_file);

  X.io.oncomplete = function() {

    var _out = X.io.get(_file);
    
    // slices as arraybuffer
    var _slices = _out.data.image;
    
    self.postMessage(_slices, _slices);

  };

};
