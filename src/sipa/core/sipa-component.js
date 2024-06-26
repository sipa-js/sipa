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
    #destroyed = false;
    /**
     * @type {Object}
     */
    #previous_data = null;
    /**
     * List of to check for alias duplicates
     * @type {Array<string>}
     */
    #apply_alias_duplicate_list = [];
    /**
     * @type {Element}
     */
    #cached_node = null;
    /**
     * Sync nested references automatically after every render update
     * May be disabled on performance cases. Then overwrite to 'false' at the inherited class.
     * @type {boolean}
     */
    _sync_nested_references = true;

    /**
     * @type {number}
     */
    static #component_id_incrementer = 1;
    /**
     * @type {function} class
     */
    static #component_instances = [];
    /**
     * @type {Function} class
     */
    static #registered_components = [];


    /**
     * @param {Object<String, *>} data object of properties
     * @param {Object} options
     * @param {boolean} options.sipa_hidden=false initial visibility state
     * @param {boolean} options.sipa_cache=true use node caching for templates
     * @param {string} options.sipa_classes additional classes for component tag
     * @param {string} options.sipa_alias alias to access from parent by uniq accessor name
     * @param {Object<string, string>} options.sipa_custom_attributes additional custom attributes on the component tag
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
        // unique id
        this._meta.sipa_id = self.#generateUniqueId();
        this.#updateData(data);
        // get class and display style from original element
        const html = this.#inheritedClass().template();
        const parsed = self.#parseHtml(html);
        this._meta.sipa_classes = (parsed.className + " " + options.sipa_classes.trim()).trim();
        this._meta.sipa_original_display = parsed.style ? parsed.style.display : '';
        this._meta.sipa_custom_attributes = options.sipa_custom_attributes || {};
        this._meta.sipa_hidden = options.sipa_hidden;
        this._meta.sipa_cache = options.sipa_cache;
        this._meta.sipa_alias = options.sipa_alias;
        self.#component_instances.push(this);
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
        let html = this.#inheritedClass().template();
        html = this.#applyTemplateId(html);
        const _this = this;
        try {
            html = ejs.render(html, _.merge(_.cloneDeep(this._data), _.cloneDeep({_meta: this._meta})));
        } catch (e) {
            if (e instanceof ReferenceError) {
                const last_line = e.message.split("\n").getLast();
                const attribute_name = last_line.split(" ").getFirst();
                throw new ReferenceError(`The property 'data.${attribute_name}' in the template of <${LuckyCase.toDashCase(_this.constructor.name)}> is not defined.`);
            } else {
                throw e;
            }
        }
        this.#apply_alias_duplicate_list = [];
        let parsed = self.#parseHtml(html);
        parsed = this.#applySlots(parsed, html);
        parsed = this.#applyTemplateCustomAttributes({ parsed });
        parsed = this.#applyTemplateClasses({ parsed });
        parsed = this.#applyTemplateHiddenState({ parsed });
        parsed = this.#applyTemplateChildrenComponents({ parsed }, { cache: options.cache});
        parsed = this.#applyTemplateSipaList({ parsed }, { cache: options.cache});
        return parsed.outerHTML;
    }

    /**
     * @param {Object} options
     * @param {boolean} options.cache=true use node cache
     * @returns {Element} element representation of html()
     */
    node(options) {
        const self = SipaComponent;
        const data_changed = !(_.isEqual(this.#previous_data, this._data));
        this.#previous_data = _.cloneDeep(this._data);
        options ??= {};
        options.cache ??= true;
        let parsed;
        if (data_changed || !this.#cached_node || !options.cache || !this._meta.sipa_cache) {
            parsed = self.#parseHtml(this.html({ cache: options.cache}));
            this.#cached_node = parsed.cloneNode(true);
        } else {
            parsed = this.#cached_node.cloneNode(true);
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
     * Get cloned data of the current instance
     *
     * @returns {Object}
     */
    data() {
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
        if (this.#destroyed) {
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
        const index = self.#component_instances.indexOf(this);
        this.remove();
        if (index !== -1) {
            delete self.#component_instances[index];
            self.#component_instances = self.#component_instances.filter(x => x);
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
        this.#destroyed = true;
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
        return this.#destroyed;
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
            console.warn(`${this.constructor.name} with sipa-id '${this._meta.sipa_id}' does not exist in DOM.`);
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
        this.#updateData(data, {reset: options.reset});
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
     * Return children components of the current component with its sipa-aliases as their keys
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
        this.#synchronizeDataToParent();
        this.#synchronizeDataToChildren({recursive: true});
    }

    /**
     * Events of the component to subscribe, unsubscribe or trigger
     *
     * @return {SipaEvents}
     */
    events() {
        return this._events ??= new SipaEvents(['before_update','after_update','before_destroy','after_destroy']);
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
            all_components = self.#component_instances;
        } else {
            all_components = self.#component_instances.filter(e => e.constructor.name === this.name);
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
            return SipaComponent.#component_instances.find(x => x._meta.sipa_id === sipa_id);
        } else {
            return SipaComponent.#component_instances.find(x => x.constructor.name === component_class_name && x._meta.sipa_id === sipa_id);
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
                component_selector = self.#registered_components.map(x => LuckyCase.toDashCase(x.name) + ':not([sipa-id])').join(`,`)
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
                    data = _.merge(data, parent_alias_data);
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
        const children_selector = self.#registered_components.map(x => x.tagName() + ':not([sipa-id])').join(", ");
        uninitialized_children = new_element_node.querySelectorAll(children_selector);
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                component._meta.sipa_children ??= [];
                const child = self.initElement(el);
                child._meta.sipa_parent = component;
                component.#addChild(child);
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
            instance = self.#component_instances.filter((el) => {
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
        if (!self.#registered_components.includes(component)) {
            self.#registered_components.push(component);
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
    #updateData(data, options = {}) {
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
                this._data = _.merge(this._data, data_copy);
            }
            this.#synchronizeDataToChildren();
            this.#synchronizeDataToParent();
        }
    }

    /**
     * Get inherited class
     *
     * @return {SipaComponent}
     */
    #inheritedClass() {
        return this.constructor;
    }

    /**
     * Add sipa-id attribute to given template html
     *
     * @param {string} html
     * @returns {string}
     */
    #applyTemplateId(html) {
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
    #applySlots(parsed, html) {
        const self = SipaComponent;
        const has_slots = html.includes("<slot");
        if(has_slots) {
            if(this._meta.sipa_body_nodes.length > 0) {
                // const parsed = self.#parseHtml(html);
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
                return parsed;
            }
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
    #applyTemplateClasses(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self.#parseHtml(args.html);
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
    #applyTemplateHiddenState(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self.#parseHtml(args.html);
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
    #applyTemplateChildrenComponents(args, options) {
        const self = SipaComponent;
        options ??= {};
        options.cache ??= true;
        const parsed = args.parsed || self.#parseHtml(args.html);
        let uninitialized_children = [];
        const children_selector = self.#registered_components.map(x => x.tagName() + ':not([sipa-id])').join(", ");
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
                } else if (this.#apply_alias_duplicate_list.includes(alias)) {
                    throw new Error(`Duplicate sipa-alias "${alias}" for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                }
                this.#apply_alias_duplicate_list.push(alias);
                let child_component = this._meta.sipa_children.find(x => x._meta.sipa_alias === alias);
                const child = self.initElement(el, {sipa_component: child_component, parent_data: this._data});
                if (!this.childrenAliases().includes(alias)) {
                    child._meta.sipa_parent = this;
                    this.#addChild(child);
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
    #applyTemplateSipaList(args, options) {
        const self = SipaComponent;
        const _this = this;
        options ??= {};
        options.cache ??= true;
        const parsed = args.parsed || self.#parseHtml(args.html);
        if (parsed) {
            const sipa_list_elements = [...parsed.querySelectorAll(`[sipa-list]:not(${self.#registered_components.map(x => LuckyCase.toDashCase(_this.constructor.name) + ' ' + x.tagName() + ' [sipa-list]').join(", ")})`)];
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
                            } else if(this.#apply_alias_duplicate_list.includes(alias)) {
                                throw new Error(`Duplicate sipa-alias "${alias}" for embedded component <${item.constructor.tagName()}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                            }
                            this.#apply_alias_duplicate_list.push(alias);
                            if (!this.childrenAliases().includes(alias)) {
                                item._meta.sipa_parent = this;
                                item._meta.sipa_list = reference;
                                this.#addChild(item);
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
    #applyTemplateCustomAttributes(args) {
        const self = SipaComponent;
        const parsed = args.parsed || self.#parseHtml(args.html);
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
    static #parseHtml(html) {
        return document.createRange().createContextualFragment(html).firstElementChild;
    }

    /**
     * Generate unique component id (auto increment)
     *
     * @return {number}
     */
    static #generateUniqueId() {
        const self = SipaComponent;
        return self.#component_id_incrementer++;
    }

    /**
     * Synchronize children data from current instance to its children
     *
     * @param {Object} options
     * @param {boolean} options.recursive=false synchronize through all children trees
     */
    #synchronizeDataToChildren(options = {}) {
        options ??= {};
        options.recursive ??= false;
        this.childrenAliases().eachWithIndex((alias, i) => {
            if (typeof this._data[alias] === "object") {
                this.children()[alias].#updateData(this._data[alias], {clone: false});
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
    #synchronizeDataToParent() {
        if (this.hasParent()) {
            this.parent()._data[this.alias()] = this._data;
        }
    }

    /**
     * Add component child class instance to list of current instance children
     *
     * @param {SipaComponent} child
     */
    #addChild(child) {
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