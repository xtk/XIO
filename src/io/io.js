goog.provide('X.io');

goog.require('X');
goog.require('goog.net.EventType');
goog.require('goog.net.XhrManager');
goog.require('goog.structs.Map');

/**
 * @constructor
 * @private
 */
X.io_ = function() {

  this._xhr_manager = new goog.net.XhrManager();
  goog.events.listen(this._xhr_manager, goog.net.EventType.SUCCESS,
      X.io_.prototype.oncomplete_.bind(this));
  this._jobs = new goog.structs.Map();

  this._progress = 0;

  window.console.log('XIO version 0.0.1.');

};

X.io_.status = {
  INFLIGHT: 1,
  LOADED: 5,
  PARSED: 10
};

X.io_.prototype.add = function(uris, extension) {

  var id = uris;

  if (goog.isArray(uris)) {

    // a list of URIs was passed
    // so we grab the first entry as the id
    id = uris[0];

  }

  // TODO local files

  // add the loadable
  var item = new X.io_.item(uris, X.io_.status.INFLIGHT);
  this._jobs.set(id, item);


  // start the xhr request
  var c = this._xhr_manager.send(id, item._uris);

  // .. and listen to progress events
  goog.events.listen(c.xhrIo.xhr_, goog.net.EventType.PROGRESS,
      X.io_.prototype.onprogress_.bind(this, id));

  return id;

};

X.io_.prototype.load = function() {

  var _jobs = this._jobs.getKeyIterator();

  goog.iter.forEach(_jobs, function(id) {

    // grab the current job item
    var item = this._jobs.get(id);

    // start the xhr request
    var c = this._xhr_manager.send(id, item._uris);

    // .. and listen to progress events
    goog.events.listen(c.xhrIo.xhr_, goog.net.EventType.PROGRESS,
        X.io_.prototype.onprogress_.bind(this, id));


  }.bind(this));

};

X.io_.prototype.oncomplete_ = function(e) {

  //window.console.log('oncomplete', e);
  X.io.oncomplete();

};



X.io_.prototype.onprogress_ = function(id, e) {

//  var _e = e.event_;
//
//  var _progress = Math.floor(_e.loaded / _e.total * 100);
//
//  this._jobs.get(id)._progress = _progress;
//
//  this.globalprocess();

  var _e = e.event_;

  var _item = this._jobs.get(id);

    _item._total = _e.total;

    _item._loaded = _e.loaded;

  this.globalprocess();

};

X.io_.prototype.globalprocess = function() {

  var _jobs = this._jobs.getKeyIterator();

  var _total = 0;
  var _loaded = 0;

  goog.iter.forEach(_jobs, function(id) {

    _total += (this._jobs.get(id)._total);
    _loaded += (this._jobs.get(id)._loaded);

  }.bind(this));

  var _progress = Math.floor(_loaded / _total * 100);

  if (_progress>this._progress) {

    this._progress = _progress;
    X.io.onprogress(this._progress);

  }

};


/**
 * @constructor
 */
X.io_.item = function(uris, status) {

  this._uris = uris;
  this._status = status;
  this._data = null;
  this._total = 0;
  this._loaded = 0;

};


/**
 * The IO namespace and singleton access to all X.io-functions and -parsers.
 *
 * @const
 * @namespace
 */
X.io = new X.io_();


X.io.onprogress = function(progress) {

};

X.io.oncomplete = function() {

};


goog.exportSymbol('X.io', X.io);
goog.exportSymbol('X.io.prototype.add', X.io_.prototype.add);
goog.exportSymbol('X.io.prototype.load', X.io_.prototype.load);
