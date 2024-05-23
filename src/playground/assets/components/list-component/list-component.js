class ListComponent extends SipaComponent {
    constructor(data = {}, opts = {}) {
        // define your defaults here
        data.example ??= "world";
        super(data, opts);
    }

    updates(data = {}, options = {}) {
        const result = super.update(data, options);
        this._list.eachWithIndex((el, i) => {
            el.append(`${this.selector()} > .container`);
        });
        return result;
    }

    onInit() {
        console.log("INIT");
        return;
        if(!this._list) {
            this._list = [];
            for(let i = 0; i < 20; ++i) {
                const c = new ListItemComponent({ example: i });
                this._list.push(c);
                c.append(`${this.selector()} > .container`);
            }
        }
    }

    onDestroy() {
        // this is called, before the component is destroyed by destroy()
    }

    showAlert() {
        alert(`Bye, bye, ${this._data.example}!`);
    }
}

//--- TEMPLATE ---------------------------------------------------------------------------------------------------------

ListComponent.template = () => {
    return `
<list-component onclick="instance(this).showAlert();" class="template-class">
    <span>Hello <%= example %>!</span>
    <div class="containers">
        <list-item-component sipa-alias="first"></list-item-component>
        <list-item-component sipa-alias="next"></list-item-component>
    </div>
    <div class="container2" style="dsisplay: none">
        <% for(let i=1; i < 20; ++i) { %>
            <list-item-component sipa-alias="s<%= i %>" example="<%= i %>"></list-item-component>
        <% } %>
    </div>
</list-component>
    `.trim();
}

SipaComponent.registerComponent(ListComponent);