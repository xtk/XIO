self.window = self;
importScripts('../bin/xio.js');

self.onmessage = function(e) {

  var _file = e.data;

  X.io.load(_file);

  X.io.oncomplete = function() {
    self.postMessage(X.io.get(_file));
  };

  X.io.onloading = function(id, progress) {

    if (!id) {
      self.postMessage(progress);
    }

  };

};
