goog.provide('X.io.factory_');

goog.require('X.io');
goog.require('X.io.extensions');
goog.require('X.io.file');
goog.require('X.io.job');
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

  // listen to ready events, meaning that a file is now LOADING
  goog.events.listen(this._xhr_manager, goog.net.EventType.READY,
      X.io.factory_.prototype.on_xhrmanager_ready_.bind(this));

  /**
   *
   */
  this._jobs = new goog.structs.Map();

  this._files = new goog.structs.Map();

  /**
   *
   */
  this._progress = 0;

  // window.console.log('XIO version 0.0.1.');

};

X.io.factory_.status = {
  QUEUED : 0,
  LOADING : 1,
  LOAD : 2,
  PARSING : 3,
  PARSED : 4,
  COMPLETE : 10
};

/**
 * @param uri
 * @param extension
 * @returns
 */
X.io.factory_.prototype.load = function(uri, extension) {

  var id = uri;

  if ( goog.isArray(uri) ) {

    // a list of URIs was passed
    // so we grab the first entry as the id
    id = uri[0];

  } else {

    // wrap the single uri in an array
    uri = [ uri ];

  }

  var _extension = id.split('.').pop().toUpperCase();
  if ( goog.isDefAndNotNull(extension) ) {

    // an extension was manually specified
    _extension = extension.toUpperCase();

  }

  // check if this is a supported file type
  if ( !(_extension in X.io.extensions) ) {

    throw new Error('The ' + _extension + ' file format is not supported.');

  }

  // create a new X.io.job
  var _job = new X.io.job(id, _extension, X.io.factory_.status.QUEUED);

  // TODO local files

  for ( var u in uri) {

    // grab the current uri
    u = uri[u];

    // setup the file
    var _file = new X.io.file(_job, u, _extension, X.io.factory_.status.QUEUED);

    // add the file to the global files map for easy access
    this._files.set(u, _file);

    // keep a reference to this file in the job
    _job._files.push(_file);

    var response_type = X.io.extensions[_extension].response_type;

    // queue this xhr request
    // note: now we listen to the xhrmanager ready event to know when the
    // loading actually starts
    this._xhr_manager.send(u, u, undefined, undefined, undefined, undefined,
        undefined, undefined, response_type);

  }

  // add the job
  this._jobs.set(id, _job);

  return id;

};

X.io.factory_.prototype.on_xhrmanager_ready_ = function(e) {

  // this gets called when a new xhrIo object is freed by the xhrmanager
  // and a queued xhrIo request was associated
  goog.events.listenOnce(e.xhrIo, goog.net.EventType.READY_STATE_CHANGE,
      X.io.factory_.prototype.on_xhr_ready_.bind(this, e.id));

};

X.io.factory_.prototype.on_xhr_ready_ = function(uri, e) {

  // mark this file as LOADING
  var _file = this._files.get(uri);
  _file._status = X.io.factory_.status.LOADING;

  // .. and also mark the associated job as LOADING
  _file._job._status = X.io.factory_.status.LOADING;

  // now is the time to listen to a progress event of the real xhr
  goog.events.listen(e.target.xhr_, goog.net.EventType.PROGRESS,
      X.io.factory_.prototype.onloading_.bind(this, uri));

};

X.io.factory_.prototype.onloading_ = function(uri, e) {

  // update progress of this file
  var _file = this._files.get(uri);

  _file._total = e.event_.total;
  _file._loaded = e.event_.loaded;

  // grab the job of this file
  var _job = _file._job;

  _job._total = 0;
  _job._loaded = 0;

  // .. and grab the progress of all associated files
  for ( var f in _job._files) {

    f = _job._files[f];
    _job._total += f._total;
    _job._loaded += f._loaded;

  }

  // fire the callback with the job id and the job progress
  var _progress = Math.floor(_job._loaded / _job._total * 100);
  eval("X.io.onloading('" + _job._id + "'," + _progress + ")");

  // update the global progress by merging the progress of all
  // jobs
  var _total = 0;
  var _loaded = 0;

  var _jobs = this._jobs.getValueIterator();
  goog.iter.forEach(_jobs, function(job) {

    _total += job._total;
    _loaded += job._loaded;

  }.bind(this));

  // calculate global percentage
  _progress = Math.floor(_loaded / _total * 100);

  if ( _progress > this._progress ) {

    // only call the onloading callback if the
    // percentage increased
    // with id=null since it is the global progress
    this._progress = _progress;
    eval("X.io.onloading(" + null + "," + this._progress + ")");

  }

};

/**
 * @param e
 */
X.io.factory_.prototype.onload_ = function(e) {

  // update status of this file
  var _file = this._files.get(e.id);
  _file._status = X.io.factory_.status.LOAD;

  // and attach the data
  _file._data = e.xhrIo.getResponse();

  // grab the job of this file
  var _job = _file._job;

  // .. and check the status of all associated files
  for ( var f in _job._files) {

    f = _job._files[f];
    if ( f._status != X.io.factory_.status.LOAD ) {

      // at least one file is still loading, so exit here
      return;

    }

  }

  // all files of this job are fully loaded
  _job._status = X.io.factory_.status.LOAD;

  // fire the job callback
  eval("X.io.onload('" + _job._id + "')");
  // and start parsing
  setTimeout(X.io.factory_.parse_.bind(this, _job._id), 10);

  // now check if all jobs are fully loaded
  var _fully_loaded = true;
  var _jobs = this._jobs.getValueIterator();
  goog.iter.forEach(_jobs, function(job) {

    if ( job._status != X.io.factory_.status.LOAD ) {

      // at least one job is still loading, so exit here
      _fully_loaded = false;

    }

  }.bind(this));

  if ( _fully_loaded ) {

    // everything was loaded, so reset all variables/maps
    this._progress = 0;

    // and fire the onload callback
    eval("X.io.onload(" + null + ")");

  }

};

X.io.factory_.parse_ = function(id) {

  window.console.log('parsing', id);

};

// attach the factory to the X.io namespace
X.io.factory = new X.io.factory_();
// and alias the X.io.factory_.prototype.load function as X.io.load
goog.exportSymbol('X.io.load', X.io.factory.load.bind(X.io.factory));
