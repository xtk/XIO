(function() {
  for (var key in goog.dependencies_.nameToPath) {

    if (key[0] == 'X') {
      goog.require(key);
    }

  }
})();