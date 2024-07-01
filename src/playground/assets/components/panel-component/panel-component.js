class PanelComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.title ??= "TITLE";
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
        const new_component = new component_type({ example: this._counter++ }, { sipa_alias: "kok_" + this._counter });
        this._data._clist.push(new_component);
        new_component.events().subscribe("after_update", (child, data, options) => { alert(JSON.stringify(data)) });
        if(options.render) {
            this.render();
        }
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

PanelComponent.template = () => {
    return `
<panel-component class="template-class">
    <h1><%= title %></h1>
    <h2 style="color: red;"><slot name="header">HEADER SLOT</slot></h2>
    <h2><slot name="default"></slot></h2>
    banano
    <list-component sipa-alias="lista" name="'Supra'"></list-component>
    <h3>libara</h3>
    <div class="content">
        contaro        
    </div>
    <list-item-component sipa-alias="abc" name="'Supra'"></list-item-component>
</panel-component>
    `.trim();
}

SipaComponent.registerComponent(PanelComponent);

/*

// TEMPLATE

<component>
    <slot name="header"></slot>
    <slot name="content"></slot>
    <slot></slot>
</component>




// DECLARATION

<slider>
    <content slot="content">

    </content>
    <content2 slot="header">

    </content2>
    Other content
</slider>

 */