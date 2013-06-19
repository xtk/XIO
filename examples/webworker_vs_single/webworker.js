self.window = self;
importScripts('../../bin/xio.js');

self.onmessage = function(e) {

  var _file = e.data;

  X.io.load(_file);

  X.io.oncomplete = function() {

    var _output = X.io.get(_file);
    var _header = _output.header;
    var _slices = _output.data.image;

    self.postMessage(_slices, _slices);



  };

};
