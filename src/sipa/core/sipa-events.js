/**
 * SipaEvents
 *
 * The SipaEvents class provides a simple event system where you can define valid event names,
 * subscribe to events with callback functions, unsubscribe from events, and trigger events with optional parameters.
 *
 * Typical use cases are:
 * - A component wants to notify other components or business logic about changes.
 * - A component wants to react on changes of other components.
 * - A component wants to provide hooks for business logic.
 *
 * A typical way, to integrate SipaEvents in your class is to provide an events() method that returns an instance
 * of SipaEvents as shown in the example below.
 *
 * The amount of params is not limited. You can pass as many params as you want to the callback function.
 *
 * @example
 *
 *  // To extend a class with events, the suggested pattern is the following, directly defining the valid event names at initialization:
 *  class MyClass {
 *    // ...
 *
 *    events() {
 *           return this._events ??= new SipaEvents(['click','delete','update']);
 *    }
 *
 *    onClick() {
 *           this.events().trigger('click', [param1, param2, param3, ...], options);
 *    }
 *  }
 *
 *  m = new MyClass();
 *  m.events().subscribe('click', (param1, param2, param3, ...) => {
 *      console.log("There was a click on my class ...");
 *  });
 *
 */
class SipaEvents {
    /**
     * Valid event names for better error handling.
     * When a user tries to subscribe or trigger an event name that is not in this list, an error is thrown.
     * @type {Array<string>}
     * @private
     */
    _valid_event_names = [];
    /**
     * Here we store registered events.
     * @type {Object<string,Array<function>>}
     * @private
     */
    _event_registry = {};
    /**
     * Create a new SipaEvents instance with the given valid event names.
     *
     * Valid element names ensure that only known events are used and will otherwise throw an error.
     *
     * @example
     *
     * const my_sipa_events = new SipaEvents('click','delete','update');
     *
     * @param {...string} [valid_event_names] define the available, valid event names
     */
    constructor(...valid_event_names) {
        if(valid_event_names.length === 0) {
            throw new Error(`SipaEvent constructor: No event names parameter given!`);
        }
        valid_event_names = valid_event_names.flatten();
        const has_duplicates = _.uniq(valid_event_names).length !== valid_event_names.length;
        if(has_duplicates) {
            throw new Error(`Sipa Event constructor: Duplicate event names! [${valid_event_names.map(e => `"${e}"`).join(",")}]`);
        }
        this._valid_event_names = valid_event_names.flatten().map(e => e.toString());
    }

    /**
     * Subscribe to an event with a callback function.
     *
     * @example
     *
     * my_sipa_events.subscribe('click', (param1, param2, param3, ...) => {
     *     console.log("There was a click on my class ...");
     *     // do something with param1, param2, param3, ...
     * });
     *
     * @param {string} event_name must be one of this._valid_event_names
     * @param {function} callback
     * @throws {Error} when event_name is not valid
     */
    subscribe(event_name, callback) {
        this._validateEventName(event_name);
        if (typeof callback === 'function') {
            this._event_registry[event_name] ??= [];
            if (this._event_registry[event_name].indexOf(callback) !== -1) {
                console.warn(`Tried to subscribe event '${event_name}' again with same call back function '${callback.name}'. Ignored.`);
            } else {
                this._event_registry[event_name].push(callback);
            }
        } else {
            console.error("Given parameter is not a valid function. It is of type '" + Typifier.getType(callback) + "'");
        }
    }

    /**
     * Unsubscribe from an event that has been subscribed before.
     *
     * The callback function must be the same function reference as used in subscribe().
     *
     * @example
     *
     * my_sipa_events.unsubscribe('click', my_callback_function);
     *
     * @param {string} event_name
     * @param {function} callback
     * @throws {Error} when event_name is not valid
     */
    unsubscribe(event_name, callback) {
        this._validateEventName(event_name);
        let index = this._event_registry[event_name]?.indexOf(callback) ?? -1;
        if(index !== -1) {
            delete this._event_registry[event_name][index];
            this._event_registry[event_name] = this._event_registry[event_name].filter(x => !!x);
        } else {
            console.warn(`Tried to unsubscribe event '${event_name}' of a call back that was not subscribed. Ignored.`);
        }
    }

    /**
     * Unsubscribe all subscriptions of the given event name.
     *
     * Usually you should only use the unsubscribe() method to unsubscribe. Use this method with care!
     *
     * @example
     *
     * my_sipa_events.unsubscribeAll('click');
     *
     * @param {string} event_name
     * @throws {Error} when event_name is not valid
     */
    unsubscribeAll(event_name) {
        if(this._event_registry[event_name]) {
            delete this._event_registry[event_name];
        }
    }

    /**
     * Trigger all registered events of event_name to be called with the given params.
     *
     * @example
     *
     * my_sipa_events.trigger('click', [param1, param2, param3, ...], { validate: true });
     *
     * @param {String} event_name
     * @param {Array<any>} [msg=[]] params to pass to the created event function
     * @param {Object} [options]
     * @param {boolean} [options.validate=true] validate the given event name to be valid. Can make sense to disable this when the registration might happen later, or you have optional subscribers.
     * @throws {Error} when event_name is not valid
     */
    trigger(event_name, msg, options) {
        options ??= {};
        options.validate ??= true;
        if(options.validate) {
            this._validateEventName(event_name);
        }
        msg ??= [];
        if(Typifier.isArray(this._event_registry[event_name])) {
            this._event_registry[event_name].eachWithIndex((callback) => {
                callback(...msg);
            });
        }
    }

    /**
     * Unsubscribes all subscriptions of any event.
     *
     * This will reset the event registry to an empty state.
     *
     */
    reset() {
        this._event_registry = {};
    }

    /**
     * Extend valid event names dynamically.
     *
     * Valid element names ensure that only known events are used and will otherwise throw an error.
     *
     * @example
     *
     * // add some new event valid names
     * my_sipa_events.createEvents("turn_on","some_other_event");
     *
     * @param {...string} event_names
     */
    createEvents(...event_names) {
        this._valid_event_names = _.uniq(this._valid_event_names.concat(event_names.flatten()));
    }

    /**
     * Delete valid event names dynamically
     *
     * @example
     *
     * // delete some event valid names
     * my_sipa_events.deleteEvents("turn_on","some_other_event");
     *
     * @param {...string} event_names
     */
    deleteEvents(...event_names) {
        event_names ??= [];
        event_names.eachWithIndex((name) => {
            const index = this._valid_event_names.indexOf(name);
            if(index !== -1) {
                delete this._valid_event_names[index];
            }
        });
        this._valid_event_names = this._valid_event_names.filter(x => !!x);
    }

    /**
     * Get all valid (registered) event names.
     *
     * @example
     *
     * my_sipa_events.getValidEventNames();
     * // returns ['click','delete','update']
     *
     * @returns {Array<string>}
     */
    getValidEventNames() {
        return this._valid_event_names;
    }

    /**
     * Ensure that the given event_name is defined in _valid_element_names, otherwise throw an error.
     *
     * @param {String} event_name
     * @private
     */
    _validateEventName(event_name) {
        if (!this._valid_event_names.includes(event_name)) {
            throw new Error(`Invalid event '${event_name}'. Valid events are: ${this._valid_event_names.join(' ')}`);
        }
    }
}
