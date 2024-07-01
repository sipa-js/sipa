class ListItemComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.name ??= "Item";
        data.example ??= "world";
        super(data, opts);
    }

    onInit(self, element) {
        // this is called after the view is added to the DOM
        console.log("ITEM INIT");
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    change() {
        this.update({name: "Insane"})
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ListItemComponent.template = () => {
    return `
<list-item-component class="template-class">
    <span><%= name %> <%= _meta.sipa_id %>! <%= (new Date()).toLocaleTimeString() %></span>
    <list-item-atom-component sipa-alias="atom1"></list-item-atom-component>
    SINK
    <list-item-atom-component sipa-alias="atom2">
        <list-item-molecule-component sipa-alias="mole1"></list-item-molecule-component>    
    </list-item-atom-component>
    <list-item-atom-component sipa-alias="atom3"></list-item-atom-component>
    <button onclick="instance(this).destroy();">Del</button>
    <button onclick="instance(this).change();">Change</button>
</list-item-component>
    `.trim();
}

SipaComponent.registerComponent(ListItemComponent);