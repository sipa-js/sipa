/**
 * Easy but powerful component class implementation to create your reusable components
 */
class SipaComponent {

    _data = {};
    /**
     * @type {SipaComponent.Meta}
     * @private
     */
    _meta = {};
    #destroyed = false;

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
     * @param {Object} data
     * @param {Object} options
     * @param {boolean} options.update_visible_only=false update view only on update when visible
     */
    constructor(data = {}, options = {}) {
        const self = SipaComponent;
        SipaHelper.validateParams([
            {param_name: 'data', param_value: data, expected_type: 'Object'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        this._data = {};
        this._meta.sipa_children = undefined;
        // unique id
        this._meta.sipa_id = self.#generateUniqueId();
        this.#updateData(data);
        // get class and display style from original element
        const html = this.#inheritedClass().template();
        const parsed = self.#parseHtml(html);
        this._meta.sipa_classes = parsed.className;
        this._meta.sipa_original_display = parsed.style ? parsed.style.display : '';
        this._meta.sipa_custom_attributes = {};
        self.#component_instances.push(this);
    }

    /**
     * @returns {string} rendered template() with current values of data
     */
    html() {
        const self = SipaComponent;
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
        html = this.#applyTemplateCustomAttributes(html);
        html = this.#applyTemplateClasses(html);
        html = this.#applyTemplateHiddenState(html);
        html = this.#applyTemplateChildrenComponents(html);
        return html;
    }

    /**
     * @returns {Element} element representation of html()
     */
    node() {
        const self = SipaComponent;
        return self.#parseHtml(this.html());
    }

    /**
     * Create a DOM node of the instance and append it to the given selector
     *
     * @param {string} query_selector
     * @returns {SipaComponent}
     */
    append(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.appendChild(this.node());
            this.#triggerEvent('onInit', el);
        });
        return this;
    }

    /**
     * Create a DOM node of the instance and prepend it to the given selector
     *
     * @param {string} query_selector
     * @return {SipaComponent}
     */
    prepend(query_selector) {
        const self = SipaComponent;
        document.querySelectorAll(query_selector).forEach((el) => {
            el.prepend(this.node());
            this.#triggerEvent('onInit', el);
        });
        return this;
    }

    /**
     * Get cloned data
     *
     * @returns {Object}
     */
    data() {
        return _.cloneDeep(this._data);
    }


    /**
     * Set cloned data
     * @param {Object} data
     * @return {SipaComponent}
     */
    resetData(data) {
        const self = SipaComponent;
        this._data = _.cloneDeep(data);
        return this;
    }

    /**
     * Value representation of the component. Should be usually overwritten by the inherited class.
     */
    value() {
        return this._meta.sipa_id;
    }


    element() {
        const self = SipaComponent;
        const els = document.querySelector(this.selector());
        if (els) {
            return els;
        }
    }

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
     * Get the css selector of the current instance
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
     * @param {Object} options
     * @param {boolean} options.force=false
     * @returns {SipaComponent}
     */
    destroy(options = {}) {
        const self = SipaComponent;
        options ??= {};
        if (this.hasParent() && !options.force) {
            throw new Error(`You can not destroy a component, that is a child of another!`);
        }
        this.#triggerEvent('onDestroy', this.element());
        if (this.hasChildren()) {
            this.children().eachWithIndex((key, val) => {
                val.destroy({ force: true });
            });
        }
        if (this.hasParent()) {
            const parent_index = this.parent()._meta.sipa_children.indexOf(this);
            delete this.parent()._meta.sipa_children[parent_index];
            this.parent()._meta.sipa_children.filter(x => x); // remove empty entries
        }
        const index = self.#component_instances.indexOf(this);
        this.remove();
        if (index !== -1) {
            delete self.#component_instances[index];
            self.#component_instances = self.#component_instances.filter(x => x);
        }
        this._data = undefined;
        this._meta = undefined;
        this.#destroyed = true;
        delete this;
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
     * Update the data of the instance and rerender its view
     *
     * @param {SipaComponent.Data} data
     * @param {Object} options
     * @param {boolean} options.render=true render after data update
     * @param {boolean} options.reset=false if false, merge given data with existing, otherwise reset component data to given data
     * @returns {SipaComponent}
     */
    update(data = {}, options = {}) {
        options ??= {};
        const default_options = {
            render: true,
            reset: false,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        this.#updateData(data, {reset: options.reset});
        if (options.render) {
            this.elements().forEach((el) => {
                el.replaceWith(this.node());
            });
        }
        return this;
    }

    /**
     * @param {string} class_name
     * @param {Object} options
     * @param {boolean} options.update=true
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
     * Check if component has given class
     *
     * @param class_name
     * @return {boolean} true if class is set
     */
    hasClass(class_name) {
        return this._meta.sipa_classes.split(" ").includes(class_name);
    }

    /**
     * @param {string} class_name
     * @param {Object} options
     * @param {boolean} options.update=true
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
     * Return children components of the current component
     *
     * @return  {Object<string, SipaComponent>} Object<alias, component>
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
     * Return keys for children aliases
     *
     * @return {Array<string>}
     */
    childrenAliases() {
        return Object.keys(this.children());
    }

    /**
     * Check if the component has children or not
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
     */
    parentTop() {
        return this._meta.sipa_parent ? this._meta.sipa_parent.parentTop() : this;
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
     * Get instance of current class by sipa-id
     *
     * @param {number} sipa_id
     * @return {undefined|SipaComponent}
     */
    static bySipaId(sipa_id) {
        const self = SipaComponent;
        const component_class_name = `${this.name}`;
        if(component_class_name === 'SipaComponent') {
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
        self.all().eachWithIndex((el, i) => {
            el.destroy();
        });
    }

    /**
     * Init all uninitialized components of the current component class in the DOM inside the given css selector automatically.
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
            let component_selector = `${LuckyCase.toDashCase(component_class_name)}:not([sipa-id])`;
            // if called by the base component, search for all components
            if (component_class_name === 'SipaComponent') {
                component_selector = self.#registered_components.map(x => LuckyCase.toDashCase(x.name) + ':not([sipa-id])').join(`,`)
            }
            const uninitialized_elements = ps.querySelectorAll(component_selector);
            [...uninitialized_elements].eachWithIndex((el, i) => {
                new_initialized_elements.push(self.initElement(el));
            });
        });
        return new_initialized_elements;
    }

    /**
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
            const new_component_obj = { _meta: { sipa_custom_attributes: {} } };
            const attr_keys = [...element.attributes].map(e => e.name);
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
                        if(raw_value.trim() === '') {
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
                        throw new Error(`Error parsing value for attribut '${key}' in component '<${LuckyCase.toDashCase(new_component_obj.constructor.name)}>'. Be aware that the attribute value is interpreted as pure javascript. So for example, strings must be put into quotes. E.g. "sample string" must be "'sample string'".\n${e.message}`);
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
            return new_component;
        } else if (typeof options.sipa_component !== 'undefined') {
            return options.sipa_component;
        }
    }

    /**
     * Init child components if available
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
                el.replaceWith(child.node());
            });
        }
        return new_element_node;
    }

    /**
     * Get tag name of current component class
     *
     * @return {string}
     */
    static tagName() {
        return LuckyCase.toDashCase(this.prototype.constructor.name);
    }

    /**
     * @param {HTMLElement} element
     * @returns {SipaComponent}
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
     * Register given component class
     *
     * @param {SipaComponent} component
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
     * @private
     */
    #updateData(data, options = {}) {
        const self = SipaComponent;
        options ??= {};
        const default_options = {
            reset: false,
        };
        options = SipaHelper.mergeOptions(default_options, options);
        if (typeof data !== 'object') {
            throw new Error(`Given 'data' must be of type object! Given: ${Typifier.getType(alias)}`);
        }
        if (data) {
            let data_copy = _.cloneDeep(data);
            if (options.reset) {
                this._data = data_copy;
            } else {
                this._data = _.merge(this._data, data_copy);
            }
            this.#synchronizeDataToChildren();
        }
    }

    /**
     * Call the given event_name method on the current instance and pass the given element
     *
     * @param {string} event_name
     * @param {Element} element
     */
    #triggerEvent(event_name, element) {
        if (typeof this[event_name] === 'function') {
            this[event_name](this, element);
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
     * @param {string} html
     * @returns {string}
     */
    #applyTemplateId(html) {
        const COMPONENT_TAG_REGEX = /^<([a-zA-Z\-\_0-9]+)/gm;
        return html.replace(COMPONENT_TAG_REGEX, `<$1 sipa-id="${this._meta.sipa_id}"`);
    }

    /**
     * Add class attribute to given template html
     * @param {string} html
     * @returns {string}
     */
    #applyTemplateClasses(html) {
        const self = SipaComponent;
        const parsed = self.#parseHtml(html);
        if (parsed && this._meta.sipa_classes) {
            parsed.className = this._meta.sipa_classes;
        }
        return parsed.outerHTML;
    }

    /**
     * Check and set display style to given template html
     * @param {string} html
     * @returns {string}
     */
    #applyTemplateHiddenState(html) {
        const self = SipaComponent;
        const parsed = self.#parseHtml(html);
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
        return parsed.outerHTML;
    }

    /**
     * Replace children components to given template html
     * @param {string} html
     * @returns {string}
     */
    #applyTemplateChildrenComponents(html) {
        const self = SipaComponent;
        const parsed = self.#parseHtml(html);
        let uninitialized_children = [];
        const children_selector = self.#registered_components.map(x => x.tagName() + ':not([sipa-id])').join(", ");
        uninitialized_children = parsed.querySelectorAll(children_selector);
        const are_children_initialized = typeof this._meta.sipa_children !== 'undefined';
        if (uninitialized_children.length > 0) {
            [...uninitialized_children].eachWithIndex((el, i) => {
                this._meta.sipa_children ??= []; // if not set yet, they will be initialized at the first time
                // check for alias
                const alias = el.getAttribute('sipa-alias');
                if (!alias) {
                    throw new Error(`Missing sipa-alias for embedded component <${LuckyCase.toDashCase(el.tagName)}> in <${LuckyCase.toDashCase(this.constructor.name)}>`);
                }
                let child_component = this._meta.sipa_children.find(x => x._meta.sipa_alias === alias);
                const child = self.initElement(el, {sipa_component: child_component, parent_data: this._data});
                if (!this.childrenAliases().includes(alias)) {
                    child._meta.sipa_parent = this;
                    this.#addChild(child);
                }
                el.replaceWith(child.node());
            });
        }
        return parsed.outerHTML;
    }

    /**
     * Apply custom attributes to given html template
     *
     * @param {string} html
     * @return {string}
     */
    #applyTemplateCustomAttributes(html) {
        const self = SipaComponent;
        if (Object.keys(this._meta.sipa_custom_attributes).length > 0) {
            const parsed = self.#parseHtml(html);
            if (parsed) {
                this._meta.sipa_custom_attributes.eachWithIndex((key, value) => {
                    // special case, we merge classes from template class and declarative attr-class
                    if (key === "class") {
                        this.addClass(value, {update: false});
                    } else {
                        parsed.setAttribute(key, value);
                    }
                });
                return parsed.outerHTML;
            } else {
                return html;
            }
        }
        return html;
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
     * Synchronisize children data from current instance to its children
     */
    #synchronizeDataToChildren() {
        this.childrenAliases().eachWithIndex((alias, i) => {
            if (typeof this._data[alias] === "object") {
                this.children()[alias].#updateData(this._data[alias]);
            } else if (typeof this._data[alias] !== 'undefined') {
                throw new Error(`Given alias 'data.${alias}' must be of type object! Given: ${Typifier.getType(alias)}`);
            }
        });
    }

    /**
     * Add component child class instance to list of children
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
 * @property {string} sipa_classes
 * @property {boolean} sipa_hidden=false
 * @property {string} sipa_alias
 * @property {Array<SipaComponent>} sipa_children
 * @property {SipaComponent} sipa_parent
 * @property {string} sipa_original_display
 * @property {string} sipa_changed_visibility
 * @property {Object<string, string>} sipa_custom_attributes
 */


/**
 * @typedef {Object} SipaComponent.Options
 * @property {boolean} update_view_only_when_visible=false
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
 */
function instance(element) {
    return SipaComponent.instanceOfElement(element);
}