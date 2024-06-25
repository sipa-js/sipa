class ListComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "world";
        data._clist = [];
        super(data, opts);
    }

    onInit() {
        console.log("LIST INIT");
    }

    delete(component) {
        component.destroy({ force: true });
        this.update();
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    addItem(options) {
        options ??= {};
        options.render ??= true;
        this._counter ??= 1000;
        let component_type;
        if([0,1].getSample() === 1) {
            component_type = ListItemComponent;
        } else {
            component_type = ListElementComponent;
        }
        this._data._clist.push(new component_type({ example: this._counter++ }, { sipa_alias: "kok_" + this._counter }));
        if(options.render) {
            this.render();
        }
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ListComponent.template = () => {
    return `
<list-component class="template-class">
    <span>Hello <%= example %>! <%= (new Date()).toLocaleTimeString() %></span>
    <div class="top-bar">
        <button onclick="instance(this).addItem();">Add</button>
    </div>
    <div sipa-list="_clist"></div>
    <list-item-component sipa-alias="abc" name="'Supra'"></list-item-component>
</list-component>
    `.trim();
}

SipaComponent.registerComponent(ListComponent);