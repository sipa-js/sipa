/**
 * fire-once
 *
 * Javascript library that ensures that an irregularly but frequently event is fired only once at the given period.
 *
 * @version 0.0.6
 * @date 2024-06-20T07:42:58.952Z
 * @link https://github.com/magynhard/fire-once
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */

/**
 * FireOnce
 *
 * Run specified functions only once within a specified period
 * for performance reasons
 *
 * Example:
 *  If the fire function was called 5 times within one second (period: 1000),
 *  it will actually called only two times: It will be immediately be called at the first call and then once again after 1000ms
 */
class FireOnce {
    /**
     *
     * @param {string} identifier for the function
     * @param {function} func function to run
     * @param {Object} options
     * @param {Number} options.period period in ms where function is maximal called once
     * @param {'both' | 'start' | 'end'} options.type='both' call pattern
     * @returns {boolean} true if directly fired, false if stacked
     */
    static fire(identifier, func, options = {period: 1000}) {
        const self = FireOnce;
        options ??= {};
        options.period ??= 1000;
        let fun = self._functions[identifier];
        if (!fun) {
            fun = self._functions[identifier] = {};
            fun.stack_count = 0;
            fun.last_call = new Date(Date.now() - options.period);
        }
        fun.func = func;
        fun.options = options;
        ++fun.stack_count;
        return self._fire(fun);
    }

    /**
     * @param {FireOnce.FireFunction} fire_function
     * @return {boolean} true if directly fired, false if stacked
     * @private
     */
    static _fire(fire_function) {
        const self = FireOnce;
        if (self._readyToFire(fire_function)) {
            fire_function.func();
            fire_function.last_call = new Date();
            fire_function.stack_count = 0;
        } else {
            if (fire_function.stack_count === 1) {
                setTimeout(() => {
                    self._fire(fire_function);
                }, self._readyInMs(fire_function))
            }
            ++fire_function.stack_count;
        }
    }

    /**
     * @param {FireOnce.FireFunction} fire_function
     * @returns {boolean}
     * @private
     */
    static _readyToFire(fire_function) {
        return (new Date()) - fire_function.last_call >= fire_function.options.period;
    }

    /**
     * @param {FireOnce.FireFunction} fire_function
     * @returns {number} in ms, 0 if already ready
     * @private
     */
    static _readyInMs(fire_function) {
        const ready_ms = fire_function.options.period - ((new Date()) - fire_function.last_call);
        if (ready_ms < 0) {
            return 1;
        } else {
            return ready_ms + 1;
        }
    }
}

/**
 * @type {Object.<string, FireOnce.FireFunction>}
 * @private
 */
FireOnce._functions = {};

/**
 * Type definition of a fire function object
 * @typedef {Object} FireOnce.FireFunction
 * @property {function} func
 * @property {Number} stack_count
 * @property {Date} last_call
 * @property {Object} options
 * @property {Number} options.period
 */




