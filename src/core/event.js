
// provides
goog.provide('X.io.event');
goog.provide('X.io.events');

// events provided
goog.provide('X.io.event.ParsingEvent');
goog.provide('X.io.event.ParseEvent');

// requires
goog.require('X.io');
goog.require('goog.events');
goog.require('goog.events.Event');



/**
 * The super class for all events in XIO.
 * 
 * @constructor
 * @param {string} type A type identifier for this event.
 * @extends goog.events.Event
 */
X.io.event = function(type) {

  //
  // call the default event constructor
  goog.base(this, type);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._classname = 'event';
  
};
// inherit from goog.events.Event
goog.inherits(X.io.event, goog.events.Event);


/**
 * The events of this class.
 * 
 * @enum {string}
 */
X.io.events = {
    
  PARSING: goog.events.getUniqueId('parsing'),
  
  PARSE: goog.events.getUniqueId('parse')

};


/**
 * 
 * 
 * @constructor
 * @extends X.io.event
 */
X.io.event.ParsingEvent = function(job, progress) {

  // call the default event constructor
  goog.base(this, X.io.events.PARSING);
  
  /**
   * 
   * 
   * @type {!number}
   * @protected
   */
  this._progress = progress;
  
  this._job = job;
  
};
// inherit from goog.events.Event
goog.inherits(X.io.event.ParsingEvent, X.io.event);

/**
 * 
 * 
 * @constructor
 * @extends X.io.event
 */
X.io.event.ParseEvent = function(job) {

  // call the default event constructor
  goog.base(this, X.io.events.PARSE);
  
  this._job = job;
  
};
// inherit from goog.events.Event
goog.inherits(X.io.event.ParseEvent, X.io.event);



