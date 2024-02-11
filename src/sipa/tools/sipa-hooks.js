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
     * SipaHooks.beforeInitPage('on', () => {
     *     console.log("This is run before onInit() of any page is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeInitPage(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_page_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyPage'
     *
     * @example
     * SipaHooks.beforeDestroyPage('on', () => {
     *     console.log("This is run before onDestroy() of any page is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeDestroyPage(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_page_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeInitLayout'
     *
     * @example
     * SipaHooks.beforeInitLayout('on', () => {
     *     console.log("This is run before onInit() of any layout is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeInitLayout(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_layout_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyLayout'
     *
     * @example
     * SipaHooks.beforeDestroyLayout('on', () => {
     *     console.log("This is run before onDestroy) of any layout is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeDestroyLayout(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_layout_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    // ------------ reset ------------

    static reset() {
        const self = SipaHooks;
        self._before_init_page_functions = [];
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

    static _triggerFunctions(array) {
        array.forEach((fun) => {
            if (typeof fun === 'function') {
                fun();
            }
        });
    }
}

SipaHooks._before_init_page_functions = [];
SipaHooks._before_destroy_page_functions = [];
SipaHooks._before_init_layout_functions = [];
SipaHooks._before_destroy_layout_functions = [];


/**
 * @typedef {'on'|'off'|'trigger'} SipaHooks.HookType
 */