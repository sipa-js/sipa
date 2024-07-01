class ListItemMoleculeComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "X";
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

ListItemMoleculeComponent.template = () => {
    return `
<list-item-molecule-component onclick="instance(this).showAlert();" class="template-class">
    <slot><%= example %>!</slot>
</list-item-molecule-component>
    `.trim();
}

SipaComponent.registerComponent(ListItemMoleculeComponent);