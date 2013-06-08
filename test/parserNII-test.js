(function() {

  buster.testCase('parserNII', {
    setUp : function() {

      var parser = new X.io.parserNII();

      console.log('use parser:', parser);

      this.parser = parser;

    },
    "classname" : function() {
      assert(this.parser.classname, 'io.parserNII');
    }
  });

});