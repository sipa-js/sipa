class {{class}} extends SipaBasicView {
    constructor(data = {}, options = {}) {
        // define your defaults here
        data.name ??= "world";
        super(data, options);
    }

    value() {
        return `Hello ${this._data.name}!`;
    }

    onInit() {
        // this is called after the view is added to the DOM
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

{{class}}.template = () => {
    return `
<{{class|dash_case}} onclick="alert(instance(this).value());">
    {{class}}'s name is <%= name %>!
</{{class|dash_case}}>
    `.trim();
}

SipaComponent.registerComponent({{class}});