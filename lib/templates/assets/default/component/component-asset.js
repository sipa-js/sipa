class {{class}} extends SipaBasicView {
    constructor(data = {}, options = {}) {
        data.name ??= "world";
        super(data, options);
    }

    value() {
        return `Hello ${this._data.name}!`;
    }

    onInit() {
        // fired after component is created first time
    }

    onDestroy() {
        // fired when component is destroyed by destroy()
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