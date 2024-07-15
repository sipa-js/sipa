/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version 0.9.34
 * @date 2024-07-15T11:08:48.632Z
 * @link https://github.com/magynhard/sipa
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
     * @example
     * // ImprintPage is loaded
     * LoginPage.isLoaded();
     * // => false
     *
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        const navigator = SipaPage.isInitialized() ? SipaPage : SipaOnsenPage.isInitialized() ? SipaOnsenPage : false;
        if(navigator === false) {
            throw `SipaPage.setConfig or SipaOnsenPage.setConfig was not executed before application start.`;
        }
        // no page loaded at all
        if(!navigator.currentPageId()) {
            return false;
        } else if(this.type() === 'page') {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentPageId().replace(/\//g,'-'))) + 'Page').endsWith(this.className() );
        } else {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentLayoutId().replace(/\//g,'-'))) + 'Layout').endsWith(this.className());
        }
    }

    /**
     * Get the class name of the current view
     *
     * @example
     * class MyPage extends SipaBasicView {
     * }
     *
     * const a = MyPage;
     * a.className()
     * // => 'MyPage'
     *
     * @returns {string}
     */
    static className() {
        return this.name;
    }

    /**
     * Get the type of the current view
     *
     * @example
     * class MyLayout extends SipaBasicView {
     * }
     *
     * MyLayout.type()
     * // => 'layout'
     *
     * @returns {'page'|'layout'}
     */
    static type() {
        const self = SipaBasicView;
        if(this.className().endsWith('Page')) {
            return 'page';
        } else {
            return 'layout';
        }
    }
}
/**
 * SipaEvents
 *
 * Provides adding and triggering customized events.
 *
 * @example
 *
 *  // To add to a class, the suggested pattern is
 *
 *  events() {
 *         return this._events ??= new SipaEvents(['click','delete','update']);
 *  }
 *
 */
class SipaEvents {
    /**
     * Valid event names for better error handling.
     * @type {Array<string>}
     * @private
     */
    _valid_event_names = [];
    /**
     * Here we store registered events
     * @type {Object<string,Array<function>>}
     */
    _event_registry = {};
    /**
     * @param {...string} valid_event_names define the available event names
     */
    constructor(...valid_event_names) {
        if(valid_event_names.length === 0) {
            throw new Error(`SipaEvent constructor: No event names parameter given!`);
        }
        valid_event_names = valid_event_names.flatten();
        const has_duplicates = _.uniq(valid_event_names).length !== valid_event_names.length;
        if(has_duplicates) {
            throw new Error(`Sipa Event constructor: Duplicate event names! [${valid_event_names.map(e => `"${e}"`).join(",")}]`);
        }
        this._valid_event_names = valid_event_names.flatten().map(e => e.toString());
    }

    /**
     *
     * @param {string} event_name must be one of this._valid_event_names
     * @param {function} callback
     */
    subscribe(event_name, callback) {
        this._validateEventName(event_name);
        if (typeof callback === 'function') {
            this._event_registry[event_name] ??= [];
            if (this._event_registry[event_name].indexOf(callback) !== -1) {
                console.warn(`Tried to subscribe event '${event_name}' again with same call back function '${callback.name}'. Ignored.`);
            } else {
                this._event_registry[event_name].push(callback);
            }
        } else {
            console.error("Given parameter is not a valid function. It is of type '" + Typifier.getType(callback) + "'");
        }
    }

    /**
     * @param {string} event_name
     * @param {function} callback
     */
    unsubscribe(event_name, callback) {
        this._validateEventName(event_name);
        let index = this._event_registry[event_name]?.indexOf(callback) ?? -1;
        if(index !== -1) {
            delete this._event_registry[event_name][index];
            this._event_registry[event_name] = this._event_registry[event_name].filter(x => !!x);
        } else {
            console.warn(`Tried to unsubscribe event '${event_name}' of a call back that was not subscribed. Ignored.`);
        }
    }

    /**
     * Unsubscribe all subscriptions of the given event name.
     *
     * Usually you should only use the unsubscribe() method to unsubscribe. Use this method with care!
     *
     * @param event_name
     */
    unsubscribeAll(event_name) {
        if(this._event_registry[event_name]) {
            delete this._event_registry[event_name];
        }
    }

    /**
     * Calls all registered events of event_name
     * @param {String} event_name
     * @param {Array<any>} msg params to pass to the created event function
     * @param {Object} options
     * @param {boolean} options.validate=true validate the given event name to be valid
     */
    trigger(event_name, msg, options) {
        options ??= {};
        options.validate ??= true;
        if(options.validate) {
            this._validateEventName(event_name);
        }
        msg ??= [];
        if(Typifier.isArray(this._event_registry[event_name])) {
            this._event_registry[event_name].eachWithIndex((callback) => {
                callback(...msg);
            });
        }
    }

    /**
     * Unsubscribes all subscriptions of any event
     */
    reset() {
        this._event_registry = {};
    }

    /**
     * Extend valid event names dynamically
     *
     * @param {...string} event_names
     */
    createEvents(...event_names) {
        this._valid_event_names = _.uniq(this._valid_event_names.concat(event_names.flatten()));
    }

    /**
     * Delete valid event names dynamically
     *
     * @param {...string} event_names
     */
    deleteEvents(...event_names) {
        event_names ??= [];
        event_names.eachWithIndex((name) => {
            const index = this._valid_event_names.indexOf(name);
            if(index !== -1) {
                delete this._valid_event_names[index];
            }
        });
        this._valid_event_names = this._valid_event_names.filter(x => !!x);
    }

    /**
     * Ensure that the given event_name is defined in VALID_ELEMENT_NAMES
     *
     * @param {String} event_name
     * @private
     */
    _validateEventName(event_name) {
        if (!this._valid_event_names.includes(event_name)) {
            throw new Error(`Invalid event '${event_name}'. Valid events are: ${this._valid_event_names.join(' ')}`);
        }
    }
}

/**
 * Easy but powerful component class implementation to create your reusable components
 */
class SipaComponent {

    /**
     * The components data representation
     *
     * @type {Object}
     * @private
     */
    _data = {};
    /**
     * The components meta data for internal management
     *
     * @type {SipaComponent.Meta}
     * @private
     */
    _meta = {};
    _destroyed = false;
    /**
     * @type {Object}
     */
    _previous_data = null;
    /**
     * List of to check for alias duplicates
     * @type {Array<string>}
     */
    _apply_alias_duplicate_list = [];
    /**
     * @type {Element}
     */
    _cached_node = null;
    /**
     * Sync nested references automatically after every render update
     * May be disabled on performance cases. Then overwrite to 'false' at the inherited class.
     * @type {boolean}
     */
    _sync_nested_references = true;

    /**
     * @type {number}
     */
    static _component_id_incrementer = 1;
    /**
     * @type {function} class
     */
    static _component_instances = [];
    /**
     * @type {Function} class
     */
    static _registered_components = [];


    /**
     * @param {Object<String, *>} data object of properties
     * @param {Object} options
     * @param {boolean} options.sipa_hidden=false initial visibility state
     * @param {boolean} options.sipa_cache=true use node caching for templates
     * @param {string} options.sipa_classes additional classes for component tag
     * @param {string} options.sipa_alias alias to access from parent by uniq accessor name
     * @param {Object<string, string>} options.sipa_custom_attributes additional custom attributes on the component tag
     * @param {string} options.content HTML content inside the component element, available for slots
     *
     * @example
     *
     * const component = new SipaComponent({
     *          name: "Foo",
     *          age: 45,
     *      }, {
     *          sipa_hidden: true,
     *          sipa_classes: "dark-style",
     *          sipa_custom_attributes: {
     *              id: "special-instance",
     *              disabled: "disabled",
     *              onclick: "alert('hello world!')",
     *              style: "color: red;"
     *          }
     *      });
     */
    constructor(data = {}, options = {}) {
        const self = SipaComponent;
        SipaHelper.validateParams([
            {param_name: 'data', param_value: data, expected_type: 'Object'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        options ??= {};
        const default_options = {
            sipa_hidden: false,
            sipa_classes: "",
            sipa_cache: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);

        this._data = {};
        this._meta.sipa_children = undefined;
        if(options.content) {
            const el = self._parseHtml(`<element>${options.content}</element>`);
            this._meta.sipa_body_nodes = el.childNodes;
        }
        // unique id
        this._meta.sipa_id = self._generateUniqueId();
        this._updateData(data);
        // get class and display style from original element
        const html = this._inheritedClass().template();
        const parsed = self._parseHtml(html);
        this._meta.sipa_classes = (parsed.className + " " + options.sipa_classes.trim()).trim();
        this._meta.sipa_original_display = parsed.style ? parsed.style.display : '';
        this._meta.sipa_custom_attributes = options.sipa_custom_attributes || {};
        this._meta.sipa_hidden = options.sipa_hidden;
        this._meta.sipa_cache = options.sipa_cache;
        this._meta.sipa_alias = options.sipa_alias;
        self._component_instances.push(this);
    }

    /**
     * Ensure that the template is initialized, so that all nested children are available.
     *
     * You may for example call this method, before subscribing to children events, to ensure that the children are available.
     *
     * If the component has already been appended or rendered to the DOM, the template is of course already initialized implicitly.
     * But in some cases you don't know, if it already happened or you know, that it couldn't have happened. E.g. in the constructor of your component.
     */
    initTemplate() {
        this.node();
        this.syncNestedReferences();
    }

    /**
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {string} rendered HTML template() with current values of data
     */
    html(options) {
        const self = SipaComponent;
        options ??= {};
        options.cache ??= true;
        let html = this._inheritedClass().template();
        html = this._applyTemplateId(html);
        const _this = this;
        try {
            html = ejs.render(html, Object.assign(_.cloneDeep(this._data), _.cloneDeep({_meta: this._meta})));
        } catch (e) {
            if (e instanceof ReferenceError) {
                const last_line = e.message.split("\n").getLast();
                const attribute_name = last_line.split(" ").getFirst();
                throw new ReferenceError(`The property 'data.${attribute_name}' in the template of <${LuckyCase.toDashCase(_this.constructor.name)}> is not defined.`);
            } else {
                throw e;
            }
        }
        this._apply_alias_duplicate_list = [];
        let parsed = self._parseHtml(html);
        parsed = this._applySlots(parsed, html);
        parsed = this._applyTemplateCustomAttributes({ parsed });
        parsed = this._applyTemplateClasses({ parsed });
        parsed = this._applyTemplateHiddenState({ parsed });
        parsed = this._applyTemplateChildrenComponents({ parsed }, { cache: options.cache});
        parsed = this._applyTemplateSipaList({ parsed }, { cache: options.cache});
        return parsed.outerHTML;
    }

    /**
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {Element} element representation of html()
     */
    node(options) {
        const self = SipaComponent;
        const data_changed = !(_.isEqual(this._previous_data, this._data));
        this._previous_data = _.clone(this._data);
        options ??= {};
        options.cache ??= true;
        let parsed;
        if (data_changed || !this._cached_node || !options.cache || !this._meta.sipa_cache) {
            parsed = self._parseHtml(this.html({ cache: options.cache}));
            this._cached_node = parsed.cloneNode(true);
        } else {
            parsed = this._cached_node.cloneNode(true);
        }
        return parsed;
    }

    /**
     * Create a DOM node of the instance and append it to the given css query selector
     *
     * @param {string} query_selector
     * @returns {SipaComponent}
     */
    append(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.appendChild(this.node());
        });
        return this;
    }

    /**
     * Create a DOM node of the instance and prepend it to the given css query selector
     *
     * @param {string} query_selector
     * @return {SipaComponent}
     */
    prepend(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.prepend(this.node());
        });
        return this;
    }

    /**
     * Create a DOM node of the instance and replace it to the given css query selector
     *
     * @param {string} query_selector
     * @return {SipaComponent}
     */
    replaceWith(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.replaceWith(this.node());
        });
        return this;
    }

    /**
     * Get the sipa alias of the current instance
     *
     * @returns {string}
     */
    alias() {
        return this._meta.sipa_alias;
    }

    /**
     * Get cloned data of the current instance.
     *
     * Please note: Because the data is cloned, there are no longer any references to the original data.
     * This means that this data can be changed without risk. However, it also means that the instance data of
     * the component cannot be changed by modifying the cloned data.
     *
     * So you may use this, if you want to do some independent data processing while keeping the original data state of the component instance.
     *
     * If you want to modify the instance data, use the update() method!
     *
     * @returns {Object}
     */
    cloneData() {
        return _.cloneDeep(this._data);
    }


    /**
     * Set cloned data of the current instance
     *
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.render=true render component after data update
     * @return {SipaComponent}
     */
    resetToData(data, options = {}) {
        const self = SipaComponent;
        options ??= {};
        options.render ??= true;
        this._data = _.cloneDeep(data);
        if (options.render) {
            this.render(options);
        } // if no render, then sync at least
        else if (this._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Value representation of the component. Should be usually overwritten by the inherited component class.
     */
    value() {
        return this._meta.sipa_id;
    }

    /**
     * Get the (first) element of the current instance that is in the DOM
     *
     * @return {Element|undefined}
     */
    element() {
        const self = SipaComponent;
        const els = document.querySelector(this.selector());
        if (els) {
            return els;
        }
    }

    /**
     * Get all elements of the current instance that is in the DOM
     *
     * @return {Array<Element>|undefined}
     */
    elements() {
        const self = SipaComponent;
        const els = document.querySelectorAll(this.selector());
        if (els.length > 0) {
            return [...els]; // transform list to array
        } else {
            return [];
        }
    }

    /**
     * Get the unique css selector of the current instance(s) element(s)
     *
     * @returns {string} css selector
     */
    selector() {
        if (this._destroyed) {
            throw new Error(`This instance of ${this.constructor.name} has already been destroyed and can not be accessed any more.`);
        } else {
            return `[sipa-id="${this._meta.sipa_id}"]`;
        }
    }

    /**
     * Destroy the components DOM representation and class data representation
     *
     * @returns {SipaComponent}
     */
    destroy() {
        const self = SipaComponent;
        this.events().trigger("before_destroy", [this], { validate: false });
        const parent = this.parent();
        if (this.hasChildren()) {
            this.children().eachWithIndex((key, val) => {
                val.destroy();
            });
        }
        if (this.hasParent()) {
            const parent_index = this.parent()._meta.sipa_children.indexOf(this);
            delete this.parent()._meta.sipa_children[parent_index];
            this.parent()._meta.sipa_children = this.parent()._meta.sipa_children.filter(x => x); // remove empty entries
        }
        const index = self._component_instances.indexOf(this);
        this.remove();
        if (index !== -1) {
            delete self._component_instances[index];
            self._component_instances = self._component_instances.filter(x => x);
        }
        if(this.hasParent()) {
            const parent = this.parent();
            const sipa_list_ref = this._meta.sipa_list;
            if(sipa_list_ref) {
                delete parent._data[sipa_list_ref][parent._data[sipa_list_ref].indexOf(this)];
                parent._data[sipa_list_ref] = parent._data[sipa_list_ref].filter(x => !!x);
            }
            delete parent._meta.sipa_children[parent._meta.sipa_children.indexOf(this)];
            parent._meta.sipa_children = parent._meta.sipa_children.filter(x => !!x);
            const alias = this._meta.sipa_alias;
            if(alias) {
                delete parent._data[alias];
                parent._meta.sipa_children
            } else {
                throw new Error(`Missing alias for component.`);
            }
        }
        this._data = undefined;
        this._meta = undefined;
        this._destroyed = true;
        delete this;
        this.events().trigger("after_destroy", [this], { validate: false });
        return this;
    }

    /**
     * Check if the current instance is destroyed
     *
     * @return {boolean} true if destroyed
     */
    isDestroyed() {
        return this._destroyed;
    }

    /**
     * Remove the DOM representation(s), but keep the class data representation
     *
     * @returns {SipaComponent}
     */
    remove() {
        const self = SipaComponent;
        const elements = this.elements();
        if (elements.length === 0) {
            console.warn(`Tried to remove() ${this.constructor.name} with sipa-id '${this._meta.sipa_id}', but it does not exist in DOM.`);
        } else {
            elements.eachWithIndex((el) => {
                el.remove();
            });
        }
        return this;
    }

    /**
     * Update the data of the instance and its children by alias if available. Then rerender its view.
     *
     * @param {SipaComponent.Data} data
     * @param {Object} options
     * @param {boolean} options.render=true rerender DOM elements after data update
     * @param {boolean} options.reset=false if false, merge given data with existing, otherwise reset component data to given data
     * @param {boolean} options.cache=true use node cache or not on component and all(!) children and their children
     * @returns {SipaComponent}
     *
     * @example
     *
     * <example-component enabled="false">
     *     <nested-component sipa-alias="my_nest" name="'foo'"></nested-component>
     *     <other-nested-component sipa-alias="other" age="77"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.update({
     *     enabled: true,
     *     my_nest: {
     *         name: "bar",
     *     },
     *     other: {
     *         age: 111,
     *     }
     * });
     *
     */
    update(data = {}, options = {}) {
        options ??= {};
        data ??= {};
        options.render ??= true;
        options.reset ??= false;
        options.cache ??= true;
        this.events().trigger("before_update", [this, data, options], { validate: false });
        this._updateData(data, {reset: options.reset});
        if (options.render) {
            this.render(options);
        } // if no render, then sync at least
        else if (this._sync_nested_references) {
            this.syncNestedReferences();
        }
        this.events().trigger("after_update", [this, data, options], { validate: false });
        return this;
    }

    /**
     * Render component again
     *
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache or not on component and all(!) children and their children
     * @returns {SipaComponent}
     */
    render(options = {}) {
        options ??= {};
        options.cache ??= true;
        this.elements().forEach((el) => {
            el.replaceWith(this.node({cache: options.cache}));
        });
        if (this._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Add given class to the current instance tag element and store its state
     *
     * @param {string} class_name one or more classes separated by space
     * @param {Object} options
     * @param {boolean} options.update=true rerender current instance DOM with new class
     * @returns {SipaComponent}
     */
    addClass(class_name, options = {}) {
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let split = this._meta.sipa_classes.trim().split(' ');
        class_name.split(' ').eachWithIndex((class_value, i) => {
            if (class_value && split.indexOf(class_value) === -1) {
                split.push(class_value);
            }
        });
        this._meta.sipa_classes = split.join(' ').trim();
        if (options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Check if current component instance has given class(es) in its class state
     *
     * @param class_name one or more classes that must be included
     * @return {boolean} true if class is set
     *
     * @example
     *
     * <example-component class="test bingo">Example</example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.hasClass("test");
     * // => true
     * my_instance.hasClass("bingo test");
     * // => true
     * my_instance.hasClass("test togo");
     * // => false
     */
    hasClass(class_name) {
        let result = true;
        class_name.split(' ').eachWithIndex((current_class) => {
            if (!this._meta.sipa_classes.split(" ").includes(current_class)) {
                result = false;
                return false;
            }
        });
        return result;
    }

    /**
     * Remove given class from the current instance tag element and its state
     *
     * @param {string} class_name one or more classes separated by space
     * @param {Object} options
     * @param {boolean} options.update=true rerender current instance DOM without removed class
     * @returns {SipaComponent}
     */
    removeClass(class_name, options = {}) {
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let split = this._meta.sipa_classes.trim().split(' ');
        class_name.split(' ').eachWithIndex((class_value, i) => {
            if (split.indexOf(class_value) !== -1) {
                delete split[split.indexOf(class_value)];
            }
        });
        split = split.filter(el => !!el); // remove empty elements
        this._meta.sipa_classes = split.join(' ').trim();
        if (options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Show current instance
     *
     * @param {Object} options
     * @param {boolean} options.update=true
     * @return {SipaComponent}
     */
    show(options = {}) {
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        this._meta.sipa_hidden = false;
        this._meta.sipa_changed_visibility = true;
        if (options && options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Hide current instance
     *
     * @param {Object} options
     * @param {boolean} options.update=true
     * @return {SipaComponent}
     */
    hide(options = {}) {
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        this._meta.sipa_hidden = true;
        this._meta.sipa_changed_visibility = true;
        if (options && options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Check if current instance is hidden
     *
     * @return {boolean}
     */
    isHidden() {
        return this._meta.sipa_hidden;
    }

    /**
     * Check if current instance is visible
     *
     * @return {boolean}
     */
    isVisible() {
        return !this.isHidden();
    }

    /**
     * Return children components of the current component with its sipa-aliases as their keys.
     *
     * To work, the instance must already have been rendered at least once. To ensure explicitly, call initTemplate() before, e.g. when accessing children() in the instances constructor.
     *
     * @return  {Object<string, SipaComponent>} Object<alias, component>
     *
     * @example
     *
     * <example-component>
     *     <nested-component sipa-alias="my_nest"></nested-component>
     *     <other-nested-component sipa-alias="other"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.children();
     * // => { my_nest: NestedComponent, other: OtherNestedComponent }
     */
    children() {
        let children = {};
        if (this._meta.sipa_children) {
            this._meta.sipa_children.eachWithIndex((child, i) => {
                children[child._meta.sipa_alias ?? i] = child;
            });
        }
        return children;
    }

    /**
     * Return all keys for children aliases
     *
     * @return {Array<string>}
     */
    childrenAliases() {
        return Object.keys(this.children());
    }

    /**
     * Return all values of children
     *
     * @return {Array<SipaComponent>}
     */
    childrenValues() {
        return Object.values(this.children());
    }

    /**
     * Check if the component has any children or not
     *
     * @return {boolean}
     */
    hasChildren() {
        return !!this._meta.sipa_children?.length > 0;
    }

    /**
     * Return all instantiated slot elements of the current instance by name.
     *
     * To work, the instance must already have been rendered at least once. To ensure explicitly, call initTemplate() before, e.g. when accessing slots() in the instances constructor.
     *
     * @return {Object<string,Element>}
     */
    slots() {
        let slots = {};
        [...this.element().querySelectorAll(`[slot]:not([slot] [slot])`)].eachWithIndex((el) => {
            const name = el.getAttribute("slot");
            slots[name] = el;
        });
        return slots;
    }

    /**
     * Get parent component, if current component is a child component
     *
     * @return {undefined|SipaComponent} component
     */
    parent() {
        return this._meta.sipa_parent;
    }

    /**
     * Check if the component has a parent or not
     *
     * @return {boolean}
     */
    hasParent() {
        return !!this._meta.sipa_parent;
    }

    /**
     * Get the top level parent component, that has no parent component.
     * Will return the current component, if no parent exists.
     *
     * @return {SipaComponent} component
     *
     * @example
     *
     * <example-component>
     *     <nested-component sipa-alias="my_nest">
     *         <other-nested-component sipa-alias="other"></nested-component>
     *     </nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.children().my_nest.children().other.parentTop();
     * // => ExampleComponent
     */
    parentTop() {
        return this._meta.sipa_parent ? this._meta.sipa_parent.parentTop() : this;
    }

    /**
     * Refresh all data references from top parent to all nested children and children below.
     * This is used after the first rendering of the component for example.
     *
     * After that, the update() will manage refreshing to direct children and parent components.
     *
     * You may want to call this method, if you have a special case and modify the _data attribute manually.
     */
    syncNestedReferences() {
        this._synchronizeDataToParent();
        this._synchronizeDataToChildren({recursive: true});
    }

    /**
     * Events of the component to subscribe, unsubscribe or trigger
     *
     * @return {SipaEvents}
     */
    events() {
        return this._events ??= new SipaEvents(['before_update','after_update','before_destroy','after_destroy']);
    }

    static _refreshClass(component) {
        component = class extends Object.getPrototypeOf(component.constructor) {

        }
    }

    /**
     * Recreate a instance, based on the given instance.
     *
     * This feature is needed for hot reloading. First the class will be overwritten by the live webserver.
     * Then all classes need to be reinstantiated to be an instance of the new, overwritten, reloaded component class.
     *
     * @param {SipaComponent} component
     * @return {SipaComponent} recreated component instance
     * @private
     */
    static _recreateInstance(component) {
        let new_instance = new (component.constructor)();
        new_instance._meta = component._meta;
        new_instance._data = component._data;
        // TODO: iterate over properties of all ancestor classes recursively and get their values
    }

    /**
     * Return all instances of the component
     *
     * @param {Object} options
     * @param {boolean} options.include_children=false include embedded children components
     * @return {*|Function}
     */
    static all(options = {}) {
        const self = SipaComponent;
        const default_options = {
            include_children: false
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let all_components = [];
        // All SipaComponents
        if (this.name === self.name) {
            all_components = self._component_instances;
        } else {
            all_components = self._component_instances.filter(e => e.constructor.name === this.name);
        }
        if (!options.include_children) {
            all_components = all_components.filter(e => !e._meta.sipa_parent);
        }
        return all_components;
    }

    /**
     * Get instance of current component class by sipa-id
     *
     * @param {number} sipa_id
     * @return {undefined|SipaComponent}
     */
    static bySipaId(sipa_id) {
        const self = SipaComponent;
        const component_class_name = `${this.name}`;
        if (component_class_name === 'SipaComponent') {
            return SipaComponent._component_instances.find(x => x._meta.sipa_id === sipa_id);
        } else {
            return SipaComponent._component_instances.find(x => x.constructor.name === component_class_name && x._meta.sipa_id === sipa_id);
        }
    }

    /**
     * Destroy all instances of current component class
     */
    static destroyAll() {
        const self = SipaComponent;
        const component_class_name = `${this.name}`;
        self.all().eachWithIndex((el, i) => {
            if(component_class_name === "SipaComponent" || component_class_name === el.constructor.name) {
                el.destroy();
            }
        });
    }

    /**
     * Initialize all uninitialized components of the current component class in the DOM inside the given css selector automatically.
     *
     * @param {string} css_selector='body'
     * @return {Array<SipaComponent>}
     */
    static init(css_selector = 'body') {
        const self = SipaComponent;
        const pre_selected = document.querySelectorAll(css_selector);
        const new_initialized_elements = [];
        const component_class_name = `${this.name}`;
        [...pre_selected].eachWithIndex((ps) => {
            // only components of current class
            let component_selector;
            // if called by the base component, search for all components
            if (component_class_name === 'SipaComponent') {
                component_selector = self._registered_components.map(x => LuckyCase.toDashCase(x.name) + ':not([sipa-id])').join(`,`)
            } else {
                component_selector = `${LuckyCase.toDashCase(component_class_name)}:not([sipa-id])`;
            }
            const uninitialized_elements = ps.querySelectorAll(component_selector);
            [...uninitialized_elements].eachWithIndex((el, i) => {
                new_initialized_elements.push(self.initElement(el));
            });
        });
        return new_initialized_elements;
    }

    /**
     * Init given element as the current component class
     *
     * @param {Element} element
     * @param {Object} options
     * @param {SipaComponent} options.sipa_component if given, reinit given component instance
     * @param {Object} options.parent_data data of parent element, if this is a child
     * @return {SipaComponent} component instance
     */
    static initElement(element, options = {}) {
        const self = SipaComponent;
        options ??= {};
        if (!element.getAttribute('sipa-id') && typeof options.sipa_component === 'undefined') {
            const element_class = SipaHelper.constantizeString(LuckyCase.toPascalCase(element.tagName));
            const new_component_obj = {_meta: {sipa_custom_attributes: {}}};
            const attr_keys = [...element.attributes].map(e => e.name);
            const body_nodes = element.childNodes;
            new_component_obj._meta.sipa_body_nodes = body_nodes;
            let data = {};
            attr_keys.eachWithIndex((key, i) => {
                if (key.startsWith("sipa-")) {
                    const d_key = key.substring("sipa-".length);
                    const d_value = element.attributes[key].value;
                    if (d_key === "hidden") {
                        if (d_value === "true") {
                            new_component_obj._meta.sipa_hidden = true;
                        } else {
                            new_component_obj._meta.sipa_hidden = false;
                        }
                    } else if (d_key === "cache") {
                        if (d_value === "true") {
                            new_component_obj._meta.sipa_cache = true;
                        } else {
                            new_component_obj._meta.sipa_cache = false;
                        }
                    } else if (d_key === "alias") {
                        new_component_obj._meta.sipa_alias = d_value;
                    } else {
                        throw new Error(`Invalid sipa attribute '${key}'`);
                    }
                    //data[d_key] = element.attributes[key].value;
                } else if (key === "class") {
                    new_component_obj._meta.sipa_classes = element.attributes[key].value;
                } else if (key.startsWith("attr-")) {
                    new_component_obj._meta.sipa_custom_attributes[key.substring("attr-".length)] = element.attributes[key].value;
                } else {
                    try {
                        let value = null;
                        const raw_value = element.attributes[key].value;
                        if (raw_value.trim() === '') {
                            value = undefined;
                        } else {
                            value = eval(`(${element.attributes[key].value})`);
                        }
                        // check if children (dot) like my.super.value
                        if (key.includes(".")) {
                            _.set(data, key.split("."), value);
                        } else {
                            data[key] = value;
                        }
                    } catch (e) {
                        throw new Error(`Error parsing value for attribut '${key}' in component '<${LuckyCase.toDashCase(element_class.name)}>'. Be aware that the attribute value is interpreted as pure javascript. So for example, strings must be put into quotes. E.g. "sample string" must be "'sample string'".\n${e.message}`);
                    }
                }
            });
            const parent_alias_data = options && options.parent_data && options.parent_data[new_component_obj?._meta?.sipa_alias];
            if (parent_alias_data) {
                if (typeof parent_alias_data === 'object') {
                    data = Object.assign(data, parent_alias_data);
                } else {
                    throw new Error(`Alias data for 'data.${new_component_obj._meta.sipa_alias}' must be of type object! Given: ${Typifier.getType(parent_alias_data)}`)
                }
            }
            const new_component = new (element_class)(data);
            new_component_obj._meta.eachWithIndex((key, val) => {
                new_component._meta[key] = val;
            });
            const new_element_node = self.initChildComponents(new_component);
            element.replaceWith(new_element_node);
            if (new_component._sync_nested_references) {
                new_component.syncNestedReferences();
            }
            return new_component;
        } else if (typeof options.sipa_component !== 'undefined') {
            return options.sipa_component;
        }
    }

    /**
     * Init child components of the given component if available
     *
     * @param {SipaComponent} component
     * @returns {Element}
     */

    static initChildComponents(component) {
        const self = SipaComponent;
        const new_element_node = component.node();
        let uninitialized_children = [];
        const children_selector = self._registered_components.map(x => x.tagName() + ':not([sipa-id])').join(", ");
        uninitialized_children = new_element_node.querySelectorAll(children_selector);
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                component._meta.sipa_children ??= [];
                const child = self.initElement(el);
                child._meta.sipa_parent = component;
                component._addChild(child);
                const child_node = child.node();
                el.replaceWith(child_node);
                if (child._sync_nested_references) {
                    child.syncNestedReferences();
                }
            });
        }
        return new_element_node;
    }

    /**
     * Get tag name of current component class
     *
     * @return {string}
     *
     * @example
     *
     * <example-component>blub</example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.tagName();
     * // => "example-component"
     */
    static tagName() {
        return LuckyCase.toDashCase(this.prototype.constructor.name);
    }

    /**
     * Get the component instance of the given element or one of its parent
     *
     * @param {HTMLElement} element
     * @returns {SipaComponent}
     *
     * @example
     *
     * <example-component sipa-id="1">
     *     <nested-component sipa-id="2">
     *         <span id="nested_span">nested</span>
     *     </nested-component>
     *     <span id="top_span">top</span>
     * </example-component>
     *
     * const nested_span = document.getElementById("nested_span");
     * SipaComponent.instanceOfElement(nested_span);
     * // => NestedComponent
     *
     * const top_span = document.getElementById("top_span");
     * SipaComponent.instanceOfElement(top_span);
     * // => ExampleComponent
     */
    static instanceOfElement(element) {
        const self = SipaComponent;
        // get component main element
        let component = element;
        // component will be null when reaching parent of html
        while (component !== null && component.getAttribute('sipa-id') === null) {
            component = component.parentElement;
        }
        let instance = null;
        if (component) {
            const sipa_id = parseInt(component.getAttribute('sipa-id'));
            instance = self._component_instances.filter((el) => {
                return el._meta.sipa_id === sipa_id
            })[0];
        }
        if (instance) {
            return instance;
        } else {
            console.error(`Instance of element could not be retrieved.`, element);
        }
    }

    /**
     * Register given component class.
     *
     * You need to register every new component that extends by SipaComponent to make it available.
     *
     * @param {SipaComponent} component
     *
     * @example
     *
     * class MyComponent extends SipaComponent {
     *     ...
     * }
     *
     * SipaComponent.registerComponent(MyComponent);
     *
     */
    static registerComponent(component) {
        const self = SipaComponent;
        if (!self._registered_components.includes(component)) {
            self._registered_components.push(component);
        }
    }

    /**
     * Update the data of the component and its children by alias if available
     *
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.reset=false
     * @param {boolean} options.clone=true
     * @private
     */
    _updateData(data, options = {}) {
        const self = SipaComponent;
        options ??= {};
        const default_options = {
            reset: false,
            clone: true,
            parent_only: false,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        if (typeof data !== 'object') {
            throw new Error(`Given 'data' must be of type object! Given: ${Typifier.getType(alias)}`);
        }
        if (data) {
            let data_copy;
            if (options.clone) {
                data_copy = _.cloneDeep(data);
            } else {
                data_copy = data;
            }
            if (options.reset) {
                this._data = data_copy;
            } else {
                this._data = Object.assign(this._data, data_copy);
            }
            this._synchronizeDataToChildren();
            this._synchronizeDataToParent();
        }
    }

    /**
     * Get inherited class
     *
     * @return {SipaComponent}
     */
    _inheritedClass() {
        return this.constructor;
    }

    /**
     * Add sipa-id attribute to given template html
     *
     * @param {string} html
     * @returns {string}
     */
    _applyTemplateId(html) {
        const COMPONENT_TAG_REGEX = /^<([a-zA-Z\-\_0-9]+)/gm;
        return html.replace(COMPONENT_TAG_REGEX, `<$1 sipa-id="${this._meta.sipa_id}"`);
    }

    /**
     * Replace slots to given parsed template
     *
     * @param {ChildNode} parsed
     * @param {string} html raw for performance reasons
     * @returns {string}
     */
    _applySlots(parsed, html) {
        const self = SipaComponent;
        const has_slots = html.includes("<slot");
        if(has_slots) {
            if(this._meta.sipa_body_nodes?.length > 0) {
                const parsed_slots = parsed.querySelectorAll('slot:not(slot slot)');
                [...parsed_slots].eachWithIndex((slot) => {
                    const slot_name = slot.getAttribute("name") || "default";
                    const child_nodes = this._meta.sipa_body_nodes;
                    const final_slot_nodes = [];
                    [...child_nodes].eachWithIndex((node) => {
                        const current_slot_attr = node.getAttribute?.("slot");
                        if((current_slot_attr && current_slot_attr === slot_name) || (!current_slot_attr && slot_name === "default")) {
                            final_slot_nodes.push(node);
                        }
                    });
                    if(final_slot_nodes.length > 0) {
                        slot.replaceWith(...final_slot_nodes);
                    }
                });
            }
            // replace remaining slots with their own (default) content
            parsed.querySelectorAll('slot:not(slot slot)').forEach(el => el.replaceWith(...el.childNodes));
        }
        return parsed;
    }

    /**
     * Add class attribute to given template html.
     * If html string given, return html. If ChildNode given, return ChildNode. (for performance reasons)
     *
     * @param {Object} args
     * @param {string} args.html
     * @param {ChildNode} args.parsed
     * @returns {string|ChildNode}
     */
    _applyTemplateClasses(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (parsed && this._meta.sipa_classes) {
            parsed.className = this._meta.sipa_classes;
        }
        return args.parsed ? parsed : parsed.outerHTML;
    }

    /**
     * Check and set display style to given template html
     *
     * @param {Object} args
     * @param {string} args.html
     * @param {ChildNode} args.parsed
     * @returns {string|ChildNode}
     */
    _applyTemplateHiddenState(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (parsed && parsed.style) {
            if (this.isHidden()) {
                parsed.style.display = 'none';
            } // respect initial display none on the class style attribute
            else if (this._meta.sipa_changed_visibility && !this._meta.sipa_original_display.includes("none") || !this._meta.sipa_changed_visibility) {
                parsed.style.dispaly = this._meta.sipa_original_display;
            } else {
                parsed.style.display = '';
            }
        }
        return args.parsed ? parsed : parsed.outerHTML;
    }

    /**
     * Replace children components to given template html
     *
     * @param {Object} args
     * @param {string} args.html
     * @param {ChildNode} args.parsed
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {string|ChildNode}
     */
    _applyTemplateChildrenComponents(args, options) {
        const self = SipaComponent;
        options ??= {};
        options.cache ??= true;
        const parsed = args.parsed || self._parseHtml(args.html);
        let uninitialized_children = [];
        const children_selector = self._registered_components.map(x => x.tagName() + ':not([sipa-id])').join(", ");
        if(!children_selector) {
            throw new Error(`No registered components found! Ensure, to register your component class after definition with SipaComponent.registerComponent(MyComponent);`);
        }
        uninitialized_children = parsed.querySelectorAll(children_selector);
        const are_children_initialized = typeof this._meta.sipa_children !== 'undefined';
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                this._meta.sipa_children ??= []; // if not set yet, they will be initialized at the first time
                // check for alias
                const alias = el.getAttribute('sipa-alias');
                if (!alias) {
                    throw new Error(`Missing sipa-alias for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                } else if (this._apply_alias_duplicate_list.includes(alias)) {
                    throw new Error(`Duplicate sipa-alias "${alias}" for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                }
                this._apply_alias_duplicate_list.push(alias);
                let child_component = this._meta.sipa_children.find(x => x._meta.sipa_alias === alias);
                const child = self.initElement(el, {sipa_component: child_component, parent_data: this._data});
                if (!this.childrenAliases().includes(alias)) {
                    child._meta.sipa_parent = this;
                    this._addChild(child);
                }
                const child_node = child.node({ cache: options.cache});
                el.replaceWith(child_node);
            });
        }
        return args.parsed ? parsed : parsed.outerHTML;
    }

    /**
     * Replace children components to given template html
     *
     * @param {Object} args
     * @param {string} args.html
     * @param {ChildNode} args.parsed
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {string|ChildNode}
     */
    _applyTemplateSipaList(args, options) {
        const self = SipaComponent;
        const _this = this;
        options ??= {};
        options.cache ??= true;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (parsed) {
            const sipa_list_elements = [...parsed.querySelectorAll(`[sipa-list]:not(${self._registered_components.map(x => LuckyCase.toDashCase(_this.constructor.name) + ' ' + x.tagName() + ' [sipa-list]').join(", ")})`)];
            sipa_list_elements.eachWithIndex((el) => {
                const reference = el.getAttribute("sipa-list");
                if (this._data[reference]) {
                    if (Typifier.isArray(this._data[reference])) {
                        this._data[reference].eachWithIndex((item) => {
                            this._meta.sipa_children ??= []; // if not set yet, they will be initialized at the first time
                            // check for alias
                            const alias = item.alias();
                            if (!alias) {
                                throw new Error(`Missing sipa-alias for embedded component <${item.constructor.tagName()}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                            } else if(this._apply_alias_duplicate_list.includes(alias)) {
                                throw new Error(`Duplicate sipa-alias "${alias}" for embedded component <${item.constructor.tagName()}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                            }
                            this._apply_alias_duplicate_list.push(alias);
                            if (!this.childrenAliases().includes(alias)) {
                                item._meta.sipa_parent = this;
                                item._meta.sipa_list = reference;
                                this._addChild(item);
                            }
                            const child_node = item.node({cache: options.cache});
                            el.append(child_node);
                        });
                    } else {
                        throw new Error(`The given reference '${reference}' for sipa-list in <${LuckyCase.toDashCase(_this.constructor.name)}> must be of type 'Array', but got type '${Typifier.getType(reference)}'.`);
                    }
                } else {
                    throw new Error(`The given reference '${reference}' for sipa-list in <${LuckyCase.toDashCase(_this.constructor.name)}> does not exist!`);
                }
            });
        }
        return args.parsed ? parsed : parsed.outerHTML;
    }

    /**
     * Apply custom attributes to given html template
     *
     * @param {Object} args
     * @param {string} args.html
     * @param {ChildNode} args.parsed
     * @returns {string|ChildNode}
     */
    _applyTemplateCustomAttributes(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (Object.keys(this._meta.sipa_custom_attributes).length > 0) {
            if (parsed) {
                this._meta.sipa_custom_attributes.eachWithIndex((key, value) => {
                    // special case, we merge classes from template class and declarative attr-class
                    if (key === "class") {
                        this.addClass(value, {update: false});
                    } else {
                        parsed.setAttribute(key, value);
                    }
                });
                return args.parsed ? parsed : parsed.outerHTML;
            } else {
                return args.parsed ? parsed : html;
            }
        }
        return args.parsed ? parsed : html;
    }

    /**
     * Parse Html string to element and return the first element of the string
     *
     * @param html
     * @returns {ChildNode}
     */
    static _parseHtml(html) {
        return document.createRange().createContextualFragment(html).firstElementChild;
    }

    /**
     * Generate unique component id (auto increment)
     *
     * @return {number}
     */
    static _generateUniqueId() {
        const self = SipaComponent;
        return self._component_id_incrementer++;
    }

    /**
     * Synchronize children data from current instance to its children
     *
     * @param {Object} options
     * @param {boolean} options.recursive=false synchronize through all children trees
     */
    _synchronizeDataToChildren(options = {}) {
        options ??= {};
        options.recursive ??= false;
        this.childrenAliases().eachWithIndex((alias, i) => {
            if (typeof this._data[alias] === "object") {
                this.children()[alias]._updateData(this._data[alias], {clone: false});
            } else if (typeof this._data[alias] !== 'undefined') {
                throw new Error(`Given alias 'data.${alias}' must be of type object! Given: ${Typifier.getType(alias)}`);
            }
            if (options.recursive) {
                this.children().eachWithIndex((alias, child) => {
                    child.syncNestedReferences();
                });
            }
        });
    }

    /**
     * Refresh data reference from current instance to its parent
     */
    _synchronizeDataToParent() {
        if (this.hasParent()) {
            this.parent()._data[this.alias()] = this._data;
        }
    }

    /**
     * Add component child class instance to list of current instance children
     *
     * @param {SipaComponent} child
     */
    _addChild(child) {
        this._meta.sipa_children.push(child);
    }
}

/**
 * @typedef {Object} SipaComponent.Meta
 * @property {number} sipa_id auto increment
 * @property {string} sipa_classes internal state representation for classes managed by components methods addClass() and removeClass()
 * @property {boolean} sipa_hidden=false state representation of hide() and show() methods
 * @property {boolean} sipa_cache=true use node caching for templates
 * @property {string} sipa_alias alias to access children by uniq accessor name
 * @property {Array<SipaComponent>} sipa_children array of children sipa components
 * @property {SipaComponent} sipa_parent parent sipa component when using nested components
 * @property {string} sipa_list parent sipa components _data reference, if the component has been initialized by using sipa-list
 * @property {string} sipa_original_display store original display style when using hide() to restore on show()
 * @property {boolean} sipa_changed_visibility info if visibility has been changed at least once
 * @property {Object<string, string>} sipa_custom_attributes state representation of declarative custom attributes defined with attr- prefix
 * @property {NodeList} sipa_body_nodes body as childNodes of original declarative element
 */

/**
 * @typedef {Object} SipaComponent.Data
 */

/**
 * @typedef {Object} SipaComponent.Options
 * @property {boolean} update_view_only_when_visible=false
 */

/**
 * Returns the template. Can be with embedded with EJS.
 *
 * @return {string}
 *
 * @example
 *
 * class MyComponent extends SipaComponent {
 *   ...
 * }
 *
 * MyComponent.template = () => {
 *     return `
 * <my-component>
 *     Hello <%= name %>!
 *     <% if(age > 77) { %>
 *         <br>You are very old!
 *     <% } %>
 * </my-component>
 *     `;
 * }
 *
 */
SipaComponent.template = () => {
    return `
<sipa-component>
    Hello Sipa!
</sipa-component>
    `.trim();
};

/**
 * Get instance of current component. For usage in component templates
 *
 * Handy shortcut alias for SipaComponent.instanceOfElement().
 *
 * @param {Element} element
 * @return {SipaComponent}
 *
 * @example
 *
 * class MyComponent extends SipaComponent {
 *   dance() {
 *   }
 * }
 *
 * class SuperComponent extends SipaComponent {
 *     superMan() {
 *     }
 * }
 *
 * MyComponent.template = () => {
 *     return `
 * <my-component onclick="instance(this).dance();" onblur="instance(this).children().supp.superMan();">
 *     Hello <%= name %>!
 *     <super-component sipa-alias="supp" attr-onclick="instance(this).superMan();" attr-onblur="instance(this).parent().dance();"></super-component>
 * </my-component>
 *     `;
 * }
 */
function instance(element) {
    return SipaComponent.instanceOfElement(element);
}
/**
 * Serializer to serialize data of primitive types or even complex Objects,
 * to ensure to be stored as valid JSON and can be deserialized back without data loss.
 *
 * Includes support for
 * - Boolean, Number, String, Array, Object, null (native JS[SON] support)
 * And special type handling to support the following types
 * - Functions
 * - RegExp, Date
 * - NaN, Infinity, undefined
 * - empty (special type when deleting an item of an array)
 *
 * The special types are escaped by an internal escaping when serialized.
 * See SipaSerializer.STORAGE_PLACEHOLDERS for the escapes.
 */
class SipaSerializer {

    /**
     * Serialize given value to be stored in JSON without loosing its original value
     *
     * @param {any} value
     * @returns {string|null} returns string or null if value is null
     */
    static serialize(value) {
        const self = SipaSerializer;
        if (typeof value === 'undefined') {
            return '::undefined::';
        } else if (value === null) {
            return null;
        } else if (typeof value === 'function') {
            return value.toString();
        } else if (Typifier.isNaN(value)) {
            return '::NaN::';
        } else if (Typifier.isInfinity(value)) {
            return '::Infinity::';
        } else if (Typifier.isDate(value)) {
            return `::Date::${value.toISOString()}`;
        } else if (Typifier.isRegExp(value)) {
            return `::RegExp::${value.toString()}`;
        } else if (typeof value !== 'undefined' && typeof JSON.stringify(value) === 'undefined') {
            throw `You can store references only at persistence level ${self.LEVEL.VARIABLE}`;
        } else if (Typifier.isArray(value) || Typifier.isObject(value)) {
            return JSON.stringify(self.deepSerializeSpecialTypes(value));
        } else {
            return JSON.stringify(value);
        }
    }

    /**
     * Serialize given value to be stored in JSON without loosing its original value
     *
     * @param {String|null} value
     * @returns {Boolean|String|Number|Array|Object|RegExp|Date|undefined|NaN|Infinity|null|*}
     */
    static deserialize(value) {
        const self = SipaSerializer;
        if (value === '::undefined::') {
            return undefined;
        } else if (value === '::NaN::') {
            return NaN;
        } else if (value === '::Infinity::') {
            return Infinity;
        } else if (SipaSerializer.isFunctionString(value)) {
            return SipaSerializer.deserializeFunctionString(value);
        } else if (Typifier.isString(value) && value.startsWith('::Date::')) {
            return new Date(value.replace('::Date::',''));
        } else if (Typifier.isString(value) && value.startsWith('::RegExp::')) {
            let full_regex_string = value.replace('::RegExp::','');
            let regex_source = full_regex_string.substring(1,full_regex_string.lastIndexOf('/'));
            let regex_flags = full_regex_string.substring(full_regex_string.lastIndexOf('/')+1,full_regex_string.length);
            return new RegExp(regex_source, regex_flags);
        } else {
            try {
                let parsed = JSON.parse(value);
                if (Typifier.isArray(parsed) || Typifier.isObject(parsed)) {
                    return self.deepDeserializeSpecialTypes(parsed);
                } else {
                    return parsed;
                }
            } catch (e) {
                return value;
            }
        }
    }

    /**
     * Check if given string is a valid javascript function
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isFunctionString(value) {
        const self = SipaSerializer;
        if (!Typifier.isString(value)) {
            return false;
        }
        // complete function for final evaluation
        if (value.match(self.VALID_FUNCTION_WITHOUT_PREFIX_REGEX)) {
            value = 'function ' + value;
        }
        if (value.match(self.VALID_FUNCTION_WITHOUT_NAME_REGEX)) {
            value = value.replace('function', 'function fn');
        }

        // if complete and valid, make final validation
        if (value.match(self.VALID_FUNCTION_REGEX)) {
            try {
                // finally evaluate correct function syntax
                new Function(value);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Check if given string is a valid javascript array
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isArrayString(value) {
        const self = SipaSerializer;
        if(Typifier.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    let array = JSON.parse(trimmed);
                    return Typifier.isArray(array);
                } catch(e) {
                }
            }
        }
        return false;
    }

    /**
     * Check if given string is a valid javascript object
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isObjectString(value) {
        const self = SipaSerializer;
        if(Typifier.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    let object = JSON.parse(trimmed);
                    return Typifier.isObject(object);
                } catch(e) {
                }
            }
        }
        return false;
    }

    /**
     * Deserialize a valid javascript string into a callable function
     *
     * @param {String} value
     * @returns {Function}
     */
    static deserializeFunctionString(value) {
        const self = SipaSerializer;
        let fn = null;
        if (value.match(self.VALID_FUNCTION_WITHOUT_PREFIX_REGEX)) {
            eval('fn = function ' + value);
        } else {
            eval('fn = ' + value);
        }
        return fn;
    }

    /**
     * Serializes (escapes) all special types within an Array or Object
     * to be stored in JSON without data loss.
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     */
    static deepSerializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (Typifier.isArray(copy)) {
            copy = self._serializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (Typifier.isArray(value) || Typifier.isObject(value)) {
                return copy[key] = self.deepSerializeSpecialTypes(copy[key]);
            } else if (self._isSpecialType(copy[key])) {
                copy[key] = self.serialize(copy[key]);
            }
        });
        return copy;
    }

    /**
     * Deserializes (unescapes) all special types of the given Array or Object
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     */
    static deepDeserializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (Typifier.isArray(copy)) {
            copy = self._deserializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (Typifier.isArray(value) || Typifier.isObject(value)) {
                return copy[key] = self.deepDeserializeSpecialTypes(copy[key]);
            } else if (self._isSerializedSpecialType(copy[key])) {
                copy[key] = self.deserialize(copy[key]);
            }
        });
        return copy;
    }

    /**
     * Serialize (escape) special type 'empty' inside the given Array.
     * Only on first dimension/level, nesting is ignored.
     *
     * @param {Array} array
     * @returns {Array}
     * @private
     */
    static _serializeEmptyArrayValues(array) {
        if (Typifier.isArray(array) && Object.entries(array).length < array.length) {
            for (let i = 0; i < array.length; ++i) {
                if (SipaHelper.isArrayContainingEmptyValue(array.slice(i, i + 1))) {
                    array[i] = '::empty::';
                }
            }
        }
        return array;
    }

    /**
     * Deserialize (unescape) special type 'empty' inside given Array
     * Only on first dimension/level, nesting is ignored.
     *
     * @param {Array} array
     * @returns {Array}
     * @private
     */
    static _deserializeEmptyArrayValues(array) {
        for (let i = 0; i < array.length; ++i) {
            if (array[i] === '::empty::') {
                delete array[i];
            }
        }
        return array;
    }

    /**
     * Check if given value is of special type that needs
     * to be escaped before parsing to JSON.
     *
     * @param {any} value
     * @returns {boolean} true if special type
     * @private
     */
    static _isSpecialType(value) {
        return Typifier.isUndefined(value) ||
            Typifier.isNaN(value) ||
            Typifier.isInfinity(value) ||
            Typifier.isDate(value) ||
            Typifier.isRegExp(value)
    }

    /**
     * Check if given value is an serialized (escaped) special type
     *
     * @param {any} value
     * @returns {boolean}
     * @private
     */
    static _isSerializedSpecialType(value) {
        const self = SipaSerializer;
        if(!Typifier.isString(value)) {
            return false;
        }
        const special_types = Object.keys(self.STORAGE_PLACEHOLDERS);
        for(let i = 0; i < special_types.length; ++i) {
            if(value.startsWith(special_types[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Clone the given Array or Object.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     * @private
     */
    static _cloneObject(obj) {
        let clone = null;
        if(Typifier.isArray(obj)) {
            clone = obj.slice();
        } else if(Typifier.isObject(obj)) {
            clone = Object.assign({}, obj);
        } else {
            throw `Parameter must be of type 'Array' or 'Object'! Given type: '${Typifier.getType(obj)}'`;
        }
        return clone;
    }
}

// Regex to match usual functions and arrow functions
SipaSerializer.VALID_FUNCTION_REGEX = /^\s*(\([^\)]*\)\s*\=\>|function\s*[^\s0-9]+[^\s]*\s*(\([^\)]*\)))\s*\{.*\}\s*$/gms;
// Regex to match valid functions without function name
SipaSerializer.VALID_FUNCTION_WITHOUT_NAME_REGEX = /^(\s*function)(\s*)((\([^\)]*\))\s*\{.*\}\s*)$/gms;
// Regex to match valid function with name but without prefix 'function'
SipaSerializer.VALID_FUNCTION_WITHOUT_PREFIX_REGEX = /^\s*((?!function).)\s*[^\s0-9]+[^\s]*\s*(\([^\)]*\))\s*\{.*\}\s*$/gms;

SipaSerializer.STORAGE_PLACEHOLDERS = {
    '::undefined::': undefined,
    '::NaN::': NaN,
    '::Infinity::': Infinity,
    '::empty::': 'SpecialCaseForDeletedArrayEntryThatBehavesSimilarLikeUndefined',
    '::Date::': Date,
    '::RegExp::': RegExp
}
/**
 * Tool class to store global states at different persistence levels.
 *
 * Level 1 (variable): Data will be lost after reload (SipaState.LEVEL.VARIABLE)
 *                     You can even store references and functions!
 *
 * Level 2 (session): Data will be lost when browser is closed (SipaState.LEVEL.SESSION)
 *                    You can not store references but thanks to SipaSerializer isolated functions are possible!
 *
 * Level 3 (storage): Data will be lost when clearing browser cache only (SipaState.LEVEL.STORAGE)
 *                    You can not store references but thanks to SipaSerializer isolated functions are possible!
 *
 */
class SipaState {
    /**
     * Set a value with the given persistence level, by default SipaState.LEVEL.SESSION
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {SipaState.Level} options.level='session'
     * @param {boolean} options.force=false overwrite value, if it is set at another level already
     */
    static set(key, value, options = {}) {
        const self = SipaState;
        SipaHelper.validateParams([
            {param_name: 'key', param_value: key, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        if (!options) options = {};
        if (typeof options.level === 'undefined') options.level = self.LEVEL.SESSION;
        let store = self._getStoreByLevel(options.level);
        if (self.getLevel(key) === options.level || !self.hasKey(key) || options.force) {
            if (options.level === self.LEVEL.VARIABLE) {
                store[self._makeFinalKey(key)] = value;
            } else {
                store.setItem(self._makeFinalKey(key), SipaSerializer.serialize(value));
            }
        } else {
            self._throwKeyAlreadySetError(key);
        }
    }

    /**
     * Set value in persistence level 1 (variable)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setVariable(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.VARIABLE;
        self.set(key, value, options);
    }

    /**
     * Set value in persistence level 2 (session)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setSession(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.SESSION;
        self.set(key, value, options);
    }

    /**
     * Set value in persistence level 3 (storage)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setStorage(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.STORAGE;
        self.set(key, value, options);
    }

    /**
     * Get the persistence level of the value stored at the given key.
     * If key is not set at any level, returns null.
     *
     * @param {string} key
     * @returns {SipaState.LEVEL|null}
     */
    static getLevel(key) {
        const self = SipaState;
        if (Object.keys(self.getVariables()).includes(key)) {
            return self.LEVEL.VARIABLE;
        } else if (Object.keys(self.getSession()).includes(key)) {
            return self.LEVEL.SESSION;
        } else if (Object.keys(self.getStorage()).includes(key)) {
            return self.LEVEL.STORAGE;
        } else {
            return null;
        }
    }

    /**
     * Check if key is set already at any persistence level
     *
     * @param {string} key
     * @returns {boolean}
     */
    static hasKey(key) {
        const self = SipaState;
        return Object.keys(self.getAll()).includes(key);
    }

    /**
     * Get the value of the given key. Persistence level does not matter and is implicit.
     *
     * @param {string} key
     */
    static get(key) {
        const self = SipaState;
        return self.getAll()[key];
    }

    /**
     * Get all entries of persistence level 1 (variables)
     *
     * @returns {Object<String, any>}
     */
    static getVariables() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.VARIABLE);
    }

    /**
     * Get all entries of persistence level 2 (session)
     *
     * @returns {Object<String, any>}
     */
    static getSession() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.SESSION);
    }

    /**
     * Get all entries of persistence level 3 (storage)
     *
     * @returns {Object<String, any>}
     */
    static getStorage() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.STORAGE);
    }

    /**
     * Get all stored entries
     *
     * @returns {Object<String, any>}
     */
    static getAll() {
        const self = SipaState;
        return Object.assign(Object.assign(self.getVariables(), self.getSession()), self.getStorage());
    }

    /**
     * Get all keys
     * @returns {Array<String>}
     */
    static getKeys() {
        const self = SipaState;
        return Object.keys(self.getAll());
    }

    /**
     * Remove the stored value of the given key(s)
     *
     * @param {string|Array} key key or keys to remove
     * @returns {boolean} true if value of any key was set and has been removed. False if no key did exist.
     */
    static remove(key) {
        const self = SipaState;
        let any_key_exists = false;
        let keys = null;
        if (Typifier.isString(key)) {
            keys = [key];
        } else if (Typifier.isArray(key)) {
            keys = key;
        } else {
            throw `Invalid parameter type for key: ${Typifier.getType(key)}`;
        }
        keys.forEach((key) => {
            const key_exists = self.hasKey(key);
            if (key_exists) {
                any_key_exists = true;
                switch (self.getLevel(key)) {
                    case self.LEVEL.VARIABLE:
                        delete self._variables[self._makeFinalKey(key)];
                        break;
                    case self.LEVEL.SESSION:
                        sessionStorage.removeItem(self._makeFinalKey(key));
                        break;
                    case self.LEVEL.STORAGE:
                        localStorage.removeItem((self._makeFinalKey(key)));
                        break;
                }
            }
        });
        return any_key_exists;
    }

    /**
     * Delete all stored data - alias method for reset()
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static removeAll() {
        const self = SipaState;
        return self.reset();
    }

    /**
     * Delete all stored data
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static reset() {
        const self = SipaState;
        const remove_result = self.remove(self.getKeys());
        return remove_result;
    }

    /**
     *
     * @param {SipaState.Level} level
     * @return {Object<string, any>}
     * @private
     */
    static _getAllBy(level) {
        const self = SipaState;
        let store = self._getStoreByLevel(level);
        const keys = Object.keys(store).filter((i) => {
            return i.startsWith(self.PERSISTENCE_PREFIX);
        });
        let all = {};
        for (let key of keys) {
            all[self._reduceKey(key)] = SipaSerializer.deserialize(store[key]);
        }
        return all;
    }

    /**
     * Get store by level
     *
     * @param {SipaState.Level} level
     * @returns {Storage|object}
     * @private
     */
    static _getStoreByLevel(level) {
        const self = SipaState;
        switch (level) {
            case self.LEVEL.VARIABLE:
                return self._variables;
            case self.LEVEL.SESSION:
                return sessionStorage;
            case self.LEVEL.STORAGE:
                return localStorage;
            default:
                throw `Invalid level '${level}'.`
        }
    }

    /**
     * Ensure key is prefixed
     *
     * @param {string} key
     * @returns {string}
     * @private
     */
    static _makeFinalKey(key) {
        const self = SipaState;
        if (key.startsWith(self.PERSISTENCE_PREFIX)) {
            return key;
        } else {
            return self.PERSISTENCE_PREFIX + key;
        }
    }

    /**
     * Get key without prefix
     *
     * @param key
     * @private
     */
    static _reduceKey(key) {
        const self = SipaState;
        if (key.startsWith(self.PERSISTENCE_PREFIX)) {
            return key.substr(self.PERSISTENCE_PREFIX.length);
        } else {
            return key;
        }
    }

    static _throwKeyAlreadySetError(key) {
        const self = SipaState;
        throw `Key '${key}' has already been set at persistence level '${self.getLevel(key)}'!`;
    }

    static get length() {
        const self = SipaState;
        return self.getKeys().length;
    }
}

SipaState.LEVEL = {
    VARIABLE: 'variable',
    SESSION: 'session',
    STORAGE: 'storage',
}

SipaState.PERSISTENCE_PREFIX = 'SipaState_';

SipaState._variables = {}; // Level 1 persistence

/**
 * @typedef {'variable'|'session'|'storage'} SipaState.Level
 */
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
     * updated from your package.json at every release build cycle.
     *
     * @returns {string}
     */
    static version() {
        const obj = {
            "version": "0.0.1", "unique_id": "SipaEnv.version.selector"
        }
        return obj.version;
    }

    /**
     * Get the current name of your app.
     *
     * The returned value within this method will automatically be
     * updated from your package.json at every release build cycle.
     *
     * @returns {string}
     */
    static name() {
        const obj = {
            "name": "Name", "unique_id": "SipaEnv.name.selector"
        }
        return obj.version;
    }



    /**
     * Get the current description of your app.
     *
     * The returned value within this method will automatically be
     * updated from your package.json at every release build cycle.
     *
     * @returns {string}
     */
    static description() {
        const obj = {
            "description": "Description", "unique_id": "SipaEnv.description.selector"
        }
        return obj.version;
    }

    /**
     * Check if Sipa is running at localhost.
     *
     * @returns {boolean} true if localhost, otherwise false
     */
    static isRunningLocalHost() {
        const host = window.location.hostname;
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled
     *
     * @param {string|any} text
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
     * @example
     * SipaHelper.mergeOptions({ a: 1, b: "two"},{b: "TWO", c: null });
     * // => { a: 1, b: "TWO", c: null }
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
     * Check if given value is a array (slice) of size 1 and contains type empty
     *
     * @example
     * let arr = ["one"];
     * delete arr[1]:
     * arr;
     * // => [empty]
     * SipaHelper.isArrayContainingEmptyValue(arr);
     * // => true
     *
     * @param {any} value
     * @returns {boolean} true if a array of size 1 and contains empty => [empty], if size is 1 and not of type empty then false
     * @throws {Error} if array is not of size 1
     */
    static isArrayContainingEmptyValue(value) {
        const self = SipaHelper;
        if(Typifier.isArray(value) && value.length === 1) {
            if(Object.entries(value).length === 0) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error()
        }
    }

    /**
     * Check the given parameter to be of the expected type.
     * If is is not valid, throw an exception.
     *
     * @example
     * function Example(param_one, other_param) {
     *     SipaHelper.validateParams([
     *         {param_name: 'param_one', param_value: param_one, expected_type: 'Object'},
     *         {param_name: 'other_param', param_value: other_param, expected_type: 'boolean'},
     *     ]);
     * }
     * Example("one",true);
     * // => Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!`
     *
     * @param {Array<SipaParamValidation>} params
     * @throws {Error} throws an error if given parameter is not valid.
     */
    static validateParams(params = []) {
        const self = SipaHelper;
        if (Typifier.getType(params) !== 'Array') {
            self.throwParamError('params', params, 'Array');
        } else {
            params.forEach((elem) => {
                if (Typifier.getType(elem.param_value) !== elem.expected_type) {
                    self.throwParamError(elem.param_name, elem.param_value, elem.expected_type);
                }
            });
        }
    }

    static throwParamError(param_name, param, expected_type) {
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '${Typifier.getType(param)}'!`;
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
            {param_name: 'text', param_value: text, expected_type: 'string'},
            {param_name: 'leading_characters', param_value: leading_characters, expected_type: 'string'},
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
            {param_name: 'text', param_value: text, expected_type: 'string'},
            {param_name: 'trailing_characters', param_value: trailing_characters, expected_type: 'string'},
        ]);
        if (text.endsWith(trailing_characters)) {
            return text.substr(0,text.indexOf(trailing_characters));
        } else {
            return text;
        }
    }

    /**
     * Transform the given string into its constant representation.
     *
     * @example
     * class Foo {
     *     static function bar() { console.log("foobar"); }
     * }
     *
     * SipaHelper.constantizeString("Foo").bar();
     * // => foobar
     *
     * @param {string} constant
     * @returns {*}
     */
    static constantizeString(constant) {
        const self = SipaHelper;
        if (!self._constant_cache[constant]) {
            // check for valid constant name
            if (constant.match(/^[a-zA-Z0-9_]+$/)) {
                self._constant_cache[constant] = eval(constant);
            } else {
                throw new Error(`Invalid constant '${constant}'`);
            }
        }
        return self._constant_cache[constant];
    }
}

/**
 * @type {Object.<string, any>}
 * @private
 */
SipaHelper._constant_cache = {};

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
     * @example
     * SipaHooks.beforeInitPage('on', () => {
     *     console.log("This is run before onInit() of any page is executed!");
     * }
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
     * Set, remove or trigger event 'beforeDestroyPage'
     *
     * @example
     * SipaHooks.beforeDestroyPage('on', () => {
     *     console.log("This is run before onDestroy() of any page is executed!");
     * }
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
     * Set, remove or trigger event 'beforeInitLayout'
     *
     * @example
     * SipaHooks.beforeInitLayout('on', () => {
     *     console.log("This is run before onInit() of any layout is executed!");
     * }
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
     * Set, remove or trigger event 'beforeDestroyLayout'
     *
     * @example
     * SipaHooks.beforeDestroyLayout('on', () => {
     *     console.log("This is run before onDestroy) of any layout is executed!");
     * }
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

    static _triggerFunctions(array, element_id) {
        array.forEach((fun) => {
            if (typeof fun === 'function') {
                fun(element_id);
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
/**
 * SipaOnsenHooks
 *
 * App hook manager extending SipaHooks with additional hooks for OnsenUI.
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
        if(!options.layout_id && self.config.default_layouts && self.config.default_layouts.hasOwnProperty(new_page_id)) {
            options.layout_id = self.config.default_layouts[new_page_id];
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
        const last_page_id = self.currentPageId();
        const layout_id = self.extractIdOfTemplate(options.layout_id, {type: 'layout'});
        const page_path = self._makeFullPath(new_page_id, {type: 'page'});
        const j_body = $('body');
        j_body.attr('data-page-id', new_page_id);
        self.loadLayout(layout_id, {
            success: (data, text, response) => {
                $.ajax({
                    url: page_path,
                    method: 'GET',
                    dataType: 'html',
                    cache: false,
                    success: (data, text, response) => {
                        const j_container = $(self.page_container_css_selector);
                        const load_function = () => {
                            SipaHooks.beforeDestroyPage('trigger');
                            if (last_page_id) {
                                self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: new_page_id}]);
                            }
                            j_container.html(data);
                            SipaHooks.beforeInitPage('trigger');
                            if (options.fade_effect) {
                                j_container.fadeIn(150);
                            }
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
                            if(Typifier.isFunction(options.success)) {
                                options.success(data, text, response);
                            }
                            if(Typifier.isFunction(options.always)) {
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
                        if(Typifier.isFunction(options.error)) {
                            options.error(response, text, data);
                        }
                        if(Typifier.isFunction(options.always)) {
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
        if(id.match(/\/[^\/]+\.html$/)) {
            id = id.split("/").slice(0,id.split("/").length-1).join("/");
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
        if(typeof window !== 'undefined') {
            SipaPage.initHistoryState();
        }
    }

    static isInitialized() {
        const self = SipaPage;
        return self.config !== null;
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
 * @param {'slide'|'lift'|'fade'|'none'|'slide-ios'|'lift-ios'|'fade-ios'|'slide-md'|'lift-md'|'fade-md'} animation Animation name. Available animations are "slide", "lift", "fade" and "none". These are platform based animations. For fixed animations, add "-ios" or "-md" suffix to the animation name. E.g. "lift-ios", "lift-md". Defaults values are "slide-ios" and "fade-md".
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
/**
 * SipaUrl
 *
 * Tool class to access and manipulate
 * the current or given URLs
 */
class SipaUrl {
    /**
     * Get the current address of the website
     *
     * @example
     * SipaUrl.getUrl();
     * // => https://my-website.com/web/?page=abc&param=ok
     *
     * @returns {string}
     */
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the protocol of the current url (without colon)
     *
     * @example
     * SipaUrl.getProtocol();
     * // => 'https'
     *
     * @returns {'http'|'https'}
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

    /**
     * Get all params of the current URL
     *
     * @example
     * // URL: https://my-business.com/?one=1&stat=true
     * SipaUrl.getParams();
     * // => { "one": "1", "stat": "true" }
     *
     * @returns {Object<string, string>}
     */
    static getParams() {
        const self = SipaUrl;
        return self.getParamsOfUrl(self.getUrl());
    }

    /**
     * Set or overwrite given parameters of the current url
     *
     * @example
     * // URL: https://my-business.com/?one=1&stat=true&that=cool
     * SipaUrl.setParams({ "more": "better", "stat": "false"});
     * // URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
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
     * @example
     * // URL: https://my-business.com/?super=banana&coca=cola
     * SipaUrl.setParam("pepsi","coke");
     * // URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
     *
     * @param {string} param_key
     * @param {string} value
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
    }

    /**
     * Remove given params of the current url
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar&more=power
     * SipaUrl.removeParams(["some","more"]);
     * // URL: https://my-business.com/?foo=bar
     *
     * @param {Array<String>} param_keys
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self._setUrl(new_url);
    }

    /**
     * Remove given param of the current url
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.removeParam("foo");
     * // URL: https://my-business.com/?some=stuff
     * @param {string} param_key
     */
    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        self.removeParams([param_key]);
    }

    /**
     * Set or overwrite given anchor of the current url
     *
     * @param {string} anchor without leading # character
     * @param {boolean} jump jump to anchor
     */
    static setAnchor(anchor, jump = false) {
        const self = SipaUrl;
        if(typeof anchor === "undefined") {
            self.removeAnchor();
        }
        if (jump) {
            let state = {};
            if (window.history.state) {
                state = window.history.state;
            }
            let params = {page: state.page_id};
            if(typeof anchor !== "undefined") {
                window.location.href = window.location.href + '#' + anchor;
            } else {
                window.location.href = self.removeAnchorOfUrl(window.location.href);
            }
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(SipaUrl.getUrl(), params));
        } else {
            const new_url = self.setAnchorOfUrl(self.getUrl(), anchor);
            self._setUrl(new_url);
        }
    }

    /**
     * Remove the anchor of the current URL
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.removeAnchor();
     * // URL: https://my-business.com/?some=stuff&foo=bar
     *
     */
    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self._setUrl(new_url);
    }

    /**
     * Get the anchor of the current URL without leading #
     *
     * @returns {string}
     */
    static getAnchor() {
        const self = SipaUrl;
        return self.getAnchorOfUrl(self.getUrl());
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
            if (Typifier.isArray(value) && options.multi_param_attributes) {
                if (options.url_encode) {
                    ret.push(
                        encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join('&' + encodeURIComponent(key) + '=')
                    );
                } else {
                    ret.push(
                        key + '=' + value.join(key + '=')
                    );
                }
            } else {
                if (options.url_encode) {
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
     * @example
     * SipaUrl.getParamsOfUrl("https://my-business.com/?some=stuff&foo=bar");
     * // => { "some": "stuff", "foo": "bar" }
     *
     * @param {string} url the url to extract parameters from
     * @param {Object} options
     * @param {boolean} options.decode_uri decode uri parameter values
     * @returns {Object<string, string>} return a JSON with { param1: value1, param2: value2, ... }
     */
    static getParamsOfUrl(url, options = {}) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            decode_uri: true, // decode url variables
        };
        options = SipaHelper.mergeOptions(default_options, options);
        url = self.removeAnchorOfUrl(url);
        let obj = {};
        let query_string = null;
        try {
            query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : (new URL(url)).search.slice(1);
        } catch (e) {
            return obj; // return empty object if it is no valid url
        }
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
            {param_name: 'url', param_value: url, expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (curr_params[key]) {
                delete curr_params[key];
            }
        });
        let query_params = self.createUrlParams(curr_params);
        if (query_params) {
            query_params = '?' + query_params;
        }
        if(typeof anchor === "undefined") {
            anchor = "";
        }
        return self._getUrlWithoutParams(url) + query_params + anchor;
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
            {param_value: param_key, param_name: 'param_key', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
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
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        if(typeof anchor === "undefined") {
            anchor = "";
        }
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self.removeAnchorOfUrl(self._getUrlWithoutParams(url)) + '?' + self.createUrlParams(curr_params) + anchor;
    }


    /**
     * Set/overwrite the anchor of the given url
     *
     * @param {string} url
     * @param {string} anchor as string, without leading #
     * @returns {string} with given anchor
     */
    static setAnchorOfUrl(url, anchor) {
        const self = SipaUrl;
        if(typeof anchor === "undefined") {
            return url;
        }
        SipaHelper.validateParams([
            {param_value: anchor, param_name: 'anchor', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let final_url = self._getUrlWithoutParams(url);
        if (Object.keys(curr_params).length > 0) {
            final_url += '?';
        }
        return final_url + self.createUrlParams(curr_params) + '#' + anchor;
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
            {param_value: url, param_name: 'url', expected_type: 'string'},
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
            return undefined;
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
            {param_value: url, param_name: 'url', expected_type: 'string'}
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
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (url.indexOf('?') !== -1) {
            return url.substr(0, url.indexOf('?'));
        } else {
            return url;
        }
    }

    /**
     * Overwrite the current url with the given url
     *
     * @param {string} url
     * @private
     */
    static _setUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        window.history.replaceState(window.history.state, '', url);
    }
}

/**
 * Sipa
 *
 * Framework core class to provide core functionality.
 */
class Sipa {
    /**
     * Get the version of the used library
     * @returns {string}
     */
    static getVersion() {
        const self = Sipa;
        return self._version;
    }
    /**
     * Callback function to fire to init the whole Sipa app.
     *
     * This is the entry point for your app. The given callback is called after Sipa is initialized.
     *
     * @example
     * Sipa.init(() => {
     *   SipaPage.load('login');
     * });
     *
     * @param {function} init_function
     */
    static init(init_function) {
        document.addEventListener('DOMContentLoaded', function () {
            // start in new thread, otherwise it
            // will collide with live web server
            setTimeout(init_function,0);
        }, false);
    }
}

/**
 * @type {string}
 * @private
 */
Sipa._version = "0.9.34";

// Alias
var Simpartic = Sipa;
/**
 * SipaOnsen
 *
 * Framework core class to provide core functionality for OnsenUI.
 */
class SipaOnsen extends Sipa {
    /**
     * Function to fire to init the whole Sipa OnsenUI based app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        ons.ready(function () {
            setTimeout(init_function,0);
        });
    }
}
