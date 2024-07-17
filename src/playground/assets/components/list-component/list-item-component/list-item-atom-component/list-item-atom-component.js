class ListItemAtomComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "O";
        super(data, opts);
    }

    onInit() {
        // this is called after the view is added to the DOM
        console.log("ATOM INIT");
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ListItemAtomComponent.template = () => {
    return `
<list-item-atom-component onclick="instance(this).showAlert();" class="template-class">
    <slot>s<%= example %>!</slot>
</list-item-atom-component>
    `.trim();
}

SipaComponent.registerComponent(ListItemAtomComponent);