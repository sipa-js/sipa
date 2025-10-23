
class ExampleComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "world";
        super(data, opts);
    }

    onInit() {
        // this is called after the view is added to the DOM
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ExampleComponent.template = () => {
    return `
<example-component onclick="instance(this).showAlert();">
    <span>Hello <%= example %>!</span>
</example-component>
    `.trim();
}

SipaComponent.registerComponent(ExampleComponent);