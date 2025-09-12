class TreeEntryComponent extends SipaComponent {

    /**
     *
     * @param {TreeEntryComponent.Data} data
     * @param {TreeEntryComponent.Options} options
     */
    constructor(data, options) {
        data ??= {};
        data.name ??= "Entry";
        data.entries_list ??= [];
        data.children_counter = 0;
        super(data, options);
    }

    addElement() {
        const new_entry = new TreeEntryComponent({ name: "New Entry" }, { sipa_alias: 'entry_' + (++this._data.children_counter) });
        new_entry.events().createEvents("right_button_click");
        new_entry.events().subscribe("right_button_click", () => {
            this.events().trigger("right_button_click", [new_entry]);
        });
        this._data.entries_list.push(new_entry);
        this.update({ cache: false });
    }

    rightButtonClick() {
        this.events().trigger("right_button_click", [this]);
        this.update({ cache: false });
    }

    deleteItem() {
        this.destroy();
    }

    enableEditMode() {
        this._data.edit_mode = true;
    }

    changeItem() {
        this.update({ name: "Changed!" });
    }

    changeLabel() {
        this.update({ label: { text: "Lupi!"}});
    }
}

TreeEntryComponent.template = () => {
    return `
<tree-entry-component>
    <div>
        <editable-label-component text="'Breze'" sipa-alias="label"></editable-label-component>
        &nbsp;
        <div style="float: right;">
            <button onclick="instance(this).addElement();">+</button>
            <button onclick="instance(this).deleteItem();">DEL</button>
            <button onclick="instance(this).changeItem();">C</button>
            <button onclick="instance(this).changeLabel();">L</button>
            <button onclick="instance(this).rightButtonClick();">?</button>
        </div>
    </div>    
    <div style="margin-left: 8px;" sipa-list="entries_list"></div>
</tree-entry-component>
    `;
}

SipaComponent.registerComponent(TreeEntryComponent);