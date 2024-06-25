class ListElementComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.name ??= "Element";
        data.example ??= "elo";
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

ListElementComponent.template = () => {
    return `
<list-element-component class="template-class">
    <span><%= name %> <%= _meta.sipa_id %>! <%= (new Date()).toLocaleTimeString() %></span>
    <list-item-atom-component sipa-alias="atom1"></list-item-atom-component>
    <list-item-atom-component sipa-alias="atom2"></list-item-atom-component>
    <button onclick="instance(this).destroy();">Del</button>
</list-element-component>
    `.trim();
}

SipaComponent.registerComponent(ListElementComponent);