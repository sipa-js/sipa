/**
 * SipaOnsenHooks
 *
 * App hook manager extending SipaHooks with additional hooks for OnsenUI (mobile).
 */

class SipaOnsenHooks extends SipaHooks {

    /**
     * Set, remove or trigger event 'beforeShowPage'.
     *
     * @example
     *
     * SipaOnsenHooks.beforeShowPage('on', () => {
     *   console.log("This is run before onShow() of any page is executed!");
     * });
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
     * Set, remove or trigger event 'beforeHidePage'.
     *
     * @example
     *
     * SipaOnsenHooks.beforeHidePage('on', () => {
     *  console.log("This is run before onHide() of any page is executed!");
     * });
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
        self._before_hide_page_functions = [];
        super.reset();
    }

    // ------------ helpers ------------

}

SipaOnsenHooks._before_hide_page_functions = [];