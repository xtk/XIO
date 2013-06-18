self.window = self;
importScripts('../../bin/xio.js');

self.onmessage = function(e) {

  var _file = e.data;

  X.io.load(_file);

  X.io.oncomplete = function() {
    self.postMessage(X.io.get(_file));
  };

};
