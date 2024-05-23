class ListItemComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "world";
        super(data, opts);
    }

    onInit() {
        // this is called after the view is added to the DOM
        console.log("ITEM INIT");
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ListItemComponent.template = () => {
    return `
<list-item-component onclick="instance(this).showAlert();" class="template-class">
    <span>Item <%= example %>!</span>
    <list-item-atom-component sipa-alias="atom1"></list-item-atom-component>
    <list-item-atom-component sipa-alias="atom2"></list-item-atom-component>
    <list-item-atom-component sipa-alias="atom3"></list-item-atom-component>
</list-item-component>
    `.trim();
}

SipaComponent.registerComponent(ListItemComponent);