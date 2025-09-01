/**
 * SipaHooks
 *
 * App hook manager
 */

class SipaHooks {

    /**
     * Set, remove or trigger event 'beforeInitPage'
     *
     * @example
     *
     * SipaHooks.beforeInitPage('on', () => {
     *     console.log("This is run before onInit() of any page is executed!");
     * });
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeInitPage(type, func, page_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }


    /**
     * Set, remove or trigger event 'beforeShowPage'.
     *
     * @example
     *
     * SipaHooks.beforeShowPage('on', () => {
     *   console.log("This is run before onShow() of any page is executed!");
     * });
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeShowPage(type, func, page_id) {
        const self = SipaHooks;
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
     * Set, remove or trigger event 'beforeDestroyPage'.
     *
     * @example
     *
     * SipaHooks.beforeDestroyPage('on', () => {
     *     console.log("This is run before onDestroy() of any page is executed!");
     * });
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeDestroyPage(type, func, page_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeInitLayout'.
     *
     * @example
     *
     * SipaHooks.beforeInitLayout('on', () => {
     *     console.log("This is run before onInit() of any layout is executed!");
     * });
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} layout_id
     */
    static beforeInitLayout(type, func, layout_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_layout_functions, layout_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyLayout'.
     *
     * @example
     *
     * SipaHooks.beforeDestroyLayout('on', () => {
     *     console.log("This is run before onDestroy() of any layout is executed!");
     * });
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} layout_id
     */
    static beforeDestroyLayout(type, func, layout_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_layout_functions, layout_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    // ------------ reset ------------

    /**
     * Reset all hooks
     */
    static reset() {
        const self = SipaHooks;
        self._before_init_page_functions = [];
        self._before_show_page_functions = [];
        self._before_destroy_page_functions = [];
        self._before_init_layout_functions = [];
        self._before_destroy_layout_functions = [];
    }

    // ------------ helpers ------------

    static _addFunction(array, func) {
        // register only if not already set
        if (array.indexOf(func) === -1) {
            array.push(func);
        }
    }

    static _removeFunction(array, func) {
        if (typeof func === 'function') {
            let index = array.indexOf(func);
            if (index !== -1) {
                delete array[index];
            }
        }
    }

    static _triggerFunctions(array, element_id) {
        array.forEach((fun) => {
            if (typeof fun === 'function') {
                fun(element_id);
            }
        });
    }
}

SipaHooks._before_init_page_functions = [];
SipaHooks._before_show_page_functions = [];
SipaHooks._before_destroy_page_functions = [];
SipaHooks._before_init_layout_functions = [];
SipaHooks._before_destroy_layout_functions = [];


/**
 * @typedef {'on'|'off'|'trigger'} SipaHooks.HookType
 */