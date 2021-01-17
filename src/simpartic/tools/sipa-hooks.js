/**
 * SipaHooks
 * 
 * App hook manager
 */

class SipaHooks {

    /**
     * Set, remove or trigger event 'beforeInitPage'
     * 
     * @param {('on','off','trigger')} type
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
     * @param {('on','off','trigger')} type
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
     * @param {('on','off','trigger')} type
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
     * @param {('on','off','trigger')} type
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