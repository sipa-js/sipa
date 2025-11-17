class {{class}} extends SipaComponent {
    constructor(data = {}, options = {}) {
        // define your defaults here
        data.name ??= "world";
        super(data, options);
    }

    value() {
        return `Hello ${this._data.name}!`;
    }

    onDestroy() {
        // this is called, before the components "before_destroy" event is triggered and is destroyed
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

{{class}}.template = () => {
    return `
<{{class|dash_case}} onclick="alert(instance(this).value());">
    {{class}}'s name is <%= name %>!
</{{class|dash_case}}>
    `.trim();
};

SipaComponent.registerComponent({{class}});