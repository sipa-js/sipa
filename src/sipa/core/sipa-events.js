/**
 * SipaEvents
 *
 * Provides adding and triggering customized events.
 *
 * @example
 *
 *  // To add to a class, the suggested pattern is
 *
 *  events() {
 *         return this._events ??= new SipaEvents(['click','delete','update']);
 *  }
 *
 */
class SipaEvents {
    /**
     * Valid event names for better error handling.
     * @type {Array<string>}
     * @private
     */
    _valid_event_names = [];
    /**
     * Here we store registered events
     * @type {Object<string,Array<function>>}
     */
    _event_registry = {};
    /**
     * @param {...string} valid_event_names define the available event names
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
     *
     * @param {string} event_name must be one of this._valid_event_names
     * @param {function} callback
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
     * @param {string} event_name
     * @param {function} callback
     */
    unsubscribe(event_name, callback) {
        this._validateEventName(event_name);
        let index = this._event_registry[event_name].indexOf(callback);
        if(index !== -1) {
            delete this._event_registry[event_name][index];
        } else {
            console.warn(`Tried to unsubscribe event '${event.name}' of a call back that was not subscribed. Ignored.`);
        }
    }

    /**
     * Calls all registered events of event_name
     * @param {String} event_name
     * @param {Object} msg params to pass to the created event function
     */
    trigger(event_name, ...msg) {
        this._validateEventName(event_name);
        if(Typifier.isArray(this._event_registry[event_name])) {
            this._event_registry[event_name].eachWithIndex((callback) => {
                callback(...msg);
            });
        }
    }

    /**
     * Unsubscribes all subscriptions of any event
     */
    reset() {
        this._event_registry = {};
    }

    addValidEventNames(...event_names) {
        this._valid_event_names = _.uniq(this._valid_event_names.concat(event_names.flatten()));
    }

    /**
     * Ensure that the given event_name is defined in VALID_ELEMENT_NAMES
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
