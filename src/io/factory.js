goog.provide('X.io.factory_');

goog.require('X.io');
goog.require('X.io.extensions');
goog.require('X.io.parserNII');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrManager');
goog.require('goog.structs.Map');

/**
 * @constructor
 * @private
 */
X.io.factory_ = function() {

  /**
   *
   */
  this._xhr_manager = new goog.net.XhrManager();

  // listen to success events
  goog.events.listen(this._xhr_manager, goog.net.EventType.SUCCESS,
      X.io.factory_.prototype.onload_.bind(this));

  /**
   *
   */
  this._jobs = new goog.structs.Map();

  /**
   *
   */
  this._progress = 0;

  //window.console.log('XIO version 0.0.1.');

};

X.io.factory_.status = {
  INFLIGHT: 1,
  LOADED: 5,
  PARSED: 10
};


/**
 * @param uris
 * @param extension
 * @returns
 */
X.io.factory_.prototype.load = function(uris, extension) {
  
  var id = uris;

  if (goog.isArray(uris)) {

    // a list of URIs was passed
    // so we grab the first entry as the id
    id = uris[0];

  }

  var _extension = id.split('.').pop().toUpperCase();
  if (goog.isDefAndNotNull(extension)) {

    // an extension was manually specified
    _extension = extension.toUpperCase();

  }

  // check if this is a supported file type
  if (!(_extension in X.io.extensions)) {

    throw new Error('The ' + _extension + ' file format is not supported.');

  }

  // TODO local files and multiple files

  // add the loadable
  var item = new X.io.factory_.item(uris, X.io.factory_.status.INFLIGHT);
  this._jobs.set(id, item);

  // start the xhr request
  var c = this._xhr_manager.send(id, item._uris);

  // .. and listen to progress events
  goog.events.listen(c.xhrIo.xhr_, goog.net.EventType.PROGRESS,
      X.io.factory_.prototype.onloading_.bind(this, id));

  return id;

};


X.io.factory_.prototype.onloading_ = function(id, e) {

  // update progress of individual job
  var _item = this._jobs.get(id);
  _item._total = e.event_.total;
  _item._loaded = e.event_.loaded;

  // calculate individual percentage
  var _progress = Math.floor(_item._loaded / _item._total * 100);

  // call individual callback
  eval("X.io.onloading('" + id + "'," + _progress + ")");

  // check the progress of all jobs
  var _total = 0;
  var _loaded = 0;

  var _jobs = this._jobs.getKeyIterator();
  goog.iter.forEach(_jobs, function(id) {

    _total += (this._jobs.get(id)._total);
    _loaded += (this._jobs.get(id)._loaded);

  }.bind(this));

  // calculate global percentage
  _progress = Math.floor(_loaded / _total * 100);

  if (_progress > this._progress) {

    // only call the onprogress callback if the
    // percentage increased
    // with id=null since it is the flobalprogress
    this._progress = _progress;
    eval("X.io.onloading(" + null + "," + this._progress + ")");

  }

};

/**
 * @param e
 */
X.io.factory_.prototype.onload_ = function(e) {

  // mark this job as loaded
  var id = e.id;
  this._jobs.get(id)._status = X.io.factory_.status.LOADED;

  // call individual callback
  eval("X.io.onload('" + id + "')");
  // and start parsing
  setTimeout(X.io.factory_.parse_.bind(this, id), 10);


  // check if all jobs were completed
  var _all_completed = true;

  var _jobs = this._jobs.getKeyIterator();
  goog.iter.forEach(_jobs, function(id) {

    if (this._jobs.get(id)._status != X.io.factory_.status.LOADED) {

      _all_completed = false;

    }

  }.bind(this));

  if (_all_completed) {

    this._progress = 0;

    eval("X.io.onload("+null+")");

  }

};


X.io.factory_.parse_ = function(id) {

  window.console.log('parsing', id);

};




/**
 * @constructor
 */
X.io.factory_.item = function(uris, status) {

  this._uris = uris;
  this._status = status;
  this._data = null;
  this._total = 0;
  this._loaded = 0;

};


X.io.factory = new X.io.factory_();

goog.exportSymbol('X.io.load', X.io.factory.load.bind(X.io.factory));