//----------------------------------------------------------------------------------------------------

SipaComponentEventsSpec = {};
SipaComponentEventsSpec.options = {};

//----------------------------------------------------------------------------------------------------
//
// Test components using events, especially nested elements, sipa-lists and nested, nested elements
// and slots and then update the elements and recheck if the events are still available and working.
//
//----------------------------------------------------------------------------------------------------

class ChildListComponent extends SipaComponent {

    constructor(data, options) {
        data ??= {};
        data.title ??= "Listo"
        data.list = [];
        data.click_counter = 0;
        super(data, options);
        this.events().createEvents("trigger_list_item");
        this.events().subscribe("trigger_list_item", (instance, data, options) => {
           this._data.click_counter++;
        });
    }

    listClickCounter() {
        return this._data.click_counter;
    }

    addItem(name = "NewItem") {
        this._counter ??= 1;
        const item = new MiniListItemComponent({ name: name }, { sipa_alias: "item_" + this._counter++ });
        item.events().subscribe("trigger_item_button", (instance, data, options) => {
           console.log("Item button triggered in item:", instance, data, options);
              this.events().trigger("trigger_list_item");
        });
        this._data.list.push(item);
        this.update();
        return item;
    }

    static template = () => {
        return `<child-list-component><%= title %><div sipa-list="list"></div></child-list-component>`;
    }
}
SipaComponent.registerComponent(ChildListComponent);

//----------------------------------------------------------------------------------------------------

class MiniListItemComponent extends SipaComponent {

    constructor(data, options) {
        data ??= {};
        data.name ??= "Item"
        data.click_counter = 0;
        super(data, options);
        this.events().createEvents("trigger_item_button");
        this.events().subscribe("trigger_item_button", (instance, data, options) => {
              this._data.click_counter++;
        });
    }

    itemClickCounter() {
        return this._data.click_counter;
    }

    triggerItemButton() {
        this.events().trigger("trigger_item_button");
    }

    static template = () => {
        return `<mini-list-item-component><%= name %> elemento!<button onclick="instance(this).triggerItemButton();">TRIGGER</button></mini-list-item-component>`;
    }
}
SipaComponent.registerComponent(MiniListItemComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('nested events', () => {
        let event_state = 0;
        beforeAll(() => {
            SipaTest.enableTestingMode();
            SipaComponent.destroyAll();
        });
        beforeEach(() => {
            $("playground").remove();
            $("body").append($("<playground></playground>")[0]);
        });
        it('parent can subscribe child items events to trigger parent event', function () {
            const comp = new ChildListComponent({ title: "List 1" });
            comp.append("playground");

            let li1 = comp.addItem("Item 1");
            let li2 = comp.addItem("Item 2");

            expect(comp.listClickCounter()).toEqual(0);
            expect(li1.itemClickCounter()).toEqual(0);
            expect(li2.itemClickCounter()).toEqual(0);

            $(li1.selector()).find("button")[0].click();
            expect(li1.itemClickCounter()).toEqual(1);
            expect(comp.listClickCounter()).toEqual(1);
            comp.update({ title: "List 2"});
            li1.update({ name: "Item 1 updated" });
            li2.update({ name: "Item 2 updated" });
            $(li1.selector()).find("button")[0].click();
            $(li2.selector()).find("button")[0].click();
            expect(li1.itemClickCounter()).toEqual(2);
            expect(comp.listClickCounter()).toEqual(3);
        });
    });
});

//----------------------------------------------------------------------------------------------------