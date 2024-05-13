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
     * @param {boolean} options.reset=false reset page to given page
     * @param {boolean} options.replace=false replace current page with given page. If reset=true is set, this option will be ignored
     * @param {boolean} options.push=false stack given page over current page, independent if it exists already. If reset=true or replace=true is set, this option will be ignored
     * @param {SipaOnsenPage.OnsenOptions} options.onsen options passed to original OnsenUI bringPageTop / pushPage / replacePage / resetPage
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
            self._connectOnsenHooks();
            SipaHelper.validateParams([
                {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
                {param_name: 'options', param_value: options, expected_type: 'Object'},
            ]);
            const default_options = {
                layout_id: self.config.default_layout,
                fade_effect: true,
                keep_anchor: Typifier.isBoolean(self.config.keep_anchor) ? self.config.keep_anchor : false,
                keep_params: Typifier.isBoolean(self.config.keep_params) ? self.config.keep_params : true,
            }
            options = SipaHelper.mergeOptions(default_options, options);
            if (!options.anchor && SipaUrl.getAnchorOfUrl(page_id)) {
                options.anchor = SipaUrl.getAnchorOfUrl(page_id);
            } else if (!options.anchor && !options.keep_anchor && !SipaUrl.getAnchorOfUrl(page_id) && !self._is_first_load) {
                SipaUrl.removeAnchor();
            }
            if (!options.params && Object.keys(SipaUrl.getParamsOfUrl(page_id)).length > 0) {
                if (options.keep_params) {
                    options.params = SipaHelper.mergeOptions(SipaUrl.getParams(), SipaUrl.getParamsOfUrl(page_id));
                } else {
                    options.params = SipaUrl.getParamsOfUrl(page_id);
                }
            }
            if (!options.keep_params && !self._is_first_load) {
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
                            self._is_first_load = false;
                            const navi = self.getOnsenNavigator();
                            self._current_page = {page_id: page_id, last_page_id: last_page_id, options: options};
                            let current_page_history = _.merge(_.cloneDeep(self._current_page), {params: _.merge(_.merge(SipaUrl.getParams(), {page: self._current_page.page_id}))});
                            current_page_history.anchor = SipaUrl.getAnchor();
                            if (options && options.params) {
                                current_page_history.params = _.merge(current_page_history.params, options.params);
                            }
                            const afterFunction = () => {
                                // get first without data-page-id
                                self._getPageStack().eachWithIndex((page, i) => {
                                    if(!page.getAttribute('data-page-id')) {
                                        page.setAttribute('data-page-id', page_id);
                                        return false;
                                    }
                                });
                                if (options && options.init_history_tree) {
                                    self._history_tree_loaded = false;
                                }
                                self._initStatusBarMock();
                                resolve(page_id);
                            };
                            if (options && options.reset) {
                                self._page_stack_history = [current_page_history];
                                navi.resetToPage(self._makeFullPath(page_id), options.onsen).then(() => {
                                    afterFunction();
                                });
                            } else if (options && options.replace) {
                                self._page_stack_history[self._page_stack_history.length - 1] = current_page_history;
                                navi.replacePage(self._makeFullPath(page_id), options.onsen).then(() => {
                                    afterFunction();
                                });
                            } else if (options && options.push) {
                                self._page_stack_history.push(current_page_history);
                                navi.pushPage(self._makeFullPath(page_id), options.onsen).then(() => {
                                    afterFunction();
                                });
                            } else {
                                if (page_id !== last_page_id) {
                                    self._page_stack_history.push(current_page_history);
                                }
                                SipaUrl.setParams(current_page_history.params); // if page is already loaded, we need to restore params
                                navi.bringPageTop(self._makeFullPath(page_id), options.onsen).then(() => {
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
        return SipaPage.extractIdOfTemplate(template, options);
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
        return SipaPage.getClassNameOfTemplate(template, options);
    }

    /**
     * Get the options of the given type
     *
     * @param {SipaPage.PageType} type
     * @returns {TypeOptionsType} type options
     */
    static typeOptions(type) {
        return SipaPage.typeOptions(type);
    }

    /**
     * Get page id of current loaded page
     *
     * @returns {string} page id
     */
    static currentPageId() {
        const self = SipaOnsenPage;
        const path = self.getOnsenNavigator()?.topPage?._meta?.PageLoader?.page;
        if (path) {
            return self.extractIdOfTemplate(path);
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
        return SipaPage.callMethodOfPage(page_id, method_name, parameters);
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
        return SipaPage.callMethodOfPage(layout_id, method_name, parameters);
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
    }

    static isInitialized() {
        const self = SipaOnsenPage;
        return self.config !== null;
    }

    /**
     * @param {Object} options
     * @param {SipaOnsenPage.OnsenOptions} options.onsen options passed to original OnsenUI popPage
     * @returns {Promise}
     */
    static popPage(options = {}) {
        const self = SipaOnsenPage;
        options ??= {};
        if (self._page_stack_history.length > 1) {
            const last_page_history = self._page_stack_history.pop();
        }
        if (!self.config.keep_params) {
            SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
        }
        const current_page_history = self._page_stack_history[self._page_stack_history.length - 1];
        if (current_page_history) {
            SipaUrl.setParams(current_page_history.params);
            if(self.config.keep_anchor && current_page_history.anchor) {
                SipaUrl.setAnchor(current_page_history.anchor);
            } else if(!self.config.keep_anchor) {
                SipaUrl.removeAnchor();
            }
        }
        return self.getOnsenNavigator().popPage(options.onsen);
    }

    /**
     * Add a status bar mock to the app
     */
    static addStatusBarMock() {
        const self = SipaOnsenPage;
        if (!document.querySelector('div.ons-status-bar-mock') && document.querySelector('body')) {
            document.querySelector('body').prepend(new DOMParser().parseFromString(`<div class="ons-status-bar-mock ios"><div>No SIM <i class="fa fa-wifi"></i></div><div>12:28 PM</div><div>80% <i class="fa fa-battery-three-quarters"></i></div></div>`, "text/html").body.childNodes[0]);
            [...document.querySelectorAll('ons-navigator ons-page')].eachWithIndex((el, i) => {
                el.setAttribute("status-bar-fill", "");
            })
        }
        self._status_bar_mock_enabled = true;
    }

    /**
     * Remove status bar mock of the app
     */
    static removeStatusBarMock() {
        if (document.querySelector('div.ons-status-bar-mock')) {
            document.querySelector('div.ons-status-bar-mock').remove();
            [...document.querySelectorAll('ons-navigator ons-page')].eachWithIndex((el, i) => {
                el.removeAttribute("status-bar-fill");
            })
        }
        self._status_bar_mock_enabled = false;
    }

    /**
     * Initialize status bar mock - do not run before first page is loaded!
     */
    static _initStatusBarMock() {
        const self = SipaOnsenPage;
        if (!self._status_bar_mock_initialized) {
            if (self._status_bar_mock_enabled) {
                self.addStatusBarMock();
            } else {
                self.removeStatusBarMock();
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
    static _makeFullPath(template, options = {}) {        const self = SipaOnsenPage;
        return SipaPage._makeFullPath(template, options);
    }

    static _connectOnsenHooks() {
        const self = SipaOnsenPage;
        if (!self._onsen_hooks_connected) {
            document.addEventListener('init', function (event) {
                if (self._is_loading_history_tree || self._getPageStack().length === 0) {
                    return;
                }
                const page_id = self.extractIdOfTemplate(event.target._meta.PageLoader.page);
                let last_page_id = null;
                if(event.target._meta.PageLoader.parent.pages?.length > 1) {
                    last_page_id = self.extractIdOfTemplate(event.target._meta.PageLoader.parent.pages[event.target._meta.PageLoader.parent.pages.length-2]._meta.PageLoader.page);
                } else if (self._current_page.last_page_id) {
                    last_page_id = self._current_page.last_page_id;
                }
                const options = self._current_page.options;
                if (options.params) {
                    SipaUrl.setParams(options.params);
                }
                if (options.remove_params) {
                    SipaUrl.removeParams(options.remove_params);
                }
                self._initPage(page_id, last_page_id, undefined, undefined, event.target);
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
                const page_id = event.target.getAttribute('data-page-id');
            }, false);

            document.addEventListener('prepop', function (event) {
                const page_id = event.target.getAttribute('data-page-id');
            }, false);

            document.addEventListener('destroy', function (event) {
                const last_page_id = event.target.getAttribute('data-page-id');
                const next_page_id = self._getPageStack()[self._getPageStack().length - 2];
                if (last_page_id) {
                    SipaOnsenHooks.beforeDestroyPage('trigger', null, last_page_id);
                    self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: next_page_id}]);
                }
            }, false);

            document.addEventListener('show', function (event) {
                const page_id = event.target.getAttribute('data-page-id');
                const j_body = $('body');
                // check if it is NOT a tabbar child
                if($(event.target).parents("ons-tabbar").length === 0) {
                    j_body.attr('data-page-id', page_id);
                } else {
                    SipaUrl.setParam('page_tab', page_id);
                }
                if (self._getPageStack().length > 0) {
                    self._initHistoryTree();
                } else {
                    // layout show
                }
                if (page_id) {
                    SipaOnsenHooks.beforeShowPage("trigger", null, page_id);
                    self.callMethodOfPage(page_id, 'onShow');
                }
            }, false);
            self._onsen_hooks_connected = true;
        }
    }

    static _initHistoryTree(force = false) {
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
                        self._page_stack_history.unshift({
                            page_id: page_id,
                            params: _.merge({page: page_id}, page_params),
                            anchor: page_anchor
                        });
                        self.getOnsenNavigator().insertPage(0, self._makeFullPath(page_id)).then((el) => {
                            el.setAttribute('data-history-tree', 'true');
                            el.setAttribute('data-page-id', page_id);
                            el.setAttribute('data-page-parameters', JSON.stringify(page_params));
                            if (typeof page_anchor !== "undefined") {
                                el.setAttribute('data-page-anchor', page_anchor);
                            }
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

    static _initializeBackButton() {
        const self = SipaOnsenPage;
        const back_buttons = [...document.querySelectorAll('ons-back-button')];
        if (back_buttons && back_buttons.length > 0) {
            back_buttons.eachWithIndex((el, i) => {
                el.onClick = function (event) {
                    event.preventDefault();
                    self.popPage();
                    return;
                };
            });
        }
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
            if (new_page.getAttribute('data-page-parameters')) {
                new_page_parameters = JSON.parse(new_page.getAttribute('data-page-parameters'));
            }
            let new_page_anchor = new_page.getAttribute('data-page-anchor');
            if (new_page_anchor === null) {
                new_page_anchor = undefined;
            }
            new_page.removeAttribute('data-history-tree');
            self._initPage(new_page_id, last_page_id, new_page_parameters, new_page_anchor, new_page);
            return true;
        }
        return false;
    }

    static _hasUninitializedHistoryPage() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const new_page = page_stack[page_stack.length - 2];
        return new_page && new_page.getAttribute('data-history-tree');
    }

    static _initPage(page_id, last_page_id, params = {}, anchor, element) {
        const self = SipaOnsenPage;
        if (!params) {
            params = {};
        }
        // change page attribute only if not a tab element
        if($(element).parents("ons-tabbar").length === 0) {
            SipaUrl.setParams(SipaHelper.mergeOptions(params, {page: page_id}));
        }
        if (typeof anchor !== "undefined") {
            SipaUrl.setAnchor(anchor);
        }
        // get first without data-page-id
        self._getPageStack().eachWithIndex((page, i) => {
            if(!page.getAttribute('data-page-id')) {
                page.setAttribute('data-page-id', page_id);
                return false;
            }
        });
        SipaOnsenHooks.beforeInitPage("trigger", null, page_id);
        self.callMethodOfPage(page_id, 'onInit', [{last_page_id: last_page_id}]);
        self._initializeBackButton();
    }
}

SipaOnsenPage.page_container_css_selector = 'ons-navigator';

/**
 * @type {SipaOnsenPageConfig}
 */
SipaOnsenPage.config = null;
SipaOnsenPage._onsen_hooks_connected = false;
SipaOnsenPage._history_tree_loaded = false;
SipaOnsenPage._is_first_load = true;
SipaOnsenPage._page_stack_history = [];

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} TypeOptionsType
 * @property {string} prefix
 * @property {string} file_ext
 */

/**
 * @typedef {Object} SipaOnsenPageConfig
 * @param {string} default_layout
 * @param {Object} default_layouts
 *
 */

/**
 * @typedef {Object} SipaOnsenPage.OnsenOptions
 * @param {'slide','lift','fade','none','slide-ios','lift-ios','fade-ios','slide-md','lift-md','fade-md'} animation Animation name. Available animations are "slide", "lift", "fade" and "none". These are platform based animations. For fixed animations, add "-ios" or "-md" suffix to the animation name. E.g. "lift-ios", "lift-md". Defaults values are "slide-ios" and "fade-md".
 * @param {Object} animationOptions Specify the animation’s duration, delay and timing. E.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}.
 * @param {number} animationOptions.duration
 * @param {number} animationOptions.delay
 * @param {string} animationOptions.timing
 * @param {function} callback Function that is called when the transition has ended.
 * @param {Object} data Custom data that will be stored in the new page element.
 * @param {number} times Number of pages to be popped. Only one animation will be shown. Works only on popPage
 * @param {string} page Only necessary if no page is given.
 * @param {string} pageHTML HTML code that will be computed as a new page. Overwrites page parameter.
 */

// wrap original mock status bar method
if(typeof ons !== 'undefined') {
    ons.mockStatusBar = () => {
        SipaOnsenPage.addStatusBarMock();
    }
}