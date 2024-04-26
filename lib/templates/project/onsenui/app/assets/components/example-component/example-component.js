
class ExampleComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        data.example ??= "world";
        super(data, opts);
    }

    onInit() {

    }

    onDestroy() {

    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ExampleComponent.template = () => {
    return `
<example-component onclick="instance(this).showAlert();">
    <span>Hello <%= example =>!</span>
</example-component>
    `.trim();
}

SipaComponent.registerComponent(ExampleComponent);