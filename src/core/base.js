// provides
goog.provide('X.io.base');

// requires
goog.require('X.io');
goog.require('goog.events.EventTarget');


/**
 * The superclass for all X.io.base-objects. All derived objects will be registered
 * for event handling.
 * 
 * @constructor
 * @extends goog.events.EventTarget
 */
X.io.base = function() {

  //
  // register this class within the event system by calling the superclass
  // constructor
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {!string}
   * @protected
   */
  this._classname = 'base';
  
  /**
   * The unique id of this instance.
   * 
   * @type {!number}
   * @protected
   */
  this._id = 0;//X.counter++;
  
  /**
   * The 'dirty' flag of this instance.
   * 
   * @type {!boolean}
   * @protected
   */
  this._dirty = false;
  
};
// enable events
goog.inherits(X.io.base, goog.events.EventTarget);


Object.defineProperty(X.io.base.prototype, 'classname', {
  /** 
   * Get the classname of this instance.
   * 
   * @return {!string} Returns the classname. 
   * @this {X.io.base} 
   * 
   */
  get : function() {
    return this._classname;
  }
});

Object.defineProperty(X.io.base.prototype, 'id', {
  /** 
   * Get the unique id of this instance.
   * 
   * @return {!number} Returns the id. 
   * @this {X.io.base} 
   * 
   */
  get : function() {
    return this._id;
  }
});

Object.defineProperty(X.io.base.prototype, 'dirty', {
  /** 
   * Check if this instance was modified.
   * 
   * @return {!boolean} Returns TRUE if this instance was modified, FALSE otherwise. 
   * @this {X.io.base} 
   * 
   */
  get : function() {
    return this._dirty;
  },
  /** 
   * Mark this instance as modified (==dirty) or clean.
   * 
   * @param {!boolean} dirty TRUE if this instance was modified, FALSE otherwise. 
   * @this {X.io.base}
   * 
   */  
  set : function(dirty) {
    this._dirty = dirty;
  }
});

