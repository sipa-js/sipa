/**
 * SipaOnsenHooks
 *
 * App hook manager
 */

class SipaOnsenHooks extends SipaHooks {

    /**
     * Set, remove or trigger event 'beforeShowPage'
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeShowPage(type, func, page_id) {
        const self = SipaOnsenHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_show_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_show_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_show_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeHidePage'
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeHidePage(type, func, page_id) {
        const self = SipaOnsenHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_hide_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_hide_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_hide_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    // ------------ reset ------------

    static reset() {
        const self = SipaOnsenHooks;
        self._before_show_page_functions = [];
        self._before_hide_page_functions = [];
        super.reset();
    }

    // ------------ helpers ------------

}

SipaOnsenHooks._before_show_page_functions = [];
SipaOnsenHooks._before_hide_page_functions = [];