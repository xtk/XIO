(function() {

  buster.testCase('parserNII', {
    setUp : function() {

      var parser = new X.io.parserNII();

      this.parser = parser;

    },
    "classname" : function() {
      assert(this.parser.classname == 'io.parserNII');
    }
  });

})();
