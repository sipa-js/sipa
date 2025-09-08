class TreeComponent extends SipaComponent {

    constructor(data = {}, opts = {}) {
        // default data
        data.title = "TreeTitle";
        data.click_counter = 0;
        data.children_counter = 0;
        // child entries
        data.entries_list ??= [];
        //data.tree_entries = TreeComponent.getTreeFilterEntries(data.entries, options.sipa_alias);

        super(data, opts);
        this.initTemplate();
        this.events().createEvents("tree_right_click");
        this.events().subscribe("tree_right_click", (instance, data, options) => {
            this.rightButtonClick();
        });

        // TODO: reactivate if sipa child event handling on parent works
        // for(const child of TreeComponent._getAllChildren(this)) {
        //     child.events().subscribe("on_right_button_click", (child_obj, child_data, child_options) => {
        //         console.log("trigger right child button")
        //         this.events().trigger("on_entry_right_button_click", [child_obj, child_data, child_options]);
        //     });
        // }
    }

    addElement() {
        const new_entry = new TreeEntryComponent({ name: "New Entry" }, { sipa_alias: 'entry_' + (++this._data.children_counter) });
        new_entry.events().createEvents("right_button_click");
        new_entry.events().subscribe("right_button_click", () => {
            this.events().trigger("tree_right_click", [new_entry]);
        });
        this._data.entries_list.push(new_entry);
        this.update();
    }

    rightButtonClick() {
        console.log("Right button clicked in tree component");
        this._data.click_counter++;
        this.update();
    }
}

TreeComponent.template = () => {
    return `
<tree-component>    
    <h3> <%=title%> (<%= click_counter %> clicks)</h3>
    <button onclick="instance(this).addElement();">Add Entry</button>
    <%if(entries.length) {%>
    <div sipa-list="entries_list"></div>
    <%} else {%>
    <p>No entries!</p>
    <%}%>
</tree-component>
`;
};

SipaComponent.registerComponent(TreeComponent);