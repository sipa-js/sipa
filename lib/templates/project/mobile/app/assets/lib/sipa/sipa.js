/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version 0.9.44
 * @date 2025-11-17T10:21:41.292Z
 * @link https://github.com/sipa-js/sipa
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */
/**
 * Basic class for pages and layouts
 */
class SipaBasicView {
    /**
     * Called when the view is initialized
     *
     * @example
     *
     * class MyPage extends SipaBasicView {
     *   static onInit() {
     *     console.log("MyPage initialized");
     *   }
     * }
     *
     * SipaPage.load('my-page');
     * // => "MyPage initialized"
     *
     */
    static onInit() {
        // called when page has been loaded, before fade animation
    }

    /**
     * Called when the view is destroyed, when leaving the page.
     *
     * @example
     *
     * class MyPage extends SipaBasicView {
     *   static onDestroy() {
     *     console.log("MyPage destroyed");
     *   }
     * }
     *
     * SipaPage.load('my-page');
     * // => "MyPage initialized"
     * SipaPage.load('another-page');
     * // => "MyPage destroyed"
     *
     */
    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    /**
     * Shortcut to reinitialize the view (calls onDestroy and onInit)
     */
    static reinit() {
        this.onDestroy();
        this.onInit();
    }

    /**
     * Check if the current view is loaded
     *
     * @example
     * // Given ImprintPage is loaded
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
     * @example
     * class MyPage extends SipaBasicView {
     * }
     *
     * MyPage.type()
     * // => 'page'
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
 * The SipaEvents class provides a simple event system where you can define valid event names,
 * subscribe to events with callback functions, unsubscribe from events, and trigger events with optional parameters.
 *
 * Typical use cases are:
 * - A component wants to notify other components or business logic about changes.
 * - A component wants to react on changes of other components.
 * - A component wants to provide hooks for business logic.
 *
 * A typical way, to integrate SipaEvents in your class is to provide an events() method that returns an instance
 * of SipaEvents as shown in the example below.
 *
 * The amount of params is not limited. You can pass as many params as you want to the callback function.
 *
 * @example
 *
 *  // To extend a class with events, the suggested pattern is the following, directly defining the valid event names at initialization:
 *  class MyClass {
 *    // ...
 *
 *    events() {
 *           return this._events ??= new SipaEvents(['click','delete','update']);
 *    }
 *
 *    onClick() {
 *           this.events().trigger('click', [param1, param2, param3, ...], options);
 *    }
 *  }
 *
 *  m = new MyClass();
 *  m.events().subscribe('click', (param1, param2, param3, ...) => {
 *      console.log("There was a click on my class ...");
 *  });
 *
 */
class SipaEvents {
    /**
     * Valid event names for better error handling.
     * When a user tries to subscribe or trigger an event name that is not in this list, an error is thrown.
     * @type {Array<string>}
     * @private
     */
    _valid_event_names = [];
    /**
     * Here we store registered events.
     * @type {Object<string,Array<function>>}
     * @private
     */
    _event_registry = {};
    /**
     * Create a new SipaEvents instance with the given valid event names.
     *
     * Valid element names ensure that only known events are used and will otherwise throw an error.
     *
     * @example
     *
     * const my_sipa_events = new SipaEvents('click','delete','update');
     *
     * @param {...string} [valid_event_names] define the available, valid event names
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
     * Subscribe to an event with a callback function.
     *
     * @example
     *
     * my_sipa_events.subscribe('click', (param1, param2, param3, ...) => {
     *     console.log("There was a click on my class ...");
     *     // do something with param1, param2, param3, ...
     * });
     *
     * @param {string} event_name must be one of this._valid_event_names
     * @param {function} callback
     * @throws {Error} when event_name is not valid
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
     * Unsubscribe from an event that has been subscribed before.
     *
     * The callback function must be the same function reference as used in subscribe().
     *
     * @example
     *
     * my_sipa_events.unsubscribe('click', my_callback_function);
     *
     * @param {string} event_name
     * @param {function} callback
     * @throws {Error} when event_name is not valid
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
     * @example
     *
     * my_sipa_events.unsubscribeAll('click');
     *
     * @param {string} event_name
     * @throws {Error} when event_name is not valid
     */
    unsubscribeAll(event_name) {
        if(this._event_registry[event_name]) {
            delete this._event_registry[event_name];
        }
    }

    /**
     * Trigger all registered events of event_name to be called with the given params.
     *
     * @example
     *
     * my_sipa_events.trigger('click', [param1, param2, param3, ...], { validate: true });
     *
     * @param {String} event_name
     * @param {Array<any>} [msg=[]] params to pass to the created event function
     * @param {Object} [options]
     * @param {boolean} [options.validate=true] validate the given event name to be valid. Can make sense to disable this when the registration might happen later, or you have optional subscribers.
     * @throws {Error} when event_name is not valid
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
     * Unsubscribes all subscriptions of any event.
     *
     * This will reset the event registry to an empty state.
     *
     */
    reset() {
        this._event_registry = {};
    }

    /**
     * Extend valid event names dynamically.
     *
     * Valid element names ensure that only known events are used and will otherwise throw an error.
     *
     * @example
     *
     * // add some new event valid names
     * my_sipa_events.createEvents("turn_on","some_other_event");
     *
     * @param {...string} event_names
     */
    createEvents(...event_names) {
        this._valid_event_names = _.uniq(this._valid_event_names.concat(event_names.flatten()));
    }

    /**
     * Delete valid event names dynamically
     *
     * @example
     *
     * // delete some event valid names
     * my_sipa_events.deleteEvents("turn_on","some_other_event");
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
     * Get all valid (registered) event names.
     *
     * @example
     *
     * my_sipa_events.getValidEventNames();
     * // returns ['click','delete','update']
     *
     * @returns {Array<string>}
     */
    getValidEventNames() {
        return this._valid_event_names;
    }

    /**
     * Ensure that the given event_name is defined in _valid_element_names, otherwise throw an error.
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
     */
    _data = {};
    /**
     * The components meta data for internal management
     *
     * @type {SipaComponent.Meta}
     */
    _meta = {};

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
     * @param {number} options.sipa_render_period=100 max once per period (ms), a component is rerendered again on data changed. Set to 0 for unlimited renderings at the same time.
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
        options.sipa_hidden ??= false;
        options.sipa_classes ??= "";
        options.sipa_cache ??= true;
        this._meta.sipa ??= {};
        this._meta.sipa._destroyed ??= false;
        this._meta.sipa._data_changed ??= true;
        this._meta.sipa._cached_node ??= null;
        this._meta.sipa._sync_nested_references ??= true;
        this._meta.sipa._render_period ??= typeof options.sipa_render_period !== "undefined" ? options.sipa_render_period : 100;
        this._data = {};
        this._meta.sipa.children = undefined;
        if (options.content) {
            const el = self._parseHtml(`<element>${options.content}</element>`);
            this._meta.sipa.body_nodes = el.childNodes;
        }

        // unique id
        this._meta.sipa.id = self._generateUniqueId();
        this._updateData(data);
        // get class and display style from original element
        const html = this._inheritedClass().template();
        const parsed = self._parseHtml(html);
        this._meta.sipa.classes = (parsed.className + " " + options.sipa_classes.trim()).trim();
        this._meta.sipa.original_display = parsed.style ? parsed.style.display : '';
        this._meta.sipa.custom_attributes = options.sipa_custom_attributes || {};
        this._meta.sipa.hidden = options.sipa_hidden;
        this._meta.sipa.cache = options.sipa_cache;
        this._meta.sipa.alias = options.sipa_alias;
        self._component_instances.push(this);
    }

    /**
     * Ensure that the template is initialized, so that all nested children are available.
     *
     * You may for example call this method, before subscribing to children events, to ensure that the children are available.
     *
     * If the component has already been appended or rendered to the DOM, the template is of course already initialized implicitly.
     * But in some cases you don't know if it already happened, or you know, that it couldn't have happened. E.g. in the constructor of your component.
     */
    initTemplate() {
        this.node();
        this.syncNestedReferences();
    }

    /**
     * Render the HTML template with current data.
     *
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
            } else if (e instanceof TypeError && this._meta.sipa._destroyed === true) {
                throw new SipaComponent.InstanceAlreadyDestroyedError(undefined, this);
            } else {
                throw e;
            }
        }
        /**
         * @type {Array<string>}
         * @private
         */
        this._apply_alias_duplicate_list = [];
        let parsed = self._parseHtml(html);
        parsed = this._applySlots(parsed, html);
        parsed = this._applyTemplateCustomAttributes({parsed});
        parsed = this._applyTemplateClasses({parsed});
        parsed = this._applyTemplateHiddenState({parsed});
        parsed = this._applyTemplateChildrenComponents({parsed}, {cache: options.cache});
        parsed = this._applyTemplateSipaList({parsed}, {cache: options.cache});
        return parsed.outerHTML;
    }

    /**
     * Create a DOM node of the instances html() representation.
     *
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {Element} element representation of html()
     */
    node(options) {
        const self = SipaComponent;
        options ??= {};
        options.cache ??= true;
        let parsed;
        if (this._meta.sipa._data_changed || !this._meta.sipa._cached_node || !options.cache || !this._meta.sipa.cache) {
            parsed = self._parseHtml(this.html({cache: options.cache}));
            this._meta.sipa._cached_node = parsed.cloneNode(true);
            this._meta.sipa._data_changed = false;
        } else {
            parsed = this._meta.sipa._cached_node.cloneNode(true);
        }
        return parsed;
    }

    /**
     * Create a DOM node of the instance and append it to the given css query selector.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     *
     * @param {string} query_selector
     * @returns {SipaComponent}
     */
    append(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.appendChild(this.node());
        });
        if (this._meta.sipa._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Create a DOM node of the instance and prepend it to the given css query selector.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.prepend("#some-element-id");
     *
     * @param {string} query_selector
     * @return {SipaComponent}
     */
    prepend(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.prepend(this.node());
        });
        if (this._meta.sipa._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Create a DOM node of the instance and replace it to the given css query selector.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.replaceWith("#some-element-id");
     *
     * @param {string} query_selector
     * @return {SipaComponent}
     */
    replaceWith(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.replaceWith(this.node());
        });
        if (this._meta.sipa._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Get the sipa alias of the current instance.
     * If no alias is defined, undefined is returned.
     *
     * Please note: The alias is only relevant, if the instance is a child component of another component.
     *
     * @example
     *
     * <example-component>
     *     <nested-component sipa-alias="my_nest_alias"></nested-component>
     *     <other-nested-component sipa-alias="other_alias"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.children().my_nest.alias(); // => "my_nest_alias"
     * my_instance.children().other.alias(); // => "other_alias"
     *
     * @returns {string}
     */
    alias() {
        return this._meta.sipa.alias;
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
     * Set cloned data of the current instance.
     *
     * This will reset the current instance data to the given data objects copy,
     * so no references to the original data object are kept.
     *
     * @example
     *
     * const my_instance = new ExampleComponent({
     *    name: "Foo",
     *    age: 45,
     *    });
     *
     *    const new_data = {
     *        name: "Bar",
     *        age: 30,
     *    };
     *
     *    my_instance.resetToData(new_data);
     *
     *    new_data.name = "Togo";
     *    console.log(my_instance.cloneData().name);
     *    // => "Bar", because the instance data is a copy of new_data and not a reference
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
        else if (this._meta.sipa._sync_nested_references) {
            this.syncNestedReferences();
        }
        return this;
    }

    /**
     * Value representation of the component. Should be usually overwritten by the inherited component class.
     *
     * @return {*} value of the component
     */
    value() {
        return this._meta.sipa.id;
    }

    /**
     * Get the (first) element of the current instance that is in the DOM.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     *
     * const instance = my_instance.element();
     * // => <example-component sipa-id="1" class="template-class "></example-component>
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
     * Get all elements of the current instance that is in the DOM.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     * my_instance.append("#some-other-element-id");
     *
     * const instances = my_instance.elements();
     * // => [<example-component sipa-id="1" class="template-class "></example-component>, <example-component sipa-id="1" class="template-class "></example-component>]
     *
     * @return {Array<Element>}
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
     * Get the unique css selector of the current instance(s) element(s).
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     *
     * const selector = my_instance.selector();
     * // => '[sipa-id="1"]'
     *
     * @returns {string} css selector
     */
    selector() {
        this._checkDestroyed();
        return `[sipa-id="${this._meta.sipa.id}"]`;
    }

    /**
     * Destroy the components DOM representation and class data representation.
     * This will also destroy all children components recursively.
     *
     * Please note: After calling this method, the instance is no longer usable!
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     * my_instance.destroy();
     * my_instance.isDestroyed(); // => true
     * my_instance.update({name: "Foo"}); // => throws SipaComponent.InstanceAlreadyDestroyedError
     *
     * @throws {SipaComponent.InstanceAlreadyDestroyedError} if instance is already destroyed
     * @returns {SipaComponent}
     */
    destroy() {
        const self = SipaComponent;
        this._checkDestroyed();
        // call onDestroy event method optionally if defined in derived class
        if(typeof this.onDestroy === "function") {
            this.onDestroy();
        }
        this.events().trigger("before_destroy", [this], {validate: false});
        const parent = this.parent();
        if (this.hasChildren()) {
            this.children().eachWithIndex((key, val) => {
                val.destroy();
            });
        }
        if (this.hasParent()) {
            const parent_index = this.parent()._meta.sipa.children.indexOf(this);
            delete this.parent()._meta.sipa.children[parent_index];
            this.parent()._meta.sipa.children = this.parent()._meta.sipa.children.filter(x => x); // remove empty entries
        }
        const index = self._component_instances.indexOf(this);
        this.remove({console_warn_if_not_found: false});
        if (index !== -1) {
            delete self._component_instances[index];
            self._component_instances = self._component_instances.filter(x => x);
        }
        if (this.hasParent()) {
            const parent = this.parent();
            const sipa_list_ref = this._meta.sipa.list;
            if (sipa_list_ref) {
                delete parent._data[sipa_list_ref][parent._data[sipa_list_ref].indexOf(this)];
                parent._data[sipa_list_ref] = parent._data[sipa_list_ref].filter(x => !!x);
            }
            delete parent._meta.sipa.children[parent._meta.sipa.children.indexOf(this)];
            parent._meta.sipa.children = parent._meta.sipa.children.filter(x => !!x);
            const alias = this._meta.sipa.alias;
            if (alias) {
                delete parent._data[alias];
                parent._meta.sipa.children
            } else {
                throw new Error(`Missing alias for component.`);
            }
        }
        this._data = undefined;
        this._meta = undefined;
        this._meta = {sipa: {_destroyed: true}};
        delete this;
        this.events().trigger("after_destroy", [this], {validate: false});
        return this;
    }

    /**
     * Check if the current instance is destroyed.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     * my_instance.isDestroyed(); // => false
     * my_instance.destroy();
     * my_instance.isDestroyed(); // => true
     *
     * @return {boolean} true if destroyed
     */
    isDestroyed() {
        return this._meta.sipa._destroyed;
    }

    /**
     * Remove the DOM representation(s), but keep the class data representation (instance).
     *
     * Please note: After calling this method, the instance is still usable!
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.append("#some-element-id");
     * my_instance.remove();
     * my_instance.isDestroyed(); // => false
     * my_instance.update({name: "Foo"}); // => works fine
     * my_instance.append("#some-element-id"); // => works fine
     *
     * @param {Object} options
     * @param {boolean} options.console_warn_if_not_found=true warning on console if no element is found
     * @returns {SipaComponent}
     */
    remove(options = {console_warn_if_not_found: true}) {
        const self = SipaComponent;
        options ??= {};
        options.console_warn_if_not_found ??= true;
        const elements = this.elements();
        if (elements.length === 0 && options.console_warn_if_not_found) {
            console.warn(`Tried to remove() ${this.constructor.name} with sipa-id '${this._meta.sipa.id}', but it does not exist in DOM.`);
        } else if (elements.length > 0) {
            elements.eachWithIndex((el) => {
                el.remove();
            });
        }
        return this;
    }

    /**
     * Update the data of the instance and its children by alias if available. Then rerender its view.
     *
     * @example
     *
     * <example-component enabled="false">
     *   <nested-component sipa-alias="my_nest" name="'foo'"></nested-component>
     *   <other-nested-component sipa-alias="other" age="77"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.update({
     *   enabled: true,
     *   my_nest: {
     *     name: "bar",
     *   },
     *   other: {
     *     age: 111,
     *   }
     * });
     *
     * This will update the data of the current instance and also the nested children by their alias.
     *
     * The update is merged with the existing data, so only the given properties are updated.
     *
     * If you want to reset the data instead of merging, use the reset option.
     *
     * @param {SipaComponent.Data} data
     * @param {Object} options
     * @param {boolean} options.render=true rerender DOM elements after data update
     * @param {boolean} options.reset=false if false, merge given data with existing, otherwise reset component data to given data
     * @param {boolean} options.cache=true use node cache or not on component and all(!) children and their children
     * @returns {SipaComponent}
     */
    update(data = {}, options = {}) {
        this._checkDestroyed();
        options ??= {};
        data ??= {};
        options.render ??= true;
        options.reset ??= false;
        options.cache ??= true;
        this.events().trigger("before_update", [this, data, options], {validate: false});
        this._updateData(data, {reset: options.reset, update_data: data});
        this._meta.sipa._data_changed = true;
        // reset cache of parent component, because when the child changed,
        // the parent cached node is not valid anymore
        if (this.parent()) {
            this.parent()._meta.sipa._cached_node = null;
        }
        if (options.render) {
            this.render(options);
        } // if no render, then sync at least
        else if (this._meta.sipa._sync_nested_references) {
            this.syncNestedReferences({update_data: data});
        }
        this.events().trigger("after_update", [this, data, options], {validate: false});
        return this;
    }

    /**
     * Render component again.
     *
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache or not on component and all(!) children and their children
     * @param {boolean} options.render_period overwrite default render period (_meta.sipa._render_period) only once
     * @returns {SipaComponent}
     */
    render(options = {}) {
        const _this = this;
        options ??= {};
        options.cache ??= true;
        const renderFunc = (options) => {
            _this.elements().forEach((el) => {
                el.replaceWith(_this.node({cache: options.cache}));
            });
            if (_this._meta.sipa._sync_nested_references) {
                _this.syncNestedReferences();
            }
        }
        const render_period = SipaTest.isTestingMode() ? 0 : (typeof options.render_period !== "undefined") ? options.render_period : this._meta.sipa._render_period;
        if (render_period === 0) {
            renderFunc(options);
        } else {
            FireOnce.fire('SCR' + this._meta.sipa.id, () => {
                renderFunc(options);
            }, {period: render_period});
        }
        return this;
    }

    /**
     * Add given class to the current instance tag element and store its state.
     *
     * Using this method, the state is also stored in the instance automatically, so that it is persistent on rerendering.
     *
     * @example
     *
     * const my_instance = new ExampleComponent(
     *   {
     *     name: "Foo",
     *     age: 45,
     *   },
     *   {
     *     sipa_classes: "dark-style",
     *   }
     * );
     *   my_instance.addClass("active highlight");
     *   my_instance.element().className;
     *   // => "dark-style active highlight"
     *
     * @param {string} class_name one or more classes separated by space
     * @param {Object} options
     * @param {boolean} options.update=true rerender current instance DOM with new class
     * @returns {SipaComponent}
     */
    addClass(class_name, options = {}) {
        this._checkDestroyed();
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let split = this._meta.sipa.classes.trim().split(' ');
        class_name.split(' ').eachWithIndex((class_value, i) => {
            if (class_value && split.indexOf(class_value) === -1) {
                split.push(class_value);
            }
        });
        this._meta.sipa.classes = split.join(' ').trim();
        if (options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Check if current component instance has given class(es) in its class state.
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
     *
     * @param class_name one or more classes that must be included
     * @return {boolean} true if class is set
     */
    hasClass(class_name) {
        let result = true;
        class_name.split(' ').eachWithIndex((current_class) => {
            if (!this._meta.sipa.classes.split(" ").includes(current_class)) {
                result = false;
                return false;
            }
        });
        return result;
    }

    /**
     * Remove given class from the current instance tag element and its state.
     *
     * Using this method, the state is also stored in the instance automatically, so that it is persistent on rerendering.
     *
     * @example
     *
     * const my_instance = new ExampleComponent(
     *   {
     *     name: "Foo",
     *     age: 45,
     *   },
     *   {
     *     sipa_classes: "dark-style active highlight",
     *   }
     * );
     *
     * my_instance.element().className;
     * // => "dark-style active highlight"
     *
     * my_instance.removeClass("active highlight");
     *
     * my_instance.element().className;
     * // => "dark-style"
     *
     * @param {string} class_name one or more classes separated by space
     * @param {Object} options
     * @param {boolean} options.update=true rerender current instance DOM without removed class
     * @returns {SipaComponent}
     */
    removeClass(class_name, options = {}) {
        this._checkDestroyed();
        const default_options = {
            update: true,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let split = this._meta.sipa.classes.trim().split(' ');
        let attr_split = this._meta.sipa.custom_attributes?.["class"]?.trim().split(' ') ?? [];
        class_name.split(' ').eachWithIndex((class_value, i) => {
            if (split.indexOf(class_value) !== -1) {
                delete split[split.indexOf(class_value)];
            }
            if (attr_split.indexOf(class_value) !== -1) {
                delete attr_split[attr_split.indexOf(class_value)];
            }
        });
        split = split.filter(el => !!el); // remove empty elements
        this._meta.sipa.classes = split.join(' ').trim();
        if (this._meta.sipa.custom_attributes['class']) {
            attr_split = attr_split.filter(el => !!el); // remove empty elements
            this._meta.sipa.custom_attributes['class'] = attr_split.join(' ').trim();
        }
        if (options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Show current instance.
     *
     * Makes the component visible again, if it was hidden before.
     * This is an integrated feature, so that the hidden state is persistent on rerendering.
     *
     * @example
     *
     * const my_instance = new ExampleComponent(
     *   {
     *     name: "Foo",
     *     age: 45,
     *   },
     *   {
     *     sipa_hidden: true,
     *   }
     * );
     *
     * my_instance.isHidden(); // => true
     * my_instance.show();
     * my_instance.isVisible(); // => true
     * my_instance.element().style.display; // => "block" (or original display style of template)
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
        this._meta.sipa.hidden = false;
        this._meta.sipa.changed_visibility = true;
        if (options && options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Hide current instance.
     *
     * Hides the component, but keeps it in the DOM.
     *
     * This is an integrated feature, so that the hidden state is persistent on rerendering.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.isVisible(); // => true
     * my_instance.hide();
     * my_instance.isHidden(); // => true
     * my_instance.element().style.display; // => "none"
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
        this._meta.sipa.hidden = true;
        this._meta.sipa.changed_visibility = true;
        if (options && options.update) {
            this.update();
        }
        return this;
    }

    /**
     * Check if current instance is hidden.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.isHidden(); // => false
     * my_instance.hide();
     * my_instance.isHidden(); // => true
     *
     * @return {boolean}
     */
    isHidden() {
        this._checkDestroyed();
        return this._meta.sipa.hidden;
    }

    /**
     * Check if current instance is visible.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.isVisible(); // => true
     * my_instance.hide();
     * my_instance.isVisible(); // => false
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
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     *   <other-nested-component sipa-alias="other"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.children();
     * // => { my_nest: NestedComponent, other: OtherNestedComponent }
     *
     * @return  {Object<string, SipaComponent>} Object<alias, component>
     */
    children() {
        let children = {};
        if (this._meta.sipa.children) {
            this._meta.sipa.children.eachWithIndex((child, i) => {
                children[child._meta.sipa.alias ?? i] = child;
            });
        }
        return children;
    }

    /**
     * Return all keys for children aliases.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     *   <other-nested-component sipa-alias="other"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.childrenAliases();
     * // => ["my_nest", "other"]
     *
     * @return {Array<string>}
     */
    childrenAliases() {
        return Object.keys(this.children());
    }

    /**
     * Return all values of children.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     *   <other-nested-component sipa-alias="other"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.childrenValues();
     * // => [NestedComponent, OtherNestedComponent]
     *
     * @return {Array<SipaComponent>}
     */
    childrenValues() {
        return this._meta.sipa.children;
    }

    /**
     * Check if the component has any children or not.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     *   <other-nested-component sipa-alias="other"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.hasChildren(); // => true
     *
     *
     * @example
     *
     * <another-component></another-component>
     *
     * const another_instance = new AnotherComponent();
     * another_instance.hasChildren(); // => false
     *
     * @return {boolean}
     */
    hasChildren() {
        return !!this._meta.sipa.children?.length > 0;
    }

    /**
     * Return all instantiated slot elements of the current instance by name.
     *
     * To work, the instance must already have been rendered at least once. To ensure explicitly, call initTemplate() before, e.g. when accessing slots() in the instances' constructor.
     *
     * @example
     *
     * <example-component>
     *   <div slot="header">Header Content</div>
     *   <div slot="footer">Footer Content</div>
     *   <nested-component sipa-alias="my_nest">
     *     <div slot="inside_nest">Inside Nest Content</div>
     *     <nested-inside-component sipa-alias="inside"></nested-inside-component>
     *     <div slot="inside_nest_2">Inside Nest Content 2</div>
     *     <nested-inside-component sipa-alias="inside_2"></nested-inside-component>
     *     <div>No Slot Content</div>
     *   </nested-component>
     *   <div>No Slot Content</div>
     *   <div slot="footer">Footer Content 2</div>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.slots();
     * // => { header: <div slot="header">Header Content</div>, footer: <div slot="footer">Footer Content 2</div> }
     *
     * my_instance.children().my_nest.slots();
     * // => { inside_nest: <div slot="inside_nest">Inside Nest Content</div>, inside_nest_2: <div slot="inside_nest_2">Inside Nest Content 2</div> }
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
     * Get parent component, if current component is a child component.
     *
     * If no parent exists, undefined is returned.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest">
     *     <other-nested-component sipa-alias="other"></other-nested-component>
     *   </nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.children().my_nest.children().other.parent();
     * // => NestedComponent
     *
     * my_instance.children().my_nest.parent();
     * // => ExampleComponent
     *
     * my_instance.parent();
     * // => undefined
     *
     * my_instance.children().my_nest.children().other.parent().parent();
     * // => ExampleComponent
     *
     *
     * @return {undefined|SipaComponent} component
     */
    parent() {
        return this._meta.sipa.parent;
    }

    /**
     * Check if the component has a parent or not.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.hasParent(); // => false
     * my_instance.children().my_nest.hasParent(); // => true
     *
     * @return {boolean}
     */
    hasParent() {
        return !!this._meta.sipa.parent;
    }

    /**
     * Get the top level parent component, that has no parent component.
     * Will return the current component, if no parent exists.
     *
     * @example
     *
     * <example-component>
     *     <nested-component sipa-alias="my_nest">
     *         <other-nested-component sipa-alias="other">
     *             <micro-nested-component sipa-alias="micro"></micro-nested-component>
     *         </other-nested-component>
     *     </nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.children().my_nest.children().other.parentTop();
     * // => ExampleComponent
     *
     * my_instance.children().my_nest.parentTop();
     * // => ExampleComponent
     *
     * my_instance.parentTop();
     * // => ExampleComponent
     *
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.children().my_nest.children().other.children().micro.parentTop({ target_component: NestedComponent });
     * // => NestedComponent
     *
     * my_instance.children().my_nest.children().other.children().micro.parentTop({ target_component: NotIncludedComponent });
     * // => ExampleComponent, because NotIncludedComponent is not in the parent chain
     *
     * @param {Object} options
     * @param {SipaComponent|null} options.target_component if given, will return the first parent that matches the given component instance, otherwise the top parent without parent is returned
     * @return {SipaComponent} component
     */
    parentTop(options = {target_component: null}) {
        options ??= {};
        options.target_component ??= null;
        if (options.target_component && this === options.target_component) {
            return this;
        } else {
            return this._meta.sipa.parent ? this._meta.sipa.parent.parentTop() : this;
        }
    }

    /**
     * Refresh all data references from top parent to all nested children and children below.
     * This is used after the first rendering of the component for example.
     *
     * After that, the update() will manage refreshing to direct children and parent components.
     *
     * You may want to call this method, if you have a special case and modify the _data attribute manually.
     *
     * @example
     *
     * <example-component>
     *   <nested-component sipa-alias="my_nest"></nested-component>
     * </example-component>
     *
     * const my_instance = new ExampleComponent();
     * my_instance.update({ some_data: 123 });
     * my_instance.children().my_nest.update({ other_data: 456 });
     * // now my_instance._data is { some_data: 123, my_nest: { other_data: 456 } }
     *
     * // but if you modify the data manually, e.g.:
     * my_instance._data = { some_data: 789, my_nest: { other_data: 101 } };
     * // then the nested component data is not updated automatically
     * my_instance.children().my_nest.cloneData();
     * // => { other_data: 456 }
     *
     * // so you need to call syncNestedReferences() to refresh all references
     * my_instance.syncNestedReferences();
     * // now the nested component data is updated
     * my_instance.children().my_nest.cloneData();
     * // => { other_data: 101 }
     *
     * @param {Object} options
     * @param {Object} options.update_data update data if given
     */
    syncNestedReferences(options = {update_data: {}}) {
        this._synchronizeDataToParent();
        this._synchronizeDataToChildren({recursive: true, update_data: options.update_data});
    }

    /**
     * Events of the component to subscribe, unsubscribe or trigger.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.events().on("before_update", (component, data, options) => {
     *  console.log("Component is about to be updated:", component, data, options);
     * });
     *
     * my_instance.update({ name: "Foo" });
     * // => Console: Component is about to be updated: ExampleComponent { ... } { name: "Foo" } { render: true, reset: false, cache: true }
     *
     * my_instance.events().off("before_update");
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     * my_instance.events().on("after_destroy", (component) => {
     *   console.log("Component was destroyed:", component);
     * });
     *
     * my_instance.destroy();
     * // => Console: Component was destroyed: ExampleComponent { ... }
     *
     * @return {SipaEvents}
     */
    events() {
        return this._events ??= new SipaEvents(['before_update', 'after_update', 'before_destroy', 'after_destroy']);
    }

    static _refreshClass(component) {
        component = class extends Object.getPrototypeOf(component.constructor) {

        }
    }

    /**
     * Recreate an instance, based on the given instance.
     *
     * This feature is needed for hot reloading. First the class will be overwritten by the live webserver.
     * Then all classes need to be reinstantiated to be an instance of the new, overwritten, reloaded component class.
     *
     * All data and meta information as well as events will be kept.
     *
     * @param {SipaComponent} component
     * @return {SipaComponent} recreated component instance
     * @private
     */
    static _recreateInstance(component) {
        let new_instance = new (component.constructor)();
        new_instance._meta = component._meta;
        new_instance._data = component._data;
        new_instance._events = component._events;
        // TODO: implement
        throw new Error("Not implemented yet.");
        return new_instance;
    }

    /**
     * Return all instances of the component.
     *
     * To get all instances of all components, call SipaComponent.all().
     *
     * @example
     *
     * const instance1 = new ExampleComponent();
     * const instance2 = new ExampleComponent();
     * const instance3 = new AnotherComponent();
     *
     * ExampleComponent.all();
     * // => [ExampleComponent, ExampleComponent]
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
            all_components = all_components.filter(e => !e._meta.sipa.parent);
        }
        return all_components;
    }

    /**
     * Get instance of current component class by sipa-id.
     *
     * @example
     *
     * <example-component sipa-id="1">Initialized component</example-component>
     *
     * SipaComponent.bySipaId(1);
     * // => ExampleComponent
     *
     * @param {number} sipa_id
     * @return {undefined|SipaComponent}
     */
    static bySipaId(sipa_id) {
        const self = SipaComponent;
        const component_class_name = `${this.name}`;
        if (component_class_name === 'SipaComponent') {
            return SipaComponent._component_instances.find(x => x._meta.sipa.id === sipa_id);
        } else {
            return SipaComponent._component_instances.find(x => x.constructor.name === component_class_name && x._meta.sipa.id === sipa_id);
        }
    }

    /**
     * Get instance of current component class by id attribute.
     *
     * @example
     *
     * <example-component attr-id="my-unique-id">Component declaration in body</example-component>
     *
     * SipaComponent.byId("my-unique-id");
     * // => ExampleComponent
     *
     * @param {number} id
     * @param {Object} options
     * @param {boolean} options.console_error_if_not_found=true
     * @return {undefined|SipaComponent}
     */
    static byId(id, options = {console_error_if_not_found: true}) {
        const self = SipaComponent;
        options ??= {};
        options.console_error_if_not_found ??= true;
        const component_tag_name = LuckyCase.toUpperDashCase(`${this.name}`); // e.g. SipaComponent or ancestor class
        return SipaComponent.instanceOfElement(document.getElementById(id), {
            component_tag_name,
            console_error_if_not_found: options.console_error_if_not_found
        });
    }

    /**
     * Destroy all instances of current component class.
     *
     * To destroy all instances of all components, call SipaComponent.destroyAll().
     *
     * @example
     *
     * const instance1 = new ExampleComponent();
     * const instance2 = new ExampleComponent();
     * const instance3 = new AnotherComponent();
     *
     * ExampleComponent.destroyAll();
     * // => destroys instance1 and instance2
     */
    static destroyAll() {
        const self = SipaComponent;
        const component_class_name = `${this.name}`;
        self.all().eachWithIndex((el, i) => {
            if (component_class_name === "SipaComponent" || component_class_name === el.constructor.name) {
                // delete self._component_instances[i];
                // self._component_instances = self._component_instances.filter(x => x);
                el.destroy();
            }
        });
    }

    /**
     * Initialize all uninitialized components of the current component class in the DOM inside
     * the given css selector automatically.
     *
     * If called by the base component SipaComponent, all uninitialized components of all registered component classes are initialized.
     *
     * @example
     *
     * // Initialize all uninitialized components of all registered component classes in the whole body
     * SipaComponent.init();
     *
     * // Initialize all uninitialized components of all registered component classes inside the element with id "main-content"
     * SipaComponent.init("#main-content");
     *
     * // Initialize all uninitialized components of the ExampleComponent class in the whole body
     * ExampleComponent.init();
     *
     * // Initialize all uninitialized components of the ExampleComponent class inside the element with id "main-content"
     * ExampleComponent.init("#main-content");
     *
     * @example
     *
     * // HTML body
     * <body>
     *   <example-component sipa-id="1">Initialized component</example-component>
     *   <example-component>Uninitialized component</example-component>
     *   <div id="main-content">
     *     <example-component>Uninitialized component in main content</example-component>
     *     <another-component>Uninitialized another component in main content</another-component>
     *   </div>
     * </body>
     *
     * // JavaScript
     * SipaComponent.init();
     * // => Initializes the three uninitialized components in the body
     * SipaComponent.all();
     * // => [ExampleComponent, ExampleComponent, ExampleComponent, AnotherComponent]
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
     * Init given element as the current component class.
     *
     * If called by the base component SipaComponent, the element is initialized as the according registered component class by its tag name.
     *
     * @example
     *
     * // HTML body
     * <body>
     *   <example-component>Uninitialized component</example-component>
     *   <another-component>Uninitialized another component</another-component>
     * </body>
     *
     * // JavaScript
     * const el = document.querySelector("example-component");
     * SipaComponent.initElement(el);
     * // => Initializes the uninitialized example-component as ExampleComponent
     * SipaComponent.all();
     * // => [ExampleComponent]
     *
     * const el2 = document.querySelector("another-component");
     * AnotherComponent.initElement(el2);
     * // => Initializes the uninitialized another-component as AnotherComponent
     *
     * SipaComponent.all();
     * // => [ExampleComponent, AnotherComponent]
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
            const new_component_obj = {_meta: {sipa: {custom_attributes: {}}}};
            const attr_keys = [...element.attributes].map(e => e.name);
            const body_nodes = element.childNodes;
            // remove whitespace only nodes
            body_nodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
                    node.remove();
                }
            });
            new_component_obj._meta.sipa.body_nodes ??= body_nodes;
            let data = {};
            attr_keys.eachWithIndex((key, i) => {
                if (key.startsWith("sipa-")) {
                    const d_key = key.substring("sipa-".length);
                    const d_value = element.attributes[key].value;
                    if (d_key === "hidden") {
                        if (d_value === "true") {
                            new_component_obj._meta.sipa.hidden = true;
                        } else {
                            new_component_obj._meta.sipa.hidden = false;
                        }
                    } else if (d_key === "cache") {
                        if (d_value === "true") {
                            new_component_obj._meta.sipa.cache = true;
                        } else {
                            new_component_obj._meta.sipa.cache = false;
                        }
                    } else if (d_key === "alias") {
                        new_component_obj._meta.sipa.alias = d_value;
                    } else {
                        throw new Error(`Invalid sipa attribute '${key}'`);
                    }
                    //data[d_key] = element.attributes[key].value;
                } else if (key === "class") {
                    new_component_obj._meta.sipa.classes = element.attributes[key].value;
                } else if (key.startsWith("attr-")) {
                    new_component_obj._meta.sipa.custom_attributes[key.substring("attr-".length)] = element.attributes[key].value;
                } else {
                    try {
                        let value = null;
                        const raw_value = element.attributes[key].value;
                        if (raw_value.trim() === '') {
                            value = undefined;
                        } // BigInt support
                        else if (/^[-]?\d{16,}$/.test(raw_value)) {
                            value = BigInt(raw_value);
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
            const parent_alias_data = options && options.parent_data && options.parent_data[new_component_obj?._meta?.sipa?.alias];
            if (parent_alias_data) {
                if (typeof parent_alias_data === 'object') {
                    data = Object.assign(data, parent_alias_data);
                } else {
                    throw new Error(`Alias data for 'data.${new_component_obj._meta.sipa.alias}' must be of type object! Given: ${Typifier.getType(parent_alias_data)}`)
                }
            }
            const new_component = new (element_class)(data);
            new_component._meta = _.merge(new_component._meta, new_component_obj._meta);
            const new_element_node = self.initChildComponents(new_component);
            element.replaceWith(new_element_node);
            if (new_component._meta.sipa._sync_nested_references) {
                new_component.syncNestedReferences();
            }
            return new_component;
        } else if (typeof options.sipa_component !== 'undefined') {
            return options.sipa_component;
        }
    }

    /**
     * Init child components of the given component if available.
     *
     * @example
     *
     * const my_instance = new ExampleComponent();
     *
     * SipaComponent.initChildComponents(my_instance);
     * // => initializes nested-component and another-nested-component as child components of my_instance
     *
     * @param {SipaComponent} component
     * @throws {Error} when no registered components are found inside the component
     * @returns {Element}
     */

    static initChildComponents(component) {
        const self = SipaComponent;
        const new_element_node = component.node();
        let uninitialized_children = [];
        const children_selector = self._registered_components.map(x => x.tagName() + ':not([sipa-id], [sc] [sc])').join(", ");
        if (!children_selector) {
            throw new Error(`No registered components found! Ensure, to register your component class after definition with SipaComponent.registerComponent(MyComponent);`);
        }
        uninitialized_children = new_element_node.querySelectorAll(children_selector);
        uninitialized_children.forEach(x => x.setAttribute("sc", ""));
        uninitialized_children = new_element_node.querySelectorAll(children_selector);
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                el.removeAttribute("sc");
                component._meta.sipa.children ??= [];
                const child = self.initElement(el);
                child._meta.sipa.parent = component;
                component._addChild(child);
                const child_node = child.node();
                el.replaceWith(child_node);
                if (child._meta.sipa._sync_nested_references) {
                    child.syncNestedReferences();
                }
            });
        }
        return new_element_node;
    }

    /**
     * Get tag name of current component class.
     *
     * @example
     *
     * <example-component>blub</example-component>
     *
     * const my_instance = new ExampleComponent();
     *
     * my_instance.tagName();
     * // => "example-component"
     *
     * @return {string}
     */
    static tagName() {
        return LuckyCase.toDashCase(this.prototype.constructor.name);
    }

    static instanceOfElement(element, options = {component_tag_name: null, console_error_if_not_found: true}) {
        /**
         * Get the component instance of the given element or one of its parent.
         *
         * Be aware, that SipaComponent.instanceOfElement can find any component,
         * while ExampleComponent.instanceOfElement can only find ExampleComponent instances but not find a OtherComponent instance.
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
         *
         * @param {HTMLElement} element
         * @param {Object} options
         * @param {string} options.component_tag_name=null when called from another static class method, needs to be passed to only consider given tags
         * @param {boolean} options.console_error_if_not_found=true
         * @returns {SipaComponent|undefined} returns undefined if no instance is found
         */
        const self = SipaComponent;
        options ??= {};
        options.component_tag_name ??= null;
        options.console_error_if_not_found ??= true;
        let ctag_name = options.component_tag_name;
        if (ctag_name === null) {
            ctag_name = LuckyCase.toUpperDashCase(`${this.name}`);
        }
        // get component main element
        let component = element;
        // component will be null when reaching parent of html
        while (component !== null) {
            if (component.getAttribute('sipa-id') === null) {
                component = component.parentElement;
            } else {
                if (ctag_name === "SIPA-COMPONENT" || component?.tagName === ctag_name) {
                    break;
                } else {
                    component = component.parentElement;
                }
            }
        }
        let instance = null;
        if (component) {
            const sipa_id = parseInt(component.getAttribute('sipa-id'));
            instance = self._component_instances.filter((el) => {
                return el._meta.sipa.id === sipa_id
            })[0];
        }
        if (instance) {
            return instance;
        } else if (options.console_error_if_not_found && !SipaTest.isTestingMode()) {
            console.error(`Instance of type '${LuckyCase.toPascalCase(ctag_name)}' for element could not be retrieved.`, element);
        }
    }

    /**
     * Register given component class.
     *
     * You need to register every new component that extends by SipaComponent to make it available.
     * Otherwise, it is not known to the base class and cannot be initialized automatically.
     *
     * @example
     *
     * class MyComponent extends SipaComponent {
     *     ...
     * }
     *
     * SipaComponent.registerComponent(MyComponent);
     *
     * @param {SipaComponent} component
     */
    static registerComponent(component) {
        const self = SipaComponent;
        if (!self._registered_components.includes(component)) {
            self._registered_components.push(component);
        }
    }

    /**
     * Update the data of the component and its children by alias if available.
     *
     * The data is merged by default. To reset the data, use options.reset = true.
     * By default, the given data is cloned deeply to avoid reference issues. To disable this, use options.clone = false.
     *
     * After updating the data, the changes are synchronized to all direct children and the parent component.
     *
     * @example
     *
     * const my_instance = new ExampleComponent({ name: "Initial", nested: { value: 123 } });
     * my_instance.data();
     * // => { name: "Initial", nested: { value: 123 } }
     * my_instance.children().nested.data();
     * // => { value: 123 }
     *
     * my_instance.update({ name: "Updated", new_value: 456 });
     * my_instance.data();
     * // => { name: "Updated", nested: { value: 123 }, new_value: 456 }
     *
     * my_instance.children().nested.data();
     * // => { value: 123 }
     *
     * my_instance.update({ nested: { value: 789, another: 101 } });
     * my_instance.data();
     * // => { name: "Updated", nested: { value: 789, another: 101 }, new_value: 456 }
     *
     * my_instance.children().nested.data();
     * // => { value: 789, another: 101 }
     *
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.reset=false
     * @param {boolean} options.clone=true
     * @param {Object} options.update_data
     * @private
     */
    _updateData(data, options = {}) {
        const self = SipaComponent;
        options ??= {};
        const default_options = {
            reset: false,
            clone: true,
            parent_only: false,
            update_data: {},
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
            this._synchronizeDataToChildren({update_data: options.update_data});
            this._synchronizeDataToParent();
        }
    }

    /**
     * Get inherited class.
     *
     * @example
     *
     * class MyComponent extends SipaComponent {
     *    ...
     * }
     *
     * const my_instance = new MyComponent();
     * my_instance._inheritedClass();
     * // => MyComponent
     *
     * @return {SipaComponent}
     * @private
     */
    _inheritedClass() {
        return this.constructor;
    }

    /**
     * Add sipa-id attribute to given template html.
     *
     * For performance reasons, this method works with raw html string.
     *
     * @example
     *
     * const some_instance = new ExampleComponent();
     * some_instance._applyTemplateId('<example-component></example-component>');
     * // => '<example-component sipa-id="1"></example-component>'
     *
     * @param {string} html
     * @returns {string}
     * @private
     */
    _applyTemplateId(html) {
        const COMPONENT_TAG_REGEX = /^<([a-zA-Z\-\_0-9]+)/gm;
        return html.replace(COMPONENT_TAG_REGEX, `<$1 sipa-id="${this._meta.sipa.id}"`);
    }

    /**
     * Replace slots to given parsed template.
     *
     * For performance reasons, this method works with parsed ChildNode and raw html string.
     *
     * @param {ChildNode} parsed
     * @param {string} html raw for performance reasons
     * @returns {string}
     * @private
     */
    _applySlots(parsed, html) {
        const self = SipaComponent;
        const has_slots = html.includes("<slot");
        if (has_slots) {
            if (this._meta.sipa.body_nodes?.length > 0) {
                const parsed_slots = parsed.querySelectorAll('slot:not(slot slot)');
                [...parsed_slots].eachWithIndex((slot) => {
                    const slot_name = slot.getAttribute("name") || "default";
                    const child_nodes = this._meta.sipa.body_nodes;
                    const final_slot_nodes = [];
                    [...child_nodes].eachWithIndex((node) => {
                        const current_slot_attr = node.getAttribute?.("slot");
                        if ((current_slot_attr && current_slot_attr === slot_name) || (!current_slot_attr && slot_name === "default")) {
                            final_slot_nodes.push(node.cloneNode(true));
                        }
                    });
                    if (final_slot_nodes.length > 0) {
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
     * @private
     */
    _applyTemplateClasses(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (parsed) {
            if (!this._meta.sipa.classes) {
                parsed.removeAttribute("class");
            } else {
                parsed.className = this._meta.sipa.classes;
            }
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
     * @private
     */
    _applyTemplateHiddenState(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (parsed && parsed.style) {
            if (this.isHidden()) {
                parsed.style.display = 'none';
            } // respect initial display none on the class style attribute
            else if (this._meta.sipa.changed_visibility && !this._meta.sipa.original_display.includes("none") || !this._meta.sipa.changed_visibility) {
                parsed.style.dispaly = this._meta.sipa.original_display;
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
     * @private
     */
    _applyTemplateChildrenComponents(args, options) {
        const self = SipaComponent;
        options ??= {};
        options.cache ??= true;
        const parsed = args.parsed || self._parseHtml(args.html);
        let uninitialized_children = [];
        const children_selector = self._registered_components.map(x => x.tagName() + ':not([sipa-id], [sc] [sc])').join(", ");
        if (!children_selector) {
            throw new Error(`No registered components found! Ensure, to register your component class after definition with SipaComponent.registerComponent(MyComponent);`);
        }
        // do not get nested / slot components:
        // - add sc attribute to all
        // - then query again with CSS selector, that does not include nested [sc]'s
        uninitialized_children = parsed.querySelectorAll(children_selector);
        uninitialized_children.forEach(x => x.setAttribute("sc", ""));
        uninitialized_children = parsed.querySelectorAll(children_selector);
        const are_children_initialized = typeof this._meta.sipa.children !== 'undefined';
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                el.removeAttribute("sc");
                this._meta.sipa.children ??= []; // if not set yet, they will be initialized at the first time
                // check for alias
                const alias = el.getAttribute('sipa-alias');
                if (!alias) {
                    throw new SipaComponent.MissingSipaAliasError(`Missing sipa-alias for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                } else if (this._apply_alias_duplicate_list.includes(alias)) {
                    throw new SipaComponent.DuplicateSipaAliasError(`Duplicate sipa-alias "${alias}" for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                }
                this._apply_alias_duplicate_list.push(alias);
                let child_component = this._meta.sipa.children.find(x => x._meta.sipa.alias === alias);
                const child = self.initElement(el, {sipa_component: child_component, parent_data: this._data});
                if (!this.childrenAliases().includes(alias)) {
                    child._meta.sipa.parent = this;
                    this._addChild(child);
                }
                const child_node = child.node({cache: options.cache});
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
     * @private
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
                            this._meta.sipa.children ??= []; // if not set yet, they will be initialized at the first time
                            // check for alias
                            const alias = item.alias();
                            if (!alias) {
                                throw new SipaComponent.MissingSipaAliasError(`Missing sipa-alias for embedded component <${item.constructor.tagName()}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                            } else if (this._apply_alias_duplicate_list.includes(alias)) {
                                throw new SipaComponent.DuplicateSipaAliasError(`Duplicate sipa-alias "${alias}" for embedded component <${item.constructor.tagName()}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                            }
                            this._apply_alias_duplicate_list.push(alias);
                            if (!this.childrenAliases().includes(alias)) {
                                item._meta.sipa.parent = this;
                                item._meta.sipa.list = reference;
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
     * @private
     */
    _applyTemplateCustomAttributes(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self._parseHtml(args.html);
        if (Object.keys(this._meta.sipa.custom_attributes).length > 0) {
            if (parsed) {
                this._meta.sipa.custom_attributes.eachWithIndex((key, value) => {
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
     * @private
     */
    static _parseHtml(html) {
        return document.createRange().createContextualFragment(html).firstElementChild;
    }

    /**
     * Generate unique component id (auto increment)
     *
     * @example
     *
     * SipaComponent._generateUniqueId();
     * // => 1
     * SipaComponent._generateUniqueId();
     * // => 2
     *
     * @return {number}
     * @private
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
     * @param {Object} options.update_data update data if given
     * @private
     */
    _synchronizeDataToChildren(options = {}) {
        options ??= {};
        options.recursive ??= false;
        options.update_data ??= {};
        this.childrenAliases().eachWithIndex((alias, i) => {
            if (typeof this._data[alias] === "object") {
                this.children()[alias]._updateData(this._data[alias], {
                    clone: false,
                    update_data: options.update_data[alias]
                });
                if (options.update_data[alias]) {
                    this.children()[alias]._meta.sipa._data_changed = true;
                }
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
     *
     * Called automatically after every render update.
     *
     * @private
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
     * @private
     */
    _addChild(child) {
        this._meta.sipa.children.push(child);
    }

    /**
     * Check if the component is already destroyed, and if, throw a specific error.
     * @throws {SipaComponent.InstanceAlreadyDestroyedError}
     * @private
     */
    _checkDestroyed() {
        if (this._meta.sipa._destroyed) {
            throw new SipaComponent.InstanceAlreadyDestroyedError(undefined, this);
        }
    }
}

/**
 * @typedef {Object} SipaComponent.Meta
 * @property {Object} sipa all sipa meta info
 * @property {number} sipa.id auto increment
 * @property {string} sipa.classes internal state representation for classes managed by components methods addClass() and removeClass()
 * @property {boolean} sipa.hidden=false state representation of hide() and show() methods
 * @property {boolean} sipa.cache=true use node caching for templates
 * @property {string} sipa.alias alias to access children by uniq accessor name
 * @property {Array<SipaComponent>} sipa.children array of children sipa components
 * @property {SipaComponent} sipa.parent parent sipa component when using nested components
 * @property {string} sipa.list parent sipa components _data reference, if the component has been initialized by using sipa-list
 * @property {string} sipa.original_display store original display style when using hide() to restore on show()
 * @property {boolean} sipa.changed_visibility info if visibility has been changed at least once
 * @property {Object<string, string>} sipa.custom_attributes state representation of declarative custom attributes defined with attr- prefix
 * @property {NodeList} sipa.body_nodes body as childNodes of original declarative element
 * @property {boolean} sipa._destroyed=false Flag to determine if object has been destroyed
 * @property {boolean} sipa._data_changed=true Flag for caching rendered nodes
 * @property {Element} sipa._cached_node=null Store cached node to reuse when rendering again without any data change or update()
 * @property {boolean} sipa._sync_nested_reference=true Sync nested references automatically after every render update. May be disabled on performance cases. Then overwrite to 'false' at the inherited classes constructor after calling super().
 * @property {number} sipa._render_period=100 Only one rendering per period in milliseconds for performance reasons. Disabled when option is 0. Caution: when rendering several times in this period, only the first and last rendering will happen at 0ms and 100ms
 *
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
 * @param {Object} options
 * @param {boolean} options.console_error_if_not_found=true
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
function instance(element, options = {console_error_if_not_found: true}) {
    options ??= {};
    options.console_error_if_not_found ??= true;
    return SipaComponent.instanceOfElement(element, options);
}


SipaComponent.MissingSipaAliasError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "SipaComponent.MissingSipaAliasError";
    }
}

SipaComponent.DuplicateSipaAliasError = class extends Error {
    constructor(message) {
        super(message);
        this.name = "SipaComponent.DuplicateSipaAliasError";
    }
}

SipaComponent.InstanceAlreadyDestroyedError = class extends Error {
    constructor(message, instance) {
        if (instance) {
            message ??= `This instance of ${instance.constructor.name} has already been destroyed and can not be accessed any more.`;
        }
        super(message);
        this.name = "SipaComponent.InstanceAlreadyDestroyedError";
    }
}


/**
 * Serializer to serialize data of primitive types or even complex Objects,
 * to ensure to be stored as valid JSON and can be deserialized back without data loss.
 *
 * Includes support for
 * - Boolean, Number, String, Array, Object, null (native JS[SON] support)
 *
 * And includes special type handling to support the following types:
 * - Functions
 * - RegExp, Date
 * - NaN, Infinity, -Infinity, undefined
 * - empty (special type when deleting an item of an array)
 *
 * The special types are escaped by an internal escaping when serialized.
 * See SipaSerializer.STORAGE_PLACEHOLDERS for the escapes.
 */
class SipaSerializer {

    /**
     * Serialize given value to be stored in JSON without loosing its original value.
     *
     * @example
     *
     * const my_example_object = {
     *    name: "My Object",
     *    created: new Date(),
     *    pattern: /abc/i,
     *    doSomething: function(a, b) { return a + b; },
     *    nothing: null,
     *    not_defined: undefined,
     *    not_a_number: NaN,
     *    infinite: Infinity,
     *    items: [1, 2, 3, 4]
     *  };
     *
     *  delete my_example_object.items[2]; // create an empty entry in the array
     *  console.log(my_example_object.items); // [1, 2, empty, 4]
     *
     *
     *  const serialized = SipaSerializer.serialize(my_example_object);
     *  console.log(serialized);
     *  // Example output (formatted for readability):
     *  /*{
     *    "name": "My Object",
     *    "created": "::Date::2023-10-05T12:34:56.789Z",
     *    "pattern": "::RegExp::/abc/i",
     *    "doSomething": "function(a, b) { return a + b; }",
     *    "nothing": null,
     *    "not_defined": "::undefined::",
     *    "not_a_number": "::NaN::",
     *    "infinite": "::Infinity::",
     *    "items": [1, 2, "::empty::", 4]
     *  }* /
     *  // serialized is now a valid JSON string that can be stored without data loss
     *
     *
     *  const deserialized = SipaSerializer.deserialize(serialized);
     *  // deserialized is now a clone of my_example_object with all original values and types
     *  console.log(deserialized.name); // "My Object"
     *  console.log(deserialized.created instanceof Date); // true
     *  console.log(deserialized.pattern instanceof RegExp); // true
     *  console.log(typeof deserialized.doSomething === 'function'); // true
     *  console.log(deserialized.nothing === null); // true
     *  console.log(typeof deserialized.not_defined === 'undefined'); // true
     *  console.log(typeof deserialized.not_a_number === 'number' && isNaN(deserialized.not_a_number)); // true
     *  console.log(deserialized.infinite === Infinity); // true
     *  console.log(Array.isArray(deserialized.items) && deserialized.items.length === 4 && !(2 in deserialized.items)); // true, note the empty entry at index 2
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
            return JSON.stringify(value.toString());
        } else if (Typifier.isNaN(value)) {
            return '::NaN::';
        } else if (Typifier.isInfinity(value)) {
            return '::Infinity::';
        } else if (Typifier.isNegativeInfinity(value)) {
            return '::-Infinity::';
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
     * Serialize given value to be stored in JSON without loosing its original value.
     *
     * @example
     *
     * const serialized = `{
     *   "name": "My Object",
     *   "created": "::Date::2023-10-05T12:34:56.789Z",
     *   "pattern": "::RegExp::/abc/i",
     *   "doSomething": "function(a, b) { return a + b; }",
     *   "nothing": null,
     *   "not_defined": "::undefined::",
     *   "not_a_number": "::NaN::",
     *   "infinite": "::Infinity::",
     *   "items": [1, 2, "::empty::", 4]
     *   }`;
     *
     *   const deserialized = SipaSerializer.deserialize(serialized);
     *   // deserialized is now a clone of my_example_object with all original values and types
     *   console.log(deserialized); // show the full object
     *   {
     *       name: "My Object",
     *       created: Date, // actual Date object
     *       pattern: RegExp, // actual RegExp object
     *       doSomething: function(a, b) { return a + b; }, //
     *       nothing: null,
     *       not_defined: undefined,
     *       not_a_number: NaN,
     *       infinite: Infinity,
     *       items: [1, 2, empty, 4]
     *   }
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
        } else if (value === '::-Infinity::') {
            return -Infinity;
        } else if (Typifier.isString(value) && value.startsWith('::Date::')) {
            return new Date(value.replace('::Date::', ''));
        } else if (Typifier.isString(value) && value.startsWith('::RegExp::')) {
            let full_regex_string = value.replace('::RegExp::', '');
            let regex_source = full_regex_string.substring(1, full_regex_string.lastIndexOf('/'));
            let regex_flags = full_regex_string.substring(full_regex_string.lastIndexOf('/') + 1, full_regex_string.length);
            return new RegExp(regex_source, regex_flags);
        } else {
            try {
                let parsed = JSON.parse(value);
                if (SipaSerializer.isFunctionString(parsed)) {
                    return SipaSerializer.deserializeFunctionString(parsed);
                } else if (Typifier.isArray(parsed) || Typifier.isObject(parsed)) {
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
     * Check if given string is a valid javascript function.
     *
     * Note: This method does not check if the function makes sense, only if the syntax is valid.
     *
     * @example
     *
     * SipaSerializer.isFunctionString("function(a, b) { return a + b; }"); // true
     * SipaSerializer.isFunctionString("(a, b) => { return a + b; }"); // true
     * SipaSerializer.isFunctionString("a => a * 2"); // true
     * SipaSerializer.isFunctionString("function myFunc(a, b) { return a + b; }"); // true
     * SipaSerializer.isFunctionString("myFunc(a, b) { return a + b; }"); // true, function name without prefix 'function'
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
     * Check if given string is a valid javascript array.
     *
     * @example
     *
     * SipaSerializer.isArrayString("[1, 2, 3]"); // true
     * SipaSerializer.isArrayString("['a', 'b', 'c']"); // true
     * SipaSerializer.isArrayString("[true, false, null]"); // true
     * SipaSerializer.isArrayString("[1, [2, 3], {a: 4}]"); // true
     * SipaSerializer.isArrayString("{a: 1, b: 2}"); // false
     * SipaSerializer.isArrayString("function() {}"); // false
     * SipaSerializer.isArrayString("not an array"); // false
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isArrayString(value) {
        const self = SipaSerializer;
        if (Typifier.isString(value)) {
            let trimmed = value.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    let array = JSON.parse(trimmed);
                    return Typifier.isArray(array);
                } catch (e) {
                }
            }
        }
        return false;
    }

    /**
     * Check if given string is a valid javascript object.
     *
     * @example
     *
     * SipaSerializer.isObjectString("{a: 1, b: 2}"); // true
     * SipaSerializer.isObjectString("{'a': 1, 'b': 2}"); // true
     * SipaSerializer.isObjectString('{"a": 1, "b": 2}'); // true
     * SipaSerializer.isObjectString("{a: 1, b: {c: 3}}"); // true
     * SipaSerializer.isObjectString("[1, 2, 3]"); // false
     * SipaSerializer.isObjectString("function() {}"); // false
     * SipaSerializer.isObjectString("not an object"); // false
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isObjectString(value) {
        const self = SipaSerializer;
        if (Typifier.isString(value)) {
            let trimmed = value.trim();
            if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    let object = JSON.parse(trimmed);
                    return Typifier.isObject(object);
                } catch (e) {
                }
            }
        }
        return false;
    }

    /**
     * Deserialize a valid javascript string into a callable function.
     *
     * @example
     *
     * const fn1 = SipaSerializer.deserializeFunctionString("function(a, b) { return a + b; }");
     * console.log(fn1(2, 3)); // 5
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
     * @example
     *
     * const my_example_object = {
     *   name: "My Object",
     *   created: new Date(),
     *   pattern: /abc/i,
     *   doSomething: function(a, b) { return a + b; },
     *   nothing: null,
     *   not_defined: undefined,
     *   not_a_number: NaN,
     *   infinite: Infinity,
     *   items: [1, 2, 3, 4]
     * };
     *
     * delete my_example_object.items[2]; // create an empty entry in the array
     * console.log(my_example_object.items); // [1, 2, empty, 4]
     *
     * const escaped = SipaSerializer.deepSerializeSpecialTypes(my_example_object);
     * console.log(escaped);
     * {
     *   name: "My Object",
     *   created: "::Date::2023-10-05T12:34:56.789Z",
     *   pattern: "::RegExp::/abc/i",
     *   doSomething: "function(a, b) { return a + b; }",
     *   nothing: null,
     *   not_defined: "::undefined::",
     *   not_a_number: "::NaN::",
     *   infinite: "::Infinity::",
     *   items: [1, 2, "::empty::", 4]
     * }
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
     * Deserializes (unescapes) all special types of the given Array or Object.
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @example
     *
     * const escaped = {
     *   name: "My Object",
     *   created: "::Date::2023-10-05T12:34:56.789Z",
     *   pattern: "::RegExp::/abc/i",
     *   doSomething: "function(a, b) { return a + b; }",
     *   nothing: null,
     *   not_defined: "::undefined::",
     *   not_a_number: "::NaN::",
     *   infinite: "::Infinity::",
     *   items: [1, 2, "::empty::", 4]
     * };
     *
     * const deserialized = SipaSerializer.deepDeserializeSpecialTypes(escaped);
     * console.log(deserialized);
     * {
     *   name: "My Object",
     *   created: Date, // actual Date object
     *   pattern: RegExp, // actual RegExp object
     *   doSomething: function(a, b) { return a + b; }, // actual function
     *   nothing: null,
     *   not_defined: undefined,
     *   not_a_number: NaN,
     *   infinite: Infinity,
     *   items: [1, 2, empty, 4] // note the empty entry at index 2
     * }
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
     * Original Array is manipulated (no clone).
     *
     * @example
     *
     * let arr = [1, 2, 3, 4];
     * delete arr[2]; // create an empty entry in the array
     * console.log(arr); // [1, 2, empty, 4]
     * arr = SipaSerializer._serializeEmptyArrayValues(arr);
     * console.log(arr); // [1, 2, "::empty::", 4]
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
     * Deserialize (unescape) special type 'empty' inside given Array.
     * Only on first dimension/level, nesting is ignored.
     *
     * Original Array is manipulated (no clone).
     *
     * @example
     *
     * let arr = [1, 2, "::empty::", 4];
     * console.log(arr); // [1, 2, "::empty::", 4]
     * arr = SipaSerializer._deserializeEmptyArrayValues(arr);
     * console.log(arr); // [1, 2, empty, 4]
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
     * @example
     *
     * SipaSerializer._isSpecialType(undefined); // true
     * SipaSerializer._isSpecialType(NaN); // true
     * SipaSerializer._isSpecialType(Infinity); // true
     * SipaSerializer._isSpecialType(new Date()); // true
     * SipaSerializer._isSpecialType(/abc/i); // true
     * SipaSerializer._isSpecialType(function() {}); // true
     * SipaSerializer._isSpecialType(null); // false
     * SipaSerializer._isSpecialType(123); // false
     * SipaSerializer._isSpecialType("string"); // false
     * SipaSerializer._isSpecialType([1, 2, 3]); // false
     * SipaSerializer._isSpecialType({a: 1, b: 2}); // false
     *
     * @param {any} value
     * @returns {boolean} true if special type
     * @private
     */
    static _isSpecialType(value) {
        const self = SipaSerializer;
        return Typifier.isUndefined(value) ||
            Typifier.isNaN(value) ||
            Typifier.isInfinity(value) ||
            Typifier.isNegativeInfinity(value) ||
            Typifier.isDate(value) ||
            Typifier.isRegExp(value) ||
            typeof value === 'function' && self.isFunctionString(value.toString());
    }

    /**
     * Check if given value is a serialized (escaped) special type.
     *
     * @example
     *
     * SipaSerializer._isSerializedSpecialType("::undefined::"); // true
     * SipaSerializer._isSerializedSpecialType("::NaN::"); // true
     * SipaSerializer._isSerializedSpecialType("::Infinity::"); // true
     * SipaSerializer._isSerializedSpecialType("::Date::2023-10-05T12:34:56.789Z"); // true
     * SipaSerializer._isSerializedSpecialType("::RegExp::/abc/i"); // true
     * SipaSerializer._isSerializedSpecialType("function(a, b) { return a + b; }"); // true
     * SipaSerializer._isSerializedSpecialType("not a special type"); // false
     * SipaSerializer._isSerializedSpecialType(123); // false
     * SipaSerializer._isSerializedSpecialType(null); // false
     * SipaSerializer._isSerializedSpecialType(undefined); // false
     * SipaSerializer._isSerializedSpecialType([1, 2, 3]); // false
     * SipaSerializer._isSerializedSpecialType({a: 1, b: 2}); // false
     *
     * @param {any} value
     * @returns {boolean}
     * @private
     */
    static _isSerializedSpecialType(value) {
        const self = SipaSerializer;
        if (!Typifier.isString(value)) {
            return false;
        }
        const special_types = Object.keys(self.STORAGE_PLACEHOLDERS);
        for (let i = 0; i < special_types.length; ++i) {
            if (value.startsWith(special_types[i])) {
                return true;
            }
        }
        // special case for functions
        try {
            if (self.isFunctionString(JSON.parse(value))) {
                return true;
            }
        } catch (e) {
            // is no valid JSON, ignore
        }
        return false;
    }

    /**
     * Clone the given Array or Object.
     *
     * Original Array or Object is not manipulated.
     *
     * @example
     *
     * const originalArray = [1, 2, 3];
     * const clonedArray = SipaSerializer._cloneObject(originalArray);
     * console.log(clonedArray); // [1, 2, 3]
     * clonedArray[0] = 99;
     * console.log(originalArray); // [1, 2, 3] - original
     * console.log(clonedArray); // [99, 2, 3] - cloned
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     * @private
     */
    static _cloneObject(obj) {
        let clone = null;
        if (Typifier.isArray(obj)) {
            clone = obj.slice();
        } else if (Typifier.isObject(obj)) {
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

/**
 * Placeholders for special types when serialized.
 * These placeholders are used to identify and restore the special types during deserialization.
 *
 * @type {{"::undefined::": undefined, "::NaN::": number, "::Infinity::": number, "::empty::": string, "::Date::": DateConstructor, "::RegExp::": RegExpConstructor}}
 */
SipaSerializer.STORAGE_PLACEHOLDERS = {
    '::undefined::': undefined,
    '::NaN::': NaN,
    '::Infinity::': Infinity,
    '::-Infinity::': -Infinity,
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
     * @example
     *
     * // Set a variable that will be lost after reload
     * SipaState.set("my_var", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE});
     *
     * // Set a session value that will be lost after closing the browser
     * SipaState.set("my_sess", {a:1, b:2}, {level: SipaState.LEVEL.SESSION});
     * SipaState.set("my_sess", {a:1, b:2});
     *
     * // Set a storage value that
     * SipaState.set("my_store", {a:1, b:2}, {level: SipaState.LEVEL.STORAGE});
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
     * Set value in persistence level 1 (variable).
     *
     * @example
     *
     * // Set a variable that will be lost after reload
     * SipaState.setVariable("my_var", {a:1, b:2});
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
     * Set value in persistence level 2 (session).
     *
     * @example
     *
     * // Set a session value that will be lost after closing the browser
     * SipaState.setSession("my_sess", {a:1, b:2});
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
     * @example
     *
     * // Set a storage value that will be lost when clearing browser cache only
     * SipaState.setStorage("my_store", {a:1, b:2});
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
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.getLevel("my_sess"); // returns 'session'
     *
     * SipaState.setVariable("my_var", {a:1, b:2});
     * SipaState.getLevel("my_var"); // returns 'variable'
     *
     * SipaState.setStorage("my_store", {a:1, b:2});
     * SipaState.getLevel("my_store"); // returns 'storage'
     *
     * SipaState.getLevel("not_existing_key"); // returns null
     *
     * // If key is set at multiple levels, the highest level is returned (storage > session > variable)
     * SipaState.setStorage("my_key", {a:1, b:2});
     * SipaState.setSession("my_key", {a:1, b:2});
     * SipaState.setVariable("my_key", {a:1, b:2});
     * SipaState.getLevel("my_key"); // returns 'storage'
     *
     * SipaState.remove("my_key");
     * SipaState.setSession("my_key", {a:1, b:2});
     * SipaState.setVariable("my_key", {a:1, b:2});
     * SipaState.getLevel("my_key"); // returns 'session'
     *
     * SipaState.set("my_key", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE, force: true});
     * SipaState.getLevel("my_key"); // returns 'variable'
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
     * Check if key is set already at any persistence level.
     *
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.hasKey("my_sess"); // returns true
     *
     * SipaState.hasKey("not_existing_key"); // returns false
     *
     * SipaState.setStorage("my_store", {a:1, b:2});
     * SipaState.hasKey("my_store"); // returns true
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
     * The priority is storage > session > variable.
     *
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.get("my_sess"); // returns {a:1, b:2}
     *
     * SipaState.get("not_existing_key"); // returns undefined
     *
     * @param {string} key
     * @returns {any|undefined} value or undefined if key does not exist
     */
    static get(key) {
        const self = SipaState;
        return self.getAll()[key];
    }

    /**
     * Get all entries of persistence level 1 (variables).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setVariable("var2", 2);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getVariables(); // returns {var1: 1, var2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getVariables() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.VARIABLE);
    }

    /**
     * Get all entries of persistence level 2 (session).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setSession("sess2", 2);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getSession(); // returns {sess1: 1, sess2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getSession() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.SESSION);
    }

    /**
     * Get all entries of persistence level 3 (storage).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     * SipaState.setStorage("store2", 2);
     *
     * SipaState.getStorage(); // returns {store1: 1, store2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getStorage() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.STORAGE);
    }

    /**
     * Get all stored entries.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getAll(); // returns {var1: 1, sess1: 1, store1: 1}
     *
     * @returns {Object<String, any>}
     */
    static getAll() {
        const self = SipaState;
        return Object.assign(Object.assign(self.getVariables(), self.getSession()), self.getStorage());
    }

    /**
     * Get all keys.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getKeys(); // returns ['var1', 'sess1', 'store1']
     *
     * @returns {Array<String>}
     */
    static getKeys() {
        const self = SipaState;
        return Object.keys(self.getAll());
    }

    /**
     * Remove the stored value of the given key(s).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.remove("sess1"); // returns true
     * SipaState.getKeys(); // returns ['var1', 'store1']
     *
     * SipaState.remove("not_existing"); // returns false
     *
     * SipaState.remove(["var1", "store1"]); // returns true
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
     * Delete all stored data - alias method for reset().
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.removeAll(); // returns true
     * SipaState.getKeys(); // returns []
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static removeAll() {
        const self = SipaState;
        return self.reset();
    }

    /**
     * Delete all stored data.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.reset(); // returns true
     * SipaState.getKeys(); // returns []
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static reset() {
        const self = SipaState;
        const remove_result = self.remove(self.getKeys());
        return remove_result;
    }

    /**
     * Get all entries by level
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setVariable("var2", 2);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState._getAllBy(SipaState.LEVEL.VARIABLE); // returns {var1: 1, var2: 2}
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
     * Get store by level.
     *
     * @example
     *
     * SipaState._getStoreByLevel(SipaState.LEVEL.VARIABLE); // returns SipaState._variables
     * SipaState._getStoreByLevel(SipaState.LEVEL.SESSION); // returns sessionStorage
     * SipaState._getStoreByLevel(SipaState.LEVEL.STORAGE); // returns localStorage
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
     * Ensure key is prefixed.
     *
     * @example
     *
     * SipaState._makeFinalKey("my_key"); // returns "SipaState_my_key"
     * SipaState._makeFinalKey("SipaState_my_key"); // returns "SipaState_my_key"
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
     * Get key without prefix.
     *
     * @example
     *
     * SipaState._reduceKey("my_key"); // returns "my_key"
     * SipaState._reduceKey("SipaState_my_key"); // returns "my_key"
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

/**
 * Persistence levels
 *
 * @type {{VARIABLE: string, SESSION: string, STORAGE: string}}
 */
SipaState.LEVEL = {
    VARIABLE: 'variable',
    SESSION: 'session',
    STORAGE: 'storage',
}

/**
 * Prefix for all keys to avoid conflicts with other data in sessionStorage or localStorage.
 *
 * @type {string}
 */
SipaState.PERSISTENCE_PREFIX = 'SipaState_';

/**
 * In-memory storage for level 1 persistence (variables).
 *
 * @type {{}}
 * @private
 */
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
     * @example
     *
     * SipaEnv.version()
     * // => '1.0.0'
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
     * @example
     *
     * SipaEnv.name()
     * // => 'My App'
     *
     * @returns {string}
     */
    static name() {
        const obj = {
            "name": "Name", "unique_id": "SipaEnv.name.selector"
        }
        return obj.name;
    }



    /**
     * Get the current description of your app.
     *
     * The returned value within this method will automatically be
     * updated from your package.json at every release build cycle.
     *
     * @example
     *
     * SipaEnv.description()
     * // => 'This is my app'
     *
     * @returns {string}
     */
    static description() {
        const obj = {
            "description": "Description of my app", "unique_id": "SipaEnv.description.selector"
        }
        return obj.description;
    }

    /**
     * Check if Sipa is running at localhost.
     *
     * The address can be either 'localhost' or '127.0.0.1'.
     *
     * @example
     *
     * // running local at localhost
     * SipaEnv.isRunningLocalHost()
     * // => true
     *
     * // running online at example.com
     * SipaEnv.isRunningLocalHost()
     * // => false
     *
     * @returns {boolean} true if localhost, otherwise false
     * @deprecated use SipaEnv.isLocalhost() instead
     */
    static isRunningLocalHost() {
        const self = SipaEnv;
        return self.isLocalhost();
    }

    /**
     * Check if the given URL is a localhost URL.
     * If no URL is given, the current URL will be used.
     *
     * @example
     *
     * // check a specific URL
     * SipaEnv.isLocalhost('http://localhost:8000') // => true
     * SipaEnv.isLocalhost('http://127.0.0.1/path') // => true
     * SipaEnv.isLocalhost('http://example.com') // => false
     * SipaEnv.isLocalhost('http://mysite.local') // => false
     *
     * // check the current URL
     * // running local at localhost
     * SipaEnv.isLocalhost() // => true
     * // running online at example.com
     * SipaEnv.isLocalhost() // => false
     *
     * @param url
     * @return {boolean}
     */
    static isLocalhost(url = null) {
        const self = SipaEnv;
        if(!url) {
            url = SipaUrl.getUrl();
        }
        const host = SipaUrl.getHostNameOfUrl(url);
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled.
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.
     *
     * @example
     *
     * // running with debug mode enabled
     * // http://localhost:8000/?debug=true
     * SipaEnv.isDebugMode()
     * // => true
     *
     * // running with debug mode disabled
     * // http://localhost:8000/
     * SipaEnv.isDebugMode()
     * // => false
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled.
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.
     *
     * @example
     *
     * // running with debug mode enabled
     * // http://localhost:8000/?debug=true
     * SipaEnv.debugLog("This is a debug message");
     * // => "This is a debug message" on console
     *
     * // running with debug mode disabled
     * // http://localhost:8000/
     * SipaEnv.debugLog("This is a debug message");
     * // => no output on console
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
     * Check if given value is an array (slice) of size 1 and contains type empty
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
     * If it is not valid, throw an exception.
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

    /**
     * Throw an exception for invalid parameter
     *
     * @example
     * SipaHelper.throwParamError('param_one', "one", 'Object');
     * // => Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!
     *
     * @param {string} param_name
     * @param {any} param
     * @param {string} expected_type e.g. 'Object', 'string, 'Array', 'number', ...
     * @throws {Error} always throws an error
     */
    static throwParamError(param_name, param, expected_type) {
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '${Typifier.getType(param)}'!`;
    }

    /**
     * Cut leading characters (string) from given text.
     *
     * @example
     *  .cutLeadingCharacters('/some/path/is/that','/')
     *  // => 'some/path/is/that'
     *
     * @param {string} text to cut
     * @param {string} leading_characters to cut from text
     * @returns {string}
     * @throws {Error} when text or leading_characters are not strings
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
     * Cut trailing characters (string) from given text.
     *
     * @example
     *  .cutLeadingCharacters('/some/path/file.ext','.ext')
     *  // => 'some/path/file'
     *
     * @param {string} text to cut
     * @param {string} trailing_characters to cut from text
     * @returns {string}
     * @throws {Error} when text or trailing_characters are not strings
     */
    static cutTrailingCharacters(text, trailing_characters) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'text', param_value: text, expected_type: 'string'},
            {param_name: 'trailing_characters', param_value: trailing_characters, expected_type: 'string'},
        ]);
        if (text.endsWith(trailing_characters)) {
            return text.substr(0, text.lastIndexOf(trailing_characters));
        } else {
            return text;
        }
    }

    /**
     * Transform the given string into its constant representation.
     *
     * If the representation does not exist, an exception is thrown.
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
     * @throws {Error} when constant does not exist or name is invalid
     */
    static constantizeString(constant) {
        const self = SipaHelper;
        if (!self._constant_cache[constant]) {
            // check for valid constant name
            if (constant.match(/^[a-zA-Z0-9_.]+$/)) {
                try {
                    self._constant_cache[constant] = eval(constant);
                } catch(e) {
                    throw new Error(`Constant '${constant}' is not defined`);
                }
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


/**
 * SipaPage
 *
 * Tool class with page loader with included router
 */
class SipaPage {
    /**
     * Load given page by page_id
     *
     * @example
     *
     * SipaPage.load('home', {
     *   layout_id: 'default', // optional, default layout is used if not given
     *   force_load: false, // optional, default false
     *   fade_effect: true, // optional, default true
     *   stack_page: true, // optional, default true
     *   params: { lang: 'de' }, // optional, default null
     *   keep_params: true, // optional, default true
     *   success: (data, text, response) => { console.log("page loaded successfully"); },
     *   error: (response, text, data) => { console.error("error loading page"); },
     *   always: (data, text, response) => { console.log("page load finished"); }
     * });
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
     * Get the id only of the given template.
     *
     * @example
     *
     * SipaPage.extractIdOfTemplate('views/pages/home/home.html');
     * // => 'home'
     *
     * SipaPage.extractIdOfTemplate('views/pages/home');
     * // => 'home'
     *
     * SipaPage.extractIdOfTemplate('views/pages/some/nested/nested.html');
     * // => 'some/nested'
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
     * Get the class name of the given template.
     *
     * @example
     *
     * SipaPage.getClassNameOfTemplate('views/pages/home/home.html');
     * // => 'HomePage'
     *
     * SipaPage.getClassNameOfTemplate('views/pages/home');
     * // => 'HomePage'
     *
     * SipaPage.getClassNameOfTemplate('views/pages/some/nested/nested.html');
     * // => 'SomeNestedPage'
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
     * Get the options of the given type.
     *
     * @example
     *
     * SipaPage.typeOptions('page')
     * // => { prefix: 'views/pages/', file_ext: '.html' }
     *
     * SipaPage.typeOptions('layout')
     * // => { prefix: 'views/layouts/', file_ext: '.html' }
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
     * Get page id of current loaded page.
     *
     * @example
     *
     * // 'views/pages/home/home.html' is loaded
     * SipaPage.currentPageId()
     * // => 'home'
     *
     * // 'views/pages/some/nested/nested.html' is loaded
     * SipaPage.currentPageId()
     * // => 'some/nested'
     *
     * @returns {string} page id
     */
    static currentPageId() {
        return $('body').attr('data-page-id');
    }

    /**
     * Get current page class.
     *
     * @example
     *
     * // 'views/pages/home/home.html' is loaded
     * SipaPage.currentPageClass()
     * // => HomePage
     *
     * // 'views/pages/some/nested/nested.html' is loaded
     * SipaPage.currentPageClass()
     * // => SomeNestedPage
     *
     * @return {SipaBasicView}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaPage.getClassNameOfTemplate(SipaPage.currentPageId()));
    }

    /**
     * Get layout id of current loaded layout.
     *
     * @example
     *
     * // 'views/layouts/default/default.html' is loaded
     * SipaPage.currentLayoutId()
     * // => 'default'
     *
     * // 'views/layouts/mini-dialog/mini-dialog.html' is loaded
     * SipaPage.currentLayoutId()
     * // => 'mini-dialog'
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body').attr('data-layout-id');
    }

    /**
     * Load the given layout.
     *
     * @example
     *
     * SipaPage.loadLayout('default', {
     *   fade_effect: true, // optional, default true
     *   success: (data, text, response) => { console.log("layout loaded successfully"); },
     *   error: (response, text, data) => { console.error("error loading layout"); },
     *   always: (data, text, response) => { console.log("layout load finished"); }
     * });
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
     * Call the given method of the given page with given (optional) parameters.
     *
     * @example
     *
     * class HomePage extends SipaBasicView {
     *   static someMethod(param1, param2) {
     *     console.log("someMethod called with", param1, param2);
     *   }
     * }
     *
     * SipaPage.callMethodOfPage('home', 'someMethod', ['hello', 42]);
     * // => "someMethod called with hello 42"
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
     * Call the given method of the given layout with given (optional) parameters.
     *
     * @example
     *
     * class DefaultLayout extends SipaBasicView {
     *  static someMethod(param1, param2) {
     *     console.log("someMethod called with", param1, param2);
     *   }
     * }
     *
     * SipaPage.callMethodOfLayout('default', 'someMethod', ['hello', 42]);
     * // => "someMethod called with hello 42"
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
     * Ensure full path of given template.
     *
     * @example
     *
     * SipaPage._makeFullPath('home');
     * // => 'views/pages/home/home.html'
     *
     * SipaPage._makeFullPath('some/nested');
     * // => 'views/pages/some/nested/nested.html'
     *
     * SipaPage._makeFullPath('default', {type: 'layout'});
     * // => 'views/layouts/default/default.html'
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
     * Initialize the router for single page app browser history.
     *
     * This method is called automatically when setting the config of SipaPage.
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
     * Stack the current page and layout state to the browser history.
     *
     * @example
     *
     * SipaPage.stackHistoryState({
     *   page_id: 'home',
     *   layout_id: 'default',
     *   options: { fade_effect: true, stack_page: true }
     * });
     *
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

    /**
     * Check if SipaPage was initialized with a config.
     *
     * @returns {boolean}
     */
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
        $("body").removeAttr('data-page-id');
        $("body").removeAttr('data-layout-id');
    }
}

SipaPage.page_container_css_selector = '#page-container';

/**
 * @type {SipaPage.Config}
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
 * SipaTest
 *
 * Helper class for testing with Sipa
 */
class SipaTest {
    /**
        Run this before running tests. Usually this should be called in your `beforeAll()` method of your test.

        It will prepare the Sipa environment for testing.

        For example, it will:
        - SipaComponent: disable performance optimized render limits per period, to ensure instant renderings for instant test runs
     */
    static enableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = true;
    }

    /**
        Disable testing mode.
    */
    static disableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = false;
    }

    /**
     *  Check if testing mode is enabled.
     *
     * @return {boolean}
     */
    static isTestingMode() {
        const self = SipaTest;
        return self._is_testing_mode;
    }

    /**
     * Reset all Sipa states to initial state.
     */
    static reset() {
        const self = SipaTest;
        self._is_testing_mode = false;
    }
}

/**
 * @type {boolean}
 * @private
 */
SipaTest._is_testing_mode = false;


/**
 * SipaOnsenPage
 *
 * Tool class with page loader with included router for OnsenUI (mobile).
 */
class SipaOnsenPage {
    /**
     * Load given page by page_id
     *
     * @example
     *
     * SipaOnsenPage.load('home', {
     *   reset: true,
     *   params: { user_id: 123 },
     *   anchor: 'section2',
     *   keep_params: false,
     *   keep_anchor: false,
     *   fade_effect: true,
     *   onsen: { animation: 'fade' },
     *   success: (data, text, response) => {
     *     console.log("Page loaded successfully");
     *   },
     *   error: (response, text, data) => {
     *     console.error("Error loading page");
     *   }
     * });
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
                        cache: !!self.config.cache_page_layout_requests,
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

    /**
     * Get the OnsenUI navigator element.
     *
     * @returns {Element}
     */
    static getOnsenNavigator() {
        const self = SipaOnsenPage;
        return document.querySelector(self.page_container_css_selector);
    }

    /**
     * Get the id only of the given template.
     *
     * @example
     *
     * SipaOnsenPage.extractIdOfTemplate('views/pages/test/test.html');
     * // => 'test'
     *
     * SipaOnsenPage.extractIdOfTemplate('views/pages/group/children.html');
     * // => 'group/children'
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
     * Get the class name of the given template.
     *
     * @example
     *
     * SipaOnsenPage.getClassNameOfTemplate('views/pages/test/test.html');
     * // => 'TestPage'
     *
     * SipaOnsenPage.getClassNameOfTemplate('views/pages/group/children/children.html');
     * // => 'GroupChildrenPage'
     *
     * SipaOnsenPage.getClassNameOfTemplate('views/layouts/main/main.html', {type: 'layout'});
     * // => 'MainLayout'
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
     * Get the options of the given type.
     *
     * @example
     *
     * SipaOnsenPage.typeOptions('page');
     * // => { prefix: 'views/pages/', file_ext: '.html' }
     *
     * SipaOnsenPage.typeOptions('layout');
     * // => { prefix: 'views/layouts/', file_ext: '.html' }
     *
     * @param {SipaPage.PageType} type
     * @returns {TypeOptionsType} type options
     */
    static typeOptions(type) {
        return SipaPage.typeOptions(type);
    }

    /**
     * Get page id of current loaded page.
     *
     * If no page is loaded, return undefined.
     *
     * @example
     *
     * // page 'HomePage' is loaded
     * SipaOnsenPage.currentPageId();
     * // => 'home'
     *
     * @returns {string|undefined} page id
     */
    static currentPageId() {
        const self = SipaOnsenPage;
        const path = self.getOnsenNavigator()?.topPage?._meta?.PageLoader?.page;
        if (path) {
            return self.extractIdOfTemplate(path);
        } else {
            const page_stack = self.getOnsenNavigator()?.querySelectorAll("ons-page");
            if(page_stack?.length > 0) {
                const id = [...page_stack].getLast()?.getAttribute("data-page-id");
                return id;
            }
        }
    }

    /**
     * Get current page class.
     *
     * If no page is loaded, return undefined.
     *
     * @example
     *
     * // page with id 'home' is loaded
     * SipaOnsenPage.currentPageClass();
     * // => HomePage
     *
     * @return {SipaBasicView|undefined}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaOnsenPage.getClassNameOfTemplate(SipaOnsenPage.currentPageId()));
    }

    /**
     * Get layout id of current loaded layout.
     *
     * @example
     *
     * // layout 'DefaultLayout' is loaded
     * SipaOnsenPage.currentLayoutId();
     * // => 'default-layout'
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body').attr('data-layout-id');
    }

    /**
     * Load the given layout.
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
                if(self.config.preserve_script_link_tags) {
                    j_body.children().not('script, link').remove();
                    j_body.prepend(data);
                } else {
                    j_body.html(data);
                }
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
    }

    /**
     * Call the given method of the given page with given (optional) parameters.
     *
     * @example
     *
     * SipaOnsenPage.callMethodOfPage('home', 'myCustomMethod', [param1, param2]);
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
     * Call the given method of the given layout with given (optional) parameters.
     *
     * @example
     *
     * SipaOnsenPage.callMethodOfLayout('default-layout', 'myCustomMethod', [param1, param2]);
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
     * Set the configuration of pages and layouts.
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
     * Pop the current page from the stack.
     *
     * @example
     *
     * SipaOnsenPage.load("home");
     * // some user interaction later
     *
     * SipaOnsenPage.load("details");
     * // some user interaction later
     *
     * SipaOnsenPage.popPage();
     * // now back to 'home'
     *
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
     * Add a status bar mock to the app at the top.
     *
     * @example
     *
     * SipaOnsenPage.addStatusBarMock();
     *
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
     * Remove status bar mock of the app at the top if available.
     *
     * @example
     *
     * SipaOnsenPage.removeStatusBarMock();
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
     * Initialize status bar mock - do NOT run before first page is loaded!
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

    /**
     * Get the current page stack of ons-navigator.
     *
     * @returns {*[]}
     * @private
     */
    static _getPageStack() {
        return [...document.querySelectorAll('ons-navigator ons-page')];
    }

    /**
     * Ensure full path of given template.
     *
     * @example
     *
     * SipaOnsenPage._makeFullPath('home');
     * // => 'views/pages/home/home.html'
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

    /**
     * Connect OnsenUI page events with SipaOnsenPage methods.
     *
     * This method is called automatically on first page load.
     *
     * @private
     */
    static _connectOnsenHooks() {
        const self = SipaOnsenPage;
        if (!self._onsen_hooks_connected) {
            document.addEventListener('init', function (event) {
                if (self._is_loading_history_tree || self._getPageStack().length === 0) {
                    return;
                }
                const meta_page = event.target?._meta?.PageLoader?.page;
                const page_id = (meta_page ? self.extractIdOfTemplate(meta_page) : event.target.getAttribute("data-page-id")) || self._current_page.page_id;
                let last_page_id = null;
                if(event.target._meta?.PageLoader?.parent?.pages?.length > 1) {
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

    /**
     * On first load, initialize the history tree if configured.
     *
     * This will load pages into the stack, so that the user can navigate back,
     * for example if you landed on a details page from an external link.
     *
     * @param {boolean} force
     * @private
     */
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

    /**
     * Initialize all ons-back-button elements on the current page if any.
     * Overrides their default behavior to use SipaOnsenPage.popPage()
     *
     * @private
     */
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

    /**
     * Check if the previous page in the stack is uninitialized and has a history tree attribute.
     *
     * @returns {boolean}
     * @private
     */
    static _hasUninitializedHistoryPage() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const new_page = page_stack[page_stack.length - 2];
        return new_page && new_page.getAttribute('data-history-tree');
    }

    /**
     * Initialize the given page by calling its onInit method and setting url params and anchor.
     *
     * @param {string} page_id
     * @param {string} last_page_id
     * @param {Object} params
     * @param {string} anchor
     * @param {Element} element
     * @private
     */
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

    /**
     * Reset all states
     *
     * Useful for unit testing.
     *
     */
    static reset() {
        $("body").removeAttr('data-page-id');
        $("body").removeAttr('data-layout-id');
    }
}

SipaOnsenPage.page_container_css_selector = 'ons-navigator';

/**
 * @type {SipaOnsenPage.Config}
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
 * @typedef {Object} SipaOnsenPage.Config
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
 *
 * All non getter methods return the class itself for chaining.
 *
 * @example
 *
 * SipaUrl.setParam("new","param").setHostName("new-host.com").setAnchor("new-anchor").load();
 *
 */
class SipaUrl {

    //-------------------------------------------------------------------------------------------------
    // Url
    //-------------------------------------------------------------------------------------------------

    /**
     * Get the current URL of the address bar
     *
     * @example
     *
     * SipaUrl.getUrl();
     * // => https://my-website.com/web/?page=abc&param=ok
     *
     * @returns {string}
     */
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the given url without query parameters and without anchors.
     *
     * @example
     *
     * const url = "https://my-business.com/post?some=stuff&foo=bar#my-anchor";
     * SipaUrl.getUrlWithoutParamsAndAnchor(url);
     * // => https://my-business.com/post
     *
     * @param {string} url
     * @returns {string} url without parameters
     */
    static getUrlWithoutParamsAndAnchor(url) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (url.indexOf('?') !== -1) {
            return url.substr(0, url.indexOf('?'));
        } else {
            return self.removeAnchorOfUrl(url);
        }
    }

    /**
     * Overwrite the current url with the given url in the address bar,
     * by default without reloading the page, if the hostname did not change.
     *
     * @example
     *
     * // Current URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.setUrl("https://my-business.com/?other=param#new-anchor");
     * // New URL: https://my-business.com/?other=param#new-anchor
     *
     * @param {string} url
     * @param {Object} [options]
     * @param {boolean} [options.force_load=false] if true, the given url will be (re)loaded, default: false
     * @returns {SipaUrl} for chaining
     */
    static setUrl(url, options = {}) {
        const self = SipaUrl;
        options.force_load ??= false;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (options.force_load) {
            window.location.href = url;
        } else {
            try {
                // Check if URLs have the same origin
                const current_origin = new URL(window.location.href).origin;
                const new_origin = new URL(url, window.location.href).origin;

                if (current_origin === new_origin) {
                    window.history.replaceState(window.history.state, '', url);
                } else {
                    // Different origin - fall back to full page load
                    window.location.href = url;
                }
            } catch (e) {
                // If there's any error in origin checking or replaceState, try direct change
                try {
                    window.history.replaceState(window.history.state, '', url);
                } catch (historyError) {
                    // If replaceState fails, fall back to full page load
                    window.location.href = url;
                }
            }
        }
        return self;
    }

    /**
     * Reload the current URL in the address bar.
     *
     * Typically used, when the URL was changed by other URL
     * manipulation methods, that do not reload the page by default.
     *
     * @example
     *
     * // Current URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.setParam("new","param");
     * SipaUrl.setHostName("new-host.com");
     * SipaUrl.setAnchor("new-anchor");
     * SipaUrl.loadCurrentUrl();
     *
     * @returns {SipaUrl} for chaining
     */
    static loadCurrentUrl() {
        const self = SipaUrl;
        self.loadUrl(self.getUrl());
        return self;
    }

    /**
     * Alias for SipaUrl.loadCurrentUrl()
     *
     * @returns {SipaUrl} for chaining
     */
    static load() {
        const self = SipaUrl;
        self.loadCurrentUrl();
        return self;
    }

    /**
     * Load the given URL in the address bar.
     *
     * @example
     *
     * SipaUrl.loadUrl("https://my-business.com/?some=stuff&foo=bar#my-anchor");
     *
     * @param {string} url
     * @returns {SipaUrl} for chaining
     */
    static loadUrl(url) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        window.location.href = url;
        return self;
    }

    //-------------------------------------------------------------------------------------------------
    // Protocol
    //-------------------------------------------------------------------------------------------------

    /**
     * Get the protocol of the current url (without colon)
     *
     * @example
     *
     * // URL: https://my-business.com/some-param
     * SipaUrl.getProtocol();
     * // => 'https'
     *
     * // URL: http://my-insecure-business.com/other-param
     * SipaUrl.getProtocol();
     * // => 'http'
     *
     * @returns {string}
     */
    static getProtocol() {
        return window.location.protocol.replace(':', '');
    }

    /**
     * Set the protocol of the current url without reloading the page.
     *
     * @example
     *
     * // URL: http://my-insecure-business.com/other-param
     * SipaUrl.setProtocol("https");
     * // URL: https://my-insecure-business.com/other-param
     * SipaUrl.load();
     *
     * @param {string} protocol
     * @returns {SipaUrl} for chaining
     * @throws {Error} if given protocol is not supported
     */
    static setProtocol(protocol) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: protocol, param_name: 'protocol', expected_type: 'string'}
        ]);
        self.setUrl(self.setProtocolOfUrl(self.getUrl(), protocol));
        return self;
    }

    /**
     * Set the protocol of the given url.
     *
     * @example
     *
     * const url = "http://my-insecure-business.com/other-param";
     * SipaUrl.setProtocolOfUrl(url, "https");
     * // => "https://my-insecure-business.com/other-param"
     *
     * @param {string} url
     * @param {string} protocol
     * @returns {string} with given protocol
     * @throws {Error} if given protocol is not supported
     */
    static setProtocolOfUrl(url, protocol) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: protocol, param_name: 'protocol', expected_type: 'string'}
        ]);
        if (!self.SUPPORTED_PROTOCOLS.includes(protocol.toLowerCase())) {
            throw new Error("Given protocol '" + protocol + "' is not supported. Supported protocols are: " + supported_protocols.join(', '));
        }
        // check if url starts with supported protocol
        const supported_protocols_regex = new RegExp('^(' + self.SUPPORTED_PROTOCOLS.join('|') + '):\/\/', 'i');
        if (url.match(supported_protocols_regex)) {
            return url.replace(supported_protocols_regex, protocol + '://');
        } else if (url.startsWith(("//"))) {
            return protocol + ':' + url;
        } else {
            return url;
        }
    }

    //-------------------------------------------------------------------------------------------------
    // HostName
    //-------------------------------------------------------------------------------------------------

    /**
     * Get the host name of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'my-business.com'
     *
     * // URL https://www.my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'www.my-business.com'
     *
     * // URL: https://subdomain.my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'subdomain.my-business.com'
     *
     * // URL: http://localhost:7000/other-param
     * SipaUrl.getHostName();
     * // => 'localhost'
     *
     * // URL: http://127.0.0.1/foo
     * SipaUrl.getHostName();
     * // => '127.0.0.1'
     *
     * // URL: http://localhost/foo
     * SipaUrl.getHostName();
     * // => 'localhost'
     *
     * @returns {string}
     */
    static getHostName() {
        const self = SipaUrl;
        return self.getHostNameOfUrl(self.getUrl());
    }


    /**
     * Get the host name of the given url.
     *
     * Returns an empty string if the given url is not valid or no hostname could be extracted.
     *
     * @example
     *
     * const url = "https://my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url);
     * // => 'my-business.com'
     *
     * const url2 = "https://www.my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url2);
     * // => 'www.my-business.com'
     *
     * const url3 = "https://subdomain.my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url3);
     * // => 'subdomain.my-business.com'
     *
     * @param {string} url
     * @returns {string}
     */
    static getHostNameOfUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        try {
            // Support file:// protocol
            if (url.startsWith('file://')) {
                // file://hostname/path or file:///path (no hostname)
                const match = url.match(/^file:\/\/([^\/]*)/);
                return match && match[1] ? match[1] : '';
            }
            // Support protocol-relative URLs: //example.com/path
            if (url.startsWith('//')) {
                url = 'http:' + url;
            }
            // Repair URLs with pattern like "http:/example.com"
            url = url.replace(/^(https?:)\/([^\/])/, '$1//$2');
            // Repair URLs with pattern like "http:/example.com" or "http//:example.com" to "http://example.com"
            url = url.replace(/^(https?)\/{1,2}:/, '$1://');
            let u = new URL(url);
            return u.hostname;
        } catch (e) {
            // Support Windows UNC paths: \\hostname\share\path
            const uncMatch = url.match(/^\\\\([^\\\/]+)[\\\/]/);
            if (uncMatch && uncMatch[1]) {
                return uncMatch[1];
            }
            // Fallback: extract hostname from http(s) or protocol-relative URLs
            const hostname_extract_regex = /^(https?:\/\/|\/\/)?([^\/]+)/;
            const match = url.match(hostname_extract_regex);
            if (match && match.length >= 3) {
                const hostname = match[2];
                if (/^[a-zA-Z0-9.\-]+$/.test(hostname)) {
                    return hostname;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }
    }

    /**
     * Set the host name of the current url without reloading the page.
     *
     * @example
     *
     * // URL: https://my-business.com/some-param
     * SipaUrl.setHostName("new-host.com");
     * // URL: https://new-host.com/some-param
     *
     * @param {string} hostname
     * @returns {SipaUrl}
     */
    static setHostName(hostname) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: hostname, param_name: 'hostname', expected_type: 'string'}
        ]);
        self.setUrl(self.setHostNameOfUrl(self.getUrl(), hostname));
        return self;
    }

    /**
     * Set/overwrite the host name of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url, "new-host.com");
     * // => https://new-host.com/some-param
     *
     * const url2 = "https://www.my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url2, "other-host.org");
     * // => https://other-host.org/some-param
     *
     * const url3 = "https://subdomain.my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url3, "127.0.0.1");
     * // => https://127.0.0.1/some-param
     *
     * @param {string} url
     * @param {string} hostname
     * @returns {string}
     */
    static setHostNameOfUrl(url, hostname) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: hostname, param_name: 'hostname', expected_type: 'string'}
        ]);
        // check if hostname is valid
        const hostname_regex = /^(?!:\/\/)([a-zA-Z0-9-_\.]+)$/;
        if (!hostname.match(hostname_regex)) {
            throw `Given hostname is not valid: '${hostname}'`;
        }
        try {
            let u = new URL(url);
            u.hostname = hostname;
            return u.toString();
        } catch (e) {
            let h = self.getHostNameOfUrl(url);
            if (h) {
                return url.replace(h, hostname);
            } else if (url.trim() === "") {
                return hostname;
            } else {
                throw `Given URL is not valid: ${url}`;
            }
        }
    }

    //-------------------------------------------------------------------------------------------------
    // Params
    //-------------------------------------------------------------------------------------------------

    /**
     * Get all params of the current URL.
     *
     * @example
     *
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
     * Set or overwrite given parameters of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?one=1&stat=true&that=cool
     * SipaUrl.setParams({ "more": "better", "stat": "false"});
     * // URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @returns {SipaUrl} for chaining
     */
    static setParams(params) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: params, param_name: 'params', expected_type: 'Object'}]);
        const new_url = self.setParamsOfUrl(self.getUrl(), params);
        self.setUrl(new_url);
        return self;
    }

    /**
     * Set or overwrite one specific parameter of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?super=banana&coca=cola
     * SipaUrl.setParam("pepsi","coke");
     * // URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
     *
     * @param {string} param_key
     * @param {string} value
     * @returns {SipaUrl} for chaining
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
        return self;
    }

    /**
     * Remove given params of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar&more=power
     * SipaUrl.removeParams(["some","more"]);
     * // URL: https://my-business.com/?foo=bar
     *
     * @param {Array<String>} param_keys
     * @returns {SipaUrl} for chaining
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self.setUrl(new_url);
        return self;
    }

    /**
     * Remove given param of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.removeParam("foo");
     * // URL: https://my-business.com/?some=stuff
     *
     * @param {string} param_key
     * @returns {SipaUrl} for chaining
     */
    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        self.removeParams([param_key]);
        return self;
    }

    /**
     * Remove all params of the current url.
     * If there is no parameter, nothing happens.
     * If there is an anchor, it will be preserved.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.resetParams();
     * // URL: https://my-business.com/#my-anchor
     *
     * @returns {SipaUrl} for chaining
     */
    static resetParams() {
        const self = SipaUrl;
        const new_url = self.removeParamsOfUrl(self.getUrl(), Object.keys(self.getParams()));
        self.setUrl(new_url);
        return self;
    }

    /**
     * Check if the current url has the given parameter.
     * If the parameter exists, it does not matter if it has a value or not.
     * If the parameter exists multiple times, it also returns true.
     * If the parameter does not exist, it returns false.
     *
     * @param {string} param_key
     * @returns {boolean}
     */
    static hasParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        const params = self.getParams();
        return typeof params[param_key] !== "undefined";
    }


    /**
     * Creates a URL query string based on the given key<->value object.
     *
     * @example
     *
     * SipaUrl.createUrlParams({ a: 1, b: [1,2,3], c: "test space" })
     * // => 'a=1&b=1&b=2&b=3&c=test%20space'
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
     * Create a JSON, containing the parameters of the given url.
     *
     * @example
     *
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
     * Remove the given parameters from the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar&more=power";
     * SipaUrl.removeParamsOfUrl(url, ["some","more"]);
     * // => https://my-business.com/?foo=bar
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
            if (typeof curr_params[key] !== "undefined") {
                delete curr_params[key];
            }
        });
        let query_params = self.createUrlParams(curr_params);
        if (query_params) {
            query_params = '?' + query_params;
        }
        if (typeof anchor === "undefined") {
            anchor = "";
        }
        return self.getUrlWithoutParamsAndAnchor(url) + query_params + anchor;
    }

    /**
     * Remove the given one parameter from the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar";
     * SipaUrl.removeParamOfUrl(url, "foo");
     * // => https://my-business.com/?some=stuff
     *
     * @param {string} url
     * @param {string} param_key name of the param
     * @returns {string} with given parameter removed
     */
    static removeParamOfUrl(url, param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: param_key, param_name: 'param_key', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        return self.removeParamsOfUrl(url, [param_key]);
    }

    /**
     * Set/overwrite the parameters of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?one=1&stat=true&that=cool"
     * SipaUrl.setParamsOfUrl(url, { "more": "better", "stat": "false"});
     * // => https://my-business.com/?one=1&stat=false&that=cool&more=better
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
        if (typeof anchor === "undefined") {
            anchor = "";
        }
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self.removeAnchorOfUrl(self.getUrlWithoutParamsAndAnchor(url)) + '?' + self.createUrlParams(curr_params) + anchor;
    }

    //-------------------------------------------------------------------------------------------------
    // Anchor
    //-------------------------------------------------------------------------------------------------

    /**
     * Set or overwrite given anchor of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff#my-anchor
     * SipaUrl.setAnchor("new-anchor");
     * // URL: https://my-business.com/?some=stuff#new-anchor
     *
     * // URL: https://my-business.com/?without=anchor
     * SipaUrl.setAnchor("added-anchor");
     * // URL: https://my-business.com/?without=anchor#added-anchor
     *
     * @param {string} anchor without leading # character
     * @param {boolean} jump jump to anchor
     * @returns {SipaUrl} for chaining
     */
    static setAnchor(anchor, jump = false) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: anchor, param_name: 'anchor', expected_type: 'string'},
            {param_value: jump, param_name: 'jump', expected_type: 'boolean'}
        ]);
        if (jump) {
            let state = {};
            if (window.history.state) {
                state = window.history.state;
            }
            let params = {page: state.page_id};
            if (typeof anchor !== "undefined") {
                window.location.href = window.location.href + '#' + anchor;
            } else {
                window.location.href = self.removeAnchorOfUrl(window.location.href);
            }
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(SipaUrl.getUrl(), params));
        } else {
            const new_url = self.setAnchorOfUrl(self.getUrl(), anchor);
            self.setUrl(new_url);
        }
        return self;
    }

    /**
     * Remove the anchor of the current URL.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.removeAnchor();
     * // URL: https://my-business.com/?some=stuff&foo=bar
     *
     * @returns {SipaUrl} for chaining
     */
    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self.setUrl(new_url);
        return self;
    }

    /**
     * Get the anchor of the current URL without leading #.
     *
     * Returns undefined if there is no anchor.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.getAnchor();
     * // => 'my-anchor'
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.getAnchor();
     * // => undefined
     *
     * @returns {string|undefined}
     */
    static getAnchor() {
        const self = SipaUrl;
        return self.getAnchorOfUrl(self.getUrl());
    }

    /**
     * Set/overwrite the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff#my-anchor";
     * SipaUrl.setAnchorOfUrl(url, "new-anchor");
     * // => https://my-business.com/?some=stuff#new-anchor
     *
     * const url2 = "https://my-business.com/?without=anchor";
     * SipaUrl.setAnchorOfUrl(url2, "added-anchor");
     * // => https://my-business.com/?without=anchor#added-anchor
     *
     * @param {string} url
     * @param {string} anchor as string, without leading #
     * @returns {string} with given anchor
     */
    static setAnchorOfUrl(url, anchor) {
        const self = SipaUrl;
        if (typeof anchor === "undefined") {
            return url;
        }
        SipaHelper.validateParams([
            {param_value: anchor, param_name: 'anchor', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let final_url = self.getUrlWithoutParamsAndAnchor(url);
        if (Object.keys(curr_params).length > 0) {
            final_url += '?';
        }
        return final_url + self.createUrlParams(curr_params) + '#' + anchor;
    }

    /**
     * Get the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
     * SipaUrl.getAnchorOfUrl(url);
     * // => 'my-anchor'
     *
     * const url2 = "https://my-business.com/?some=stuff&foo=bar";
     * SipaUrl.getAnchorOfUrl(url2);
     * // => undefined
     *
     * @param {string} url
     * @param {object} options
     * @param {boolean} options.return_prefixed_hash return the prefixed hash
     * @returns {string|undefined} the anchor of the given url
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
     * Remove the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
     * SipaUrl.removeAnchorOfUrl(url);
     * // => https://my-business.com/?some=stuff&foo=bar
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
}

SipaUrl.SUPPORTED_PROTOCOLS = [
    "http",
    "https",
    "ftp",
    "file",
    "data",
    "blob",
    "mailto",
    "tel",
    "sms",
    "geo",
    "intent",
    "about"
];

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
Sipa._version = "0.9.44";

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
