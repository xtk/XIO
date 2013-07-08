/**
 * unit test settings for BusterJS.
 */
var config = module.exports;

config['xio_development'] = {
  rootPath : "../",
  environment : "browser",
  resources : [ "lib/google-closure-library/closure/goog/**/*.js", "src/**/*.js" ],
  libs : [ "lib/google-closure-library/closure/goog/base.js",
      "lib/google-closure-library/closure/goog/deps.js", "xio-deps.js",
      "test/requires.js" ],
  tests : [ 'test/parserNII-test.js', 'test/parserFSM-test.js', ]
};

config['xio_build'] = {
  rootPath : "../",
  environment : "browser",
  libs : [ "bin/xio.js" ],
  tests : [ 'test/parserNII-test.js', 'test/parserFSM-test.js', ]
};
