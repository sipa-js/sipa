/**
 * Simpartic
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version 0.1.0
 * @date 2021-01-17T18:47:17.288Z
 * @link https://github.com/magynhard/simpartic
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */
/**
 * Basic class for pages and layouts
 */
class SipaBasicView {
    static onInit() {
        // called when page has been loaded, before fade animation
    }

    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    static reinit() {
        this.onDestroy();
        this.onInit();
    }

    /**
     * Check if the current view is loaded
     *
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        if(self.type() === 'page') {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentPageId())).endsWith(self.className());
        } else {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentLayoutId())).endsWith(self.className());
        }
    }

    /**
     * Get the class name of the current view
     *
     * @returns {string}
     */
    static className() {
        return this.name;
    }

    /**
     * Get the type of the current view
     *
     * @returns {('page','layout')}
     */
    static type() {
        const self = SipaBasicView;
        if(self.className().endsWith('Page')) {
            return 'page';
        } else {
            return 'layout';
        }
    }
}
/**
 * SipaEnv
 *
 * Tool class with environment dependent methods
 */
class SipaEnv {
    /**
     * Get the current version of your app.
     *
     * The returned value within this method will automatically be
     * updated at every release build cycle
     *
     * @returns {string}
     */
    static version() {
        const obj = {
            "version": "0.0.1"
        }
        return obj.version;
    }

    /**
     * Check if Simpartic is running at localhost
     *
     * @returns {boolean} true if localhost, otherweise false
     */
    static isRunningLocalHost() {
        const host = window.location.hostname;
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled
     *
     * @param {string, any} text
     */
    static debugLog(text) {
        const self = SipaEnv;
        if(self.isDebugMode()) {
            console.warn(text);
        }
    }
}
/**
 * SipaHelper
 *
 * Tool helper class with common helper methods
 */
class SipaHelper {
    /**
     * Merge default options (source) with custom options (addition)
     *
     * Works only fine with one level depth, don't merge nested (Object) options, as references are copied then!
     *
     * @param {Object} source
     * @param {Object} addition
     * @returns {Object} merged object
     */
    static mergeOptions(source, addition) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'source', param_value: source, expected_type: 'Object'},
            {param_name: 'addition', param_value: addition, expected_type: 'Object'},
        ]);
        const merged = Object.assign({}, source);
        return Object.assign(merged, addition);
    }

    /**
     * Check if given variable is of type Array
     *
     * @param {any} value
     * @returns {boolean} true if Array, otherwise false
     */
    static isArray(value) {
        return value instanceof Array;
    }

    /**
     * Check if given variable is of type Object
     *
     * @param {any} value
     * @returns {boolean} true if Object, otherwise false
     */
    static isObject(value) {
        return value instanceof Object;
    }

    /**
     * Check if given variable is of type String
     *
     * @param {any} value
     * @returns {boolean} true if String, otherwise false
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * Check if given variable is of type Boolean
     *
     * @param {any} value
     * @returns {boolean} true if Boolean, otherwise false
     */
    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    /**
     * Check if given variable is of type Function
     *
     * @param {any} value
     * @returns {boolean} true if Function, otherwise false
     */
    static isFunction(value) {
        return typeof value === 'function';
    }

    /**
     * Get the type of the given value as pascal case formatted string
     *
     * @example
     *  'Object'
     *  'String'
     *  'Array'
     *  'MyClass'
     *
     * @param {any} value
     * @returns {string} type in pascal case format
     */
    static getType(value) {
        const self = SipaHelper;
        if (self.isArray(value)) {
            return 'Array';
        } else if (self.isObject(value)) {
            return 'Object';
        } else if (self.isString(value)) {
            return 'String';
        } else if (self.isBoolean(value)) {
            return 'Boolean';
        } else {
            let type = 'Unknown';
            if (value && value.constructor) {
                type = value.constructor;
            } else if (value && value.prop && value.prop.constructor) {
                type = value.prop.constructor;
            } else {
                type = typeof value;
            }
            return LuckyCase.toPascalCase(type);
        }
    }

    /**
     * Check the given parameter to be of the expected type.
     * If is is not valid, throw an exception.
     *
     * @param {Array<SipaParamValidation>} params
     * @throws {Error} throws an error if given parameter is not valid.
     */
    static validateParams(params = []) {
        const self = SipaHelper;
        if (self.getType(params) !== 'Array') {
            self.throwParamError('params', params, 'Array');
        } else {
            params.forEach((elem) => {
                if (self.getType(elem.param_value) !== elem.expected_type) {
                    self.throwParamError(elem.param_name, elem.param_value, elem.expected_type);
                }
            });
        }
    }

    static throwParamError(param_name, param, expected_type) {
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '" + ${SipaHelper.getType(param)}!`;
    }

    /**
     * Cut leading characters (string) from given text
     *
     * @example
     *  .cutLeadingCharacters('/some/path/is/that','/')
     *  // => 'some/path/is/that'
     *
     * @param {string} text to cut
     * @param {string} leading_characters to cut from text
     * @returns {string}
     */
    static cutLeadingCharacters(text, leading_characters) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'text', param_value: text, expected_type: 'String'},
            {param_name: 'leading_characters', param_value: leading_characters, expected_type: 'String'},
        ]);
        if (text.startsWith(leading_characters)) {
            return text.substr(leading_characters.length);
        } else {
            return text;
        }
    }

    /**
     * Cut trailing characters (string) from given text
     *
     * @example
     *  .cutLeadingCharacters('/some/path/file.ext','.ext')
     *  // => 'some/path/file'
     *
     * @param {string} text to cut
     * @param {string} trailing_characters to cut from text
     * @returns {string}
     */
    static cutTrailingCharacters(text, trailing_characters) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'text', param_value: text, expected_type: 'String'},
            {param_name: 'trailing_characters', param_value: trailing_characters, expected_type: 'String'},
        ]);
        if (text.endsWith(trailing_characters)) {
            return text.substr(0,text.indexOf(trailing_characters));
        } else {
            return text;
        }
    }
}

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} SipaParamValidation
 * @property {any} param_value
 * @property {string} param_name
 * @property {string} expected_type, e.g. 'Object', 'String, 'Array', ...
 */
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
/**
 * SipaPage
 *
 * Tool class with page loader with included router
 */
class SipaPage {
    /**
     * Load given page by page_id
     *
     * @param {string} page_id to load
     * @param {Object} options
     * @param {string} options.layout_id specify custom layout, overwrite default layout
     * @param {boolean} options.force_load=false force to load the page again, even if it is already loaded
     * @param {boolean} options.fade_effect=true use fade effect for the page container
     * @param {boolean} options.stack_page=true stack page in page history
     * @param {Object} options.params parameters to be set at the new page
     * @param {Array<String>} options.remove_params parameters to be removed at the new page
     * @param {function} options.success function to be called after successful loading
     * @param {function} options.error function to be called after loading fails
     * @param {function} options.always function to be called always after successful/erroneous loading
     */
    static load(page_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            layout_id: self.config.default_layout,
            force_load: false,
            fade_effect: true,
            stack_page: true
        }
        if(!options.layout_id && self.config.default_layouts && self.config.default_layouts.hasOwnProperty(page_id)) {
            options.layout_id = self.config.default_layouts[page_id];
        }
        options = SipaHelper.mergeOptions(default_options, options);
        page_id = self.extractIdOfTemplate(page_id, {type: 'page'});
        const last_page_id = self.currentPageId();
        const layout_id = self.extractIdOfTemplate(options.layout_id, {type: 'layout'});
        const page_path = self._makeFullPath(page_id, {type: 'page'});
        const j_body = $('body');
        j_body.attr('data-page-id', page_id);
        self.loadLayout(layout_id, {
            success: (data, text, response) => {
                $.ajax({
                    url: page_path,
                    method: 'GET',
                    dataType: 'html',
                    cache: true,
                    success: (data, text, response) => {
                        const j_container = $(self.page_container_css_selector);
                        const load_function = () => {
                            SipaHooks.beforeDestroyPage('trigger');
                            if (last_page_id) {
                                self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: page_id}]);
                            }
                            j_container.html(data);
                            SipaHooks.beforeInitPage('trigger');
                            if (options.fade_effect) {
                                j_container.fadeIn(150);
                            }
                            if (options.stack_page) {
                                self.stackHistoryState({page_id: page_id, layout_id: layout_id, options: options});
                            }
                            if (options.params) {
                                SipaUrl.setParams(options.params);
                            }
                            if (options.remove_params) {
                                SipaUrl.removeParams(options.remove_params);
                            }
                            self.callMethodOfPage(page_id, 'onInit', [{last_page_id: last_page_id}]);
                            if(SipaHelper.isFunction(options.success)) {
                                options.success(data, text, response);
                            }
                            if(SipaHelper.isFunction(options.always)) {
                                options.always(data, text, response);
                            }
                        }
                        if (options.fade_effect) {
                            j_container.fadeOut(50, load_function);
                        } else {
                            load_function();
                        }
                    },
                    error: (response, text, data) => {
                        j_body.attr('data-page-id', last_page_id);
                        if(SipaHelper.isFunction(options.error)) {
                            options.error(response, text, data);
                        }
                        if(SipaHelper.isFunction(options.always)) {
                            options.always(data, text, response);
                        }
                    }
                });
            }
        });
    }

    /**
     * Get the id only of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {('layout','page')} options.type='page'
     * @returns {string} absolute path
     */
    static extractIdOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        let id = SipaHelper.cutLeadingCharacters(template, '/');
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
        return LuckyCase.toDashCase(id);
    }

    /**
     * Get the class name of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {('layout','page')} options.type='page'
     * @returns {string} class name
     */
    static getClassNameOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const id = self.extractIdOfTemplate(template, options).replaceAll('/', '_');
        return LuckyCase.toPascalCase(id + '_' + options.type);
    }

    /**
     * Get the options of the given type
     *
     * @param {('page','layout')} type
     * @returns {TypeOptionsType} type options
     */
    static typeOptions(type) {
        const types = {
            page: {
                prefix: 'views/pages/',
                file_ext: '.html'
            },
            layout: {
                prefix: 'views/layouts/',
                file_ext: '.html'
            }
        };
        if (!types[type]) {
            throw `Invalid type '${type}'. Valid types are: ${Object.keys(types).join(' ')}`;
        }
        return types[type];
    }

    /**
     * Get page id of current loaded page
     *
     * @returns {string} page id
     */
    static currentPageId() {
        return $('body[data-page]').val();
    }

    /**
     * Get layout id of current loaded layout
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body[data-layout]').val();
    }

    /**
     * Load the given layout
     *
     * @param {string} layout_id to load
     * @param {Object} options
     * @param {boolean} options.fade_effect=true
     * @param {boolean} options.keep_page=false keep the loaded page, but change the layout only
     */
    static loadLayout(layout_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            fade_effect: true,
            success: null
        };
        options = SipaHelper.mergeOptions(default_options, options);
        const j_body = $('body');
        const layout_path = self._makeFullPath(layout_id, {type: 'layout'});
        const last_layout_id = self.currentLayoutId();
        j_body.attr('data-layout-id', layout_id);
        /**
         * @param {('success','always')} type
         */
        const after_loaded_function = (data, text, response, type) => {
            SipaHooks.beforeDestroyLayout('trigger');
            if (last_layout_id) {
                self.callMethodOfLayout(last_layout_id, 'onDestroy', [{next_layout_id: layout_id}]);
            }
            j_body.hide();
            j_body.html(data);
            SipaHooks.beforeInitLayout('trigger');
            self.callMethodOfLayout(layout_id, 'onInit', [{last_layout_id: last_layout_id}]);
            if (typeof options[type] === 'function') {
                options[type](data, text, response);
            }
            const layout_has_changed = last_layout_id !== layout_id;
            if (options.fade_effect && layout_has_changed) {
                j_body.fadeIn(150);
            } else {
                j_body.show();
            }
        };

        $.ajax({
            url: layout_path,
            method: 'GET',
            dataType: 'html',
            cache: true,
            success: (data, text, response) => {
                after_loaded_function(data, text, response, 'success');
            },
            always: (data, text, response) => {
                after_loaded_function(data, text, response, 'always');
            },
            error: (response, text, data) => {
                console.error(`Error ${response.status} - ${response.text} - could not load layout '${layout_path}'`);
                if (typeof options.error === 'function') {
                    options.error(response, text, data);
                }
            }
        });
    }

    /**
     * Call the given method of the given page with given parameters (optional)
     *
     * @param {string} page_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfPage(page_id, method_name, parameters = []) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'String'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'String'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const page_class = self.getClassNameOfTemplate(page_id, {type: 'page'});
        const class_exists = eval(`typeof ${page_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${page_class}.${function_name} === 'function'`);
            if (method_exists) {
                eval(`${page_class}.${function_name}(...parameters);`)
            }
        }
    }

    /**
     * Call the given method of the given layout with given parameters (optional)
     *
     * @param {string} layout_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfLayout(layout_id, method_name, parameters = []) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'String'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'String'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const layout_class = self.getClassNameOfTemplate(layout_id, {type: 'layout'});
        const class_exists = eval(`typeof ${layout_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${layout_class}.${function_name} === 'function'`);
            if (method_exists) {
                eval(`${layout_class}.${function_name}(...parameters);`)
            }
        }
    }

    /**
     * Ensure full path of given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {('layout','page')} options.type='page'
     * @returns {string} absolute path
     * @private
     */
    static _makeFullPath(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        const id_split = template.split('/');
        const file_name = id_split[id_split.length-1];
        let full_path = SipaHelper.cutLeadingCharacters(template, '/');
        full_path = SipaHelper.cutTrailingCharacters(full_path, type.file_ext);
        if (!full_path.startsWith(type.prefix)) {
            full_path = type.prefix + full_path;
        }
        full_path += '/' + file_name + type.file_ext;
        return full_path;
    }

    /**
     * Initialize the router for single page app browser history
     */
    static initHistoryState() {
        const self = SipaPage;
        // listen to browser back event
        window.onpopstate = (e) => {
            if (e.state && e.state.page_id) {
                const page_id = e.state.page_id;
                let options = e.state.options;
                // as we go back in history, we do not stack the previous page when loading it
                options.stack_page = false;
                if (page_id) {
                    self.load(page_id, options);
                }
            }
        }
    }

    /**
     * Stack the current page and layout state to the browser history
     *
     * @param {Object} state
     * @param {string} state.page_id
     * @param {string} state.layout_id
     * @param {Object} state.options
     * @param {boolean} replace_state=false
     */
    static stackHistoryState(state = {page_id: null, layout_id: null, options: null}, replace_state = false) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'state', param_value: state, expected_type: 'Object'},
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'Boolean'},
        ]);
        const original_url = SipaUrl.getUrl();
        let params = {page: page_id};
        if (replace_state) {
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        } else {
            window.history.pushState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        }
    }

    /**
     * Set the configuration of pages and layouts
     *
     * @example
     *   SipaPage.setConfig({
     *       // default layout for all pages
     *       default_layout: 'default',
     *       // specific layouts for some pages { <page-name>: <layout-name> }
     *       default_layouts: {
     *           // overwrites the layout for the page 'login-page' with layout 'mini-dialog'
     *           'login-page': 'mini-dialog'
     *       }
     *   });
     *
     * @param {Object} config
     * @param {string} config.default_layout
     * @param {Object} config.default_layouts
     */
    static setConfig(config) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
    }
}

SipaPage.page_container_css_selector = '#page-container';
SipaPage.initHistoryState();

/**
 * @type {SipaPageConfig}
 */
SipaPage.config = null;

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} TypeOptionsType
 * @property {string} prefix
 * @property {string} file_ext
 *
 *
 * @typedef {Object} SipaPageConfig
 * @param {string} default_layout
 * @param {Object} default_layouts
 */


/**
 * SipaUrl
 *
 * Tool class to access and manipulate
 * the current or given URLs
 */
class SipaUrl {
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the protocol of the current url (without colon)
     *
     * @returns {('http'|'https')}
     */
    static getProtocol() {
        return window.location.protocol.replace(':', '');
    }

    /**
     * Get the host name of the current url
     *
     * @example
     *      localhost
     *      127.0.0.1
     *      localhost:7000
     *      my-domain.com
     *
     * @returns {string}
     */
    static getHostName() {
        return window.location.hostname;
    }

    static getParams() {
        const self = SipaUrl;
        return self.getParamsOfUrl(self.getUrl());
    }

    /**
     * Set or overwrite given parameters of the current url
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     */
    static setParams(params) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: params, param_name: 'params', expected_type: 'Object'}]);
        const new_url = self.setParamsOfUrl(self.getUrl(), params);
        self._setUrl(new_url);
    }

    /**
     * Set or overwrite one specific parameter of the current url
     *
     * @param {string} param_key
     * @param {string} value
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'String'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
    }

    /**
     * Remove given params of the current url
     *
     * @param {Array<String>} param_keys
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self._setUrl(new_url);
    }

    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'String'}]);
        self.removeParams([param_key]);
    }

    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self._setUrl(new_url);
    }

    /**
     * Creates an url query string based on the given key<->value object
     *
     * @example
     *  { a: 1, b: [1,2,3], c: "test space" }
     *  =>
     *  'a=1&b=1&b=2&b=3&c=test%20space'
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @param {Object} options
     * @param {boolean} options.url_encode url encode parameter keys and values, default: true
     * @param {boolean} options.multi_param_attributes if attribute is of array, make it 'id=1&id=2&id=3' on true, or 'id=1,2,3' on false
     * @returns {string}
     */
    static createUrlParams(params, options = {}) {
        const default_options = {
            url_encode: true,
            multi_param_attributes: true
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const ret = [];
        for (let d in params) {
            let key = d;
            let value = params[d];
            if(SipaHelper.isArray(value) && options.multi_param_attributes) {
                if(options.url_encode) {
                    ret.push(
                        encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join('&' + encodeURIComponent(key) + '=')
                    );
                } else {
                    ret.push(
                        key + '=' + value.join(key + '=')
                    );
                }
            } else {
                if(options.url_encode) {
                    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
                } else {
                    ret.push(d + '=' + params[d]);
                }
            }
        }
        return ret.join('&');
    }

    /**
     * Create a JSON, containing the parameters of the given url
     *
     * @param {string} url the url to extract parameters from
     * @param {Object} options
     * @param {boolean} options.decode_uri decode uri parameter values
     * @returns {Object<string, string>} return a JSON with { param1: value1, param2: value2, ... }
     */
    static getParamsOfUrl(url, options = {}) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            decode_uri: true, // decode url variables
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : url;
        let obj = {};
        if (query_string) {
            query_string = self.removeAnchorOfUrl(query_string);
            // split our query string into its parts
            let arr = query_string.split('&');
            for (let i = 0; i < arr.length; i++) {
                // separate the keys and values
                let a = arr[i].split('=');
                // set parameter name and value (use 'true' if empty)
                let param_name = a[0];
                let param_value = typeof (a[1]) === 'undefined' ? true : a[1];
                if (options.decode_uri) {
                    param_value = decodeURIComponent(param_value);
                }
                // if the param_name ends with square brackets, e.g. colors[] or colors[2]
                if (param_name.match(/\[(\d+)?\]$/)) {
                    // create key if it doesn't exist
                    let key = param_name.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];
                    // if it's an indexed array e.g. colors[2]
                    if (param_name.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        let index = /\[(\d+)\]/.exec(param_name)[1];
                        obj[key][index] = param_value;
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(param_value);
                    }
                } else {
                    // we're dealing with a string
                    if (!obj[param_name]) {
                        // if it doesn't exist, create property
                        obj[param_name] = param_value;
                    } else if (obj[param_name] && typeof obj[param_name] === 'string') {
                        // if property does exist and it's a string, convert it to an array
                        obj[param_name] = [obj[param_name]];
                        obj[param_name].push(param_value);
                    } else {
                        // otherwise add the property
                        obj[param_name].push(param_value);
                    }
                }
            }
        }
        return obj;
    }

    /**
     * Remove the given parameters from the given url
     *
     * @param {string} url to remove the params from
     * @param {Array<String>} param_keys array of keys to remove from the given url, e.g. ['key1','key2'}
     * @returns {string}
     */
    static removeParamsOfUrl(url, param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_name: 'param_keys', param_value: param_keys, expected_type: 'Array'},
            {param_name: 'url', param_value: url, expected_type: 'String'},
        ]);
        let curr_params = Self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (curr_params[key]) {
                delete curr_params[key];
            }
        });
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
    }

    /**
     * Remove the given one parameter from the given url
     *
     * @param {string} url
     * @param {string} param_key name of the param
     */
    static removeParamOfUrl(url, param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: param_key, param_name: 'param_key', expected_type: 'String'},
            {param_value: url, param_name: 'url', expected_type: 'String'},
        ]);
        self.removeParamsOfUrl(url, [param_key]);
    }

    /**
     * Set/overwrite the parameters of the given url
     *
     * @param {string} url
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @returns {string} with given parameters
     */
    static setParamsOfUrl(url, params) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: params, param_name: 'params', expected_type: 'Object'},
            {param_value: url, param_name: 'url', expected_type: 'String'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
    }

    /**
     * Get the anchor of the given url
     *
     * @param {string} url
     * @param {object} options
     * @param {boolean} options.return_prefixed_hash return the prefixed hash
     * @returns {string} the anchor of the given url
     */
    static getAnchorOfUrl(url, options = {}) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            return_prefixed_hash: false
        }
        options = SipaHelper.mergeOptions(default_options, options);
        let prefix = '#';
        if (!options.return_prefixed_hash) {
            prefix = '';
        }
        if (url.indexOf('#') !== -1) {
            return prefix + url.split('#')[1];
        } else {
            return '';
        }
    }

    /**
     * Remove the anchor of the given url
     *
     * @param {string} url
     * @returns {string} without anchor
     */
    static removeAnchorOfUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'}
        ]);
        if (url.indexOf('#') !== -1) {
            return url.split('#')[0];
        } else {
            return url;
        }
    }

    /**
     * Get the given url without query parameters
     *
     * @param {string} url
     * @returns {string} url without parameters
     * @private
     */
    static _getUrlWithoutParams(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'}
        ]);
        return url.substr(0, url.indexOf('?'));
    }

    /**
     * Overwrite the current url with the given url
     *
     * @param {string} url
     * @private
     */
    static _setUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'}
        ]);
        window.history.replaceState(window.history.state, '', url);
    }
}
/**
 * Simpartic
 *
 * Framework core class to provide core functionality.
 */
class Simpartic {
    static init() {

    }
}
