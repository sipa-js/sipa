/**
 * SipaOnsenPage
 *
 * Tool class with page loader with included router for OnsenUI
 */
class SipaOnsenPage {
    /**
     * Load given page by page_id
     *
     * @param {string} page_id to load
     * @param {Object} options
     * @param {boolean} options.stack_page=true stack page in page history
     * @param {boolean} options.reset=false reset page to given page
     * @param {boolean} options.replace=false replace current page with given page. If reset=true is set, this setting will be ignored
     * @param {boolean} options.init_history_tree=false force to load history tree, default false
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
        return new Promise((resolve, reject) => {
            const self = SipaOnsenPage;
            self.connectOnsenHooks();
            SipaHelper.validateParams([
                {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
                {param_name: 'options', param_value: options, expected_type: 'Object'},
            ]);
            const default_options = {
                layout_id: self.config.default_layout,
                fade_effect: true,
                stack_page: true,
                keep_anchor: Typifier.isBoolean(self.config.keep_anchor) ? self.config.keep_anchor : false,
                keep_params: Typifier.isBoolean(self.config.keep_params) ? self.config.keep_params : true,
            }
            options = SipaHelper.mergeOptions(default_options, options);
            if(!options.anchor && SipaUrl.getAnchorOfUrl(page_id)) {
                options.anchor = SipaUrl.getAnchorOfUrl(page_id);
            } else if(!options.anchor && !options.keep_anchor && !SipaUrl.getAnchorOfUrl(page_id)) {
                SipaUrl.removeAnchor();
            }
            if(!options.params && Object.keys(SipaUrl.getParamsOfUrl(page_id)).length > 0) {
                if(options.keep_params) {
                    options.params = SipaHelper.mergeOptions(SipaUrl.getParams(), SipaUrl.getParamsOfUrl(page_id));
                } else {
                    options.params = SipaUrl.getParamsOfUrl(page_id);
                }
            }
            if(!options.keep_params) {
                SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
            }
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
                        cache: false,
                        success: (data, text, response) => {
                            const navi = self.getOnsenNavigator();
                            self._current_page = {page_id: page_id, last_page_id: last_page_id, options: options};
                            const afterFunction = () => {
                                self._getPageStack().getLast().setAttribute('data-page-id', page_id);
                                if(options && options.init_history_tree) {
                                    self._history_tree_loaded = false;
                                }
                                resolve(page_id);
                            };
                            if (options && options.reset) {
                                navi.resetToPage(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
                            } else if (options && options.replace) {
                                navi.replacePage(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
                            } else {
                                navi.bringPageTop(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
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
                            reject(page_id);
                        }
                    });
                }
            });
        });
    }

    static getOnsenNavigator() {
        const self = SipaOnsenPage;
        return document.querySelector(self.page_container_css_selector);
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
        const self = SipaOnsenPage;
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
        if(id.indexOf('?') !== -1) {
            id = id.split('?')[0];
        }
        // cut anchor
        if(id.indexOf('#') !== -1) {
            id = id.split('#')[0];
        }
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
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
        const self = SipaOnsenPage;
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
        const self = SipaOnsenPage;
        const last_page = self._getPageStack().getLast();
        if (last_page) {
            return self._getPageStack().getLast().getAttribute('data-page-id');
        }
    }

    /**
     * Get current page class
     *
     * @return {SipaBasicView}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaOnsenPage.getClassNameOfTemplate(SipaOnsenPage.currentPageId()));
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
        const self = SipaOnsenPage;
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
        if (last_layout_id === layout_id) {
            if (typeof options.success === 'function') {
                options.success();
            }
            if (typeof options.always === 'function') {
                options.always();
            }
        } else {
            j_body.attr('data-layout-id', layout_id);
            /**
             * @param {'success'|'always'} type
             */
            const after_loaded_function = (data, text, response, type) => {
                if (last_layout_id) {
                    SipaOnsenHooks.beforeDestroyLayout('trigger', null, last_layout_id);
                    self.callMethodOfLayout(last_layout_id, 'onDestroy', [{next_layout_id: layout_id}]);
                }
                j_body.hide();
                j_body.html(data);
                SipaOnsenHooks.beforeInitLayout('trigger', null, layout_id);
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
                cache: false,
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
    }

    /**
     * Call the given method of the given page with given parameters (optional)
     *
     * @param {string} page_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfPage(page_id, method_name, parameters = []) {
        const self = SipaOnsenPage;
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
        const self = SipaOnsenPage;
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

    static _getPageStack() {
        return [...document.querySelectorAll('ons-navigator ons-page')];
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
        const self = SipaOnsenPage;
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
        const self = SipaOnsenPage;
        // listen to browser back/forward event
        window.onpopstate = (e) => {
            if (e.state === null) {
                return;
            }
            const current_history_index = e.state.index || 0;
            self.last_history_index = self.last_history_index === null ? current_history_index : self.last_history_index;
            if (e.state && e.state.page_id) {
                const page_id = e.state.page_id;
                let options = e.state.options;
                // as we go back in history, we do not stack the previous page when loading it
                options.stack_page = false;
                if (page_id) {
                    const forward_button_clicked = current_history_index - self.last_history_index >= 1;
                    if (forward_button_clicked) {
                        //console.log(`history.forward (${current_history_index}/${self.last_history_index})`);
                        self.load(page_id, options);
                    } else {
                        //console.log(`history.backward (${current_history_index}/${self.last_history_index})`);
                        self.popPage();
                    }
                }
                self.last_history_index = current_history_index;
            }
        }
    }


    static connectOnsenHooks() {
        const self = SipaOnsenPage;
        if (!self.onsen_hooks_connected) {
            document.addEventListener('init', function (event) {
                if (self._is_loading_history_tree || self._getPageStack().length === 0) {
                    return;
                }
                const page_id = self._current_page.page_id;
                const last_page_id = self._current_page.page_id;
                const options = self._current_page.options;
                if (options.stack_page) {
                    self.stackHistoryState({page_id: page_id, layout_id: options.layout_id, options: options});
                }
                if (options.params) {
                    SipaUrl.setParams(options.params);
                }
                if (options.remove_params) {
                    SipaUrl.removeParams(options.remove_params);
                }
                self._initPage(page_id, last_page_id);
                if (Typifier.isFunction(options.success)) {
                    options.success(data, text, response);
                }
                if (Typifier.isFunction(options.always)) {
                    options.always(data, text, response);
                }
            }, false);

            document.addEventListener('hide', function (event) {
                const page_id = event.target.getAttribute('data-page-id');
                self._historyPageInit();
                const next_page_id = self._getPageStack()[self._getPageStack().length - 2];
                if (page_id) {
                    SipaOnsenHooks.beforeHidePage("trigger", null, page_id);
                    self.callMethodOfPage(page_id, 'onHide', [{next_page_id: next_page_id}]);
                }
            }, false);

            document.addEventListener('postpop', function (event) {
                const page_id = self.currentPageId();
            }, false);

            document.addEventListener('prepop', function (event) {
                const page_id = self.currentPageId();
            }, false);

            document.addEventListener('destroy', function (event) {
                const last_page_id = self.currentPageId();
                const next_page_id = self._getPageStack()[self._getPageStack().length - 2];
                if (last_page_id) {
                    SipaOnsenHooks.beforeDestroyPage('trigger', null, last_page_id);
                    self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: next_page_id}]);
                }
            }, false);

            document.addEventListener('show', function (event) {
                const page_id = self.currentPageId();
                if (self._getPageStack().length > 0) {
                    self.initHistoryTree();
                } else {
                    // layout show
                }
                if (page_id) {
                    SipaOnsenHooks.beforeShowPage("trigger", null, page_id);
                    self.callMethodOfPage(page_id, 'onShow');
                }
            }, false);
            self.onsen_hooks_connected = true;
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
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'state', param_value: state, expected_type: 'Object'},
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'boolean'},
        ]);
        const original_url = SipaUrl.getUrl();
        let params = {page: state.page_id};
        if (!window.history.state) {
            replace_state = true;
        }
        if (replace_state) {
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        } else {
            state.index = window.history.length;
            window.history.pushState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        }
    }

    static initHistoryTree(force = false) {
        const self = SipaOnsenPage;
        if (!self._history_tree_loaded || force) {
            self._is_loading_history_tree = true;
            self._history_tree_loaded = true;
            const page_id_param = SipaUrl.getParams().page;
            if (page_id_param) {
                const last_tree_elements = SipaOnsenPage.config.history_trees.map((el) => {
                    return el.getLast();
                });
                if (last_tree_elements.indexOf(page_id_param) !== -1) {
                    const history_tree = self.config.history_trees[last_tree_elements.indexOf(page_id_param)];
                    const without_last_item = _.slice(history_tree, 0, history_tree.length - 1);
                    const history_count = without_last_item.length;
                    without_last_item.reverse().eachWithIndex((page, i) => {
                        const page_id = self.extractIdOfTemplate(page);
                        const page_params = SipaUrl.getParamsOfUrl(page);
                        const page_anchor = SipaUrl.getAnchorOfUrl(page);
                        self.getOnsenNavigator().insertPage(0, self._makeFullPath(page_id)).then((el) => {
                            el.setAttribute('data-history-tree', 'true');
                            el.setAttribute('data-page-id', page_id);
                            el.setAttribute('data-page-parameters', JSON.stringify(page_params));
                            el.setAttribute('data-page-anchor', page_anchor);
                            if (self._getPageStack().length === history_count + 1) {
                                self._is_loading_history_tree = false;
                            }
                        });
                    });
                } else {
                    self._is_loading_history_tree = false;
                }
            } else {
                self._is_loading_history_tree = false;
            }
        }
    }

    static initializeBackButton() {
        const self = SipaOnsenPage;
        const back_buttons = [...document.querySelectorAll('ons-back-button')];
        if (back_buttons && back_buttons.length > 0) {
            const latest_back_button = back_buttons.getLast();
            if (latest_back_button) {
                latest_back_button.onClick = function (event) {
                    event.preventDefault();
                    if (!self._hasHistoryPage()) {
                        window.history.back();
                    } else {
                        self.popPage();
                    }
                    return;
                };
            }
        }
    }

    static popPage() {
        const self = SipaOnsenPage;
        return self.getOnsenNavigator().popPage();
    }

    /**
     * Set the configuration of pages and layouts
     *
     * @example
     *   SipaOnsenPage.setConfig({
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
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
        // init only when running in browser
        if (typeof window !== 'undefined') {
            SipaOnsenPage.initHistoryState();
        }
    }

    static isInitialized() {
        const self = SipaOnsenPage;
        return self.config !== null;
    }

    /**
     * Check if current page was inserted by history tree.
     * If yes, then run its onInit method and remove its history tree class.
     *
     * This ensures, that the init method of pages is called once when they are displayed first.
     *
     * @private
     */
    static _historyPageInit() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const last_page = page_stack[page_stack.length - 1];
        const new_page = page_stack[page_stack.length - 2];
        if (new_page && new_page.getAttribute('data-history-tree')) {
            const last_page_id = last_page.getAttribute('data-page-id');
            const new_page_id = new_page.getAttribute('data-page-id');
            let new_page_parameters = null;
            if(new_page.getAttribute('data-page-parameters')) {
                new_page_parameters = JSON.parse(new_page.getAttribute('data-page-parameters'));
            }
            const new_page_anchor = new_page.getAttribute('data-page-anchor');
            new_page.removeAttribute('data-history-tree');
            self._initPage(new_page_id, last_page_id, new_page_parameters, new_page_anchor);
            return true;
        }
        return false;
    }

    static _hasHistoryPage() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const new_page = page_stack[page_stack.length - 2];
        return new_page && new_page.getAttribute('data-history-tree');
    }

    static _initPage(page_id, last_page_id, params = {}, anchor) {
        const self = SipaOnsenPage;
        if(!params) {
            params = {};
        }
        SipaUrl.setParams(SipaHelper.mergeOptions(params, {page: page_id}));
        if(anchor) {
            SipaUrl.setAnchor(anchor);
        }
        self._getPageStack().getLast().setAttribute('data-page-id', page_id);
        SipaOnsenHooks.beforeInitPage("trigger", null, page_id);
        self.callMethodOfPage(page_id, 'onInit', [{last_page_id: last_page_id}]);
        self.initializeBackButton();
    }
}

SipaOnsenPage.page_container_css_selector = 'ons-navigator';

/**
 * @type {SipaOnsenPageConfig}
 */
SipaOnsenPage.config = null;
SipaOnsenPage.last_history_index = null;
SipaOnsenPage.onsen_hooks_connected = false;
SipaOnsenPage._history_tree_loaded = false;

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} TypeOptionsType
 * @property {string} prefix
 * @property {string} file_ext
 *
 *
 * @typedef {Object} SipaOnsenPageConfig
 * @param {string} default_layout
 * @param {Object} default_layouts
 */
