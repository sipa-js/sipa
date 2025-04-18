//<!-- MODULE -->//
if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {
    SipaHelper = require('./sipa-helper');
    LuckyCase = require('lucky-case');
    CurlyBracketParser = require('curly-bracket-parser');
}

//<!-- /MODULE -->//

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
     * @param {boolean} options.keep_params=true keep parameters when loading other page
     * @param {string} options.anchor anchor to be set at the new page
     * @param {boolean} options.keep_anchor=false keep current anchor when loading other page
     * @param {Array<String>} options.remove_params parameters to be removed at the new page
     * @param {function} options.success function to be called after successful loading
     * @param {function} options.error function to be called after loading fails
     * @param {function} options.always function to be called always after successful/erroneous loading
     */
    static load(page_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            layout_id: self.config.default_layout,
            force_load: false,
            fade_effect: true,
            stack_page: true,
            keep_anchor: Typifier.isBoolean(self.config.keep_anchor) ? self.config.keep_anchor : false,
            keep_params: Typifier.isBoolean(self.config.keep_params) ? self.config.keep_params : true,
        }
        const new_page_id = self.extractIdOfTemplate(page_id, {type: 'page'});
        if (!options.layout_id && self.config.default_layouts && self.config.default_layouts.hasOwnProperty(new_page_id)) {
            options.layout_id = self.config.default_layouts[new_page_id];
        }
        options = SipaHelper.mergeOptions(default_options, options);
        if (!options.anchor && SipaUrl.getAnchorOfUrl(page_id)) {
            options.anchor = SipaUrl.getAnchorOfUrl(page_id);
        } else if (!options.anchor && !options.keep_anchor && !SipaUrl.getAnchorOfUrl(page_id)) {
            SipaUrl.removeAnchor();
        }
        if (!options.params && Object.keys(SipaUrl.getParamsOfUrl(page_id)).length > 0) {
            if (options.keep_params) {
                options.params = SipaHelper.mergeOptions(SipaUrl.getParams(), SipaUrl.getParamsOfUrl(page_id));
            } else {
                options.params = SipaUrl.getParamsOfUrl(page_id);
            }
        }
        if (!options.keep_params) {
            SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
        }
        const last_page_id = self.currentPageId();
        const layout_id = self.extractIdOfTemplate(options.layout_id, {type: 'layout'});
        const page_path = self._makeFullPath(new_page_id, {type: 'page'});
        const j_body = $('body');
        j_body.attr('data-page-id', new_page_id);
        if (last_page_id) {
            SipaHooks.beforeDestroyPage('trigger', null, last_page_id);
            self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: new_page_id}]);
        }
        self.loadLayout(layout_id, {
            success: (data, text, response) => {
                $.ajax({
                    url: page_path,
                    method: 'GET',
                    dataType: 'html',
                    cache: !!self.config.cache_page_layout_requests,
                    success: (data, text, response) => {
                        const j_container = $(self.page_container_css_selector);
                        const load_function = () => {
                            j_container.html(data);
                            SipaHooks.beforeInitPage('trigger');
                            if (options.stack_page) {
                                self.stackHistoryState({page_id: new_page_id, layout_id: layout_id, options: options});
                            }
                            if (options.params) {
                                SipaUrl.setParams(options.params);
                            }
                            if (options.remove_params) {
                                SipaUrl.removeParams(options.remove_params);
                            }
                            // ensure anchor is set and jumped to on page load or initial (re)load
                            if (options.anchor || SipaUrl.getAnchor()) {
                                const current_anchor = options.anchor || SipaUrl.getAnchor();
                                SipaUrl.setAnchor(current_anchor, true);
                            }
                            self.callMethodOfPage(new_page_id, 'onInit', [{last_page_id: last_page_id}]);
                            if (options.fade_effect) {
                                j_container.fadeIn(150, () => {
                                    SipaHooks.beforeShowPage("trigger", null, page_id);
                                    self.callMethodOfPage(new_page_id, 'onShow', [{last_page_id: last_page_id}]);
                                });
                            } else {
                                self.callMethodOfPage(new_page_id, 'onShow', [{last_page_id: last_page_id}]);
                            }
                            if (Typifier.isFunction(options.success)) {
                                options.success(data, text, response);
                            }
                            if (Typifier.isFunction(options.always)) {
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
                        if (Typifier.isFunction(options.error)) {
                            options.error(response, text, data);
                        }
                        if (Typifier.isFunction(options.always)) {
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
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     */
    static extractIdOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        let id = SipaHelper.cutLeadingCharacters(template, '/');
        // cut params
        if (id.indexOf('?') !== -1) {
            id = id.split('?')[0];
        }
        // cut anchor
        if (id.indexOf('#') !== -1) {
            id = id.split('#')[0];
        }
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        // cut .html file from path
        if (id.match(/\/[^\/]+\.html$/)) {
            id = id.split("/").slice(0, id.split("/").length - 1).join("/");
        }
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
        id = SipaHelper.cutTrailingCharacters(id, '/');
        return LuckyCase.toDashCase(id);
    }

    /**
     * Get the class name of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} class name
     */
    static getClassNameOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const id = CurlyBracketParser._replaceAll(self.extractIdOfTemplate(template, options), '/', '_');
        return LuckyCase.toPascalCase(id + '_' + options.type);
    }

    /**
     * Get the options of the given type
     *
     * @param {SipaPage.PageType} type
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
        return $('body').attr('data-page-id');
    }

    /**
     * Get current page class
     *
     * @return {SipaBasicView}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaPage.getClassNameOfTemplate(SipaPage.currentPageId()));
    }

    /**
     * Get layout id of current loaded layout
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body').attr('data-layout-id');
    }

    /**
     * Load the given layout
     *
     * @param {string} layout_id to load
     * @param {Object} options
     * @param {boolean} options.fade_effect=true fade effect on layout change
     * @param {boolean} options.keep_page=false keep the loaded page, but change the layout only
     */
    static loadLayout(layout_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
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
         * @param {'success'|'always'} type
         */
        const after_loaded_function = (data, text, response, type) => {
            if (last_layout_id) {
                SipaHooks.beforeDestroyLayout('trigger', null, last_layout_id);
                self.callMethodOfLayout(last_layout_id, 'onDestroy', [{next_layout_id: layout_id}]);
            }
            j_body.hide();
            if(self.config.preserve_script_link_tags) {
                j_body.children().not('script, link').remove();
                j_body.prepend(data);
            } else {
                j_body.html(data);
            }
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
            cache: !!self.config.cache_page_layout_requests,
            success: (data, text, response) => {
                after_loaded_function(data, text, response, 'success');
            },
            always: (data, text, response) => {
                after_loaded_function(data, text, response, 'always');
            },
            error: (response, text, data) => {
                console.error(`Error ${response.status} - ${response.statusText} - could not load layout '${layout_path}'`);
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
            {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const page_class = self.getClassNameOfTemplate(page_id, {type: 'page'});
        const class_exists = eval(`typeof ${page_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${page_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${page_class}.${method_name}(...parameters);`)
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
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const layout_class = self.getClassNameOfTemplate(layout_id, {type: 'layout'});
        const class_exists = eval(`typeof ${layout_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${layout_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${layout_class}.${method_name}(...parameters);`)
            }
        }
    }

    /**
     * Ensure full path of given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     * @private
     */
    static _makeFullPath(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        const id_split = template.split('/');
        const file_name = id_split[id_split.length - 1];
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
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'boolean'},
        ]);
        const original_url = SipaUrl.getUrl();
        let params = {page: state.page_id};
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
     * @param {SipaPage.Config} config
     */
    static setConfig(config) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
        // init only when running in browser
        if (typeof window !== 'undefined') {
            SipaPage.initHistoryState();
        }
    }

    static isInitialized() {
        const self = SipaPage;
        return self.config !== null;
    }

    /**
     * Reset all states
     *
     * Useful for unit testing
     *
     */
    static reset() {
        $('body').removeAttr('data-page-id');
        $('body').removeAttr('data-layout-id');
    }
}

SipaPage.page_container_css_selector = '#page-container';

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
 * @typedef {Object} SipaPage.Config
 * @param {string} default_layout
 * @param {Object} default_layouts
 * @param {boolean} keep_anchor
 *
 *
 * @typedef {'layout'|'page'} SipaPage.PageType
 */


//<!-- MODULE -->//
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SipaPage;
}
//<!-- /MODULE -->//