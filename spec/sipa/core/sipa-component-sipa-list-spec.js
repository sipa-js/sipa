//----------------------------------------------------------------------------------------------------

SipaComponentSipaListSpec = {};
SipaComponentSipaListSpec.options = {};

//----------------------------------------------------------------------------------------------------

class ListComponent extends SipaComponent {
}

SipaComponent.registerComponent(ListComponent);

class ListItemComponent extends SipaComponent {
}

SipaComponent.registerComponent(ListItemComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeAll(() => {
        SipaTest.enableTestingMode();
        SipaComponent.destroyAll();
    });
    beforeEach(() => {
        $("playground").remove();
        $("body").append($("<playground></playground>")[0]);
    });
    describe('sipa-list items', () => {
        beforeAll(() => {
            ListComponent = class extends SipaComponent {
                constructor(data = {}, opts = {}) {
                    data.list ??= [];
                    super(data, opts);
                    this._autoinc = 0;
                }

                addItem(name = "new item") {
                    this._data.list.push(new ListItemComponent({
                        name: name,
                        id: "list_item_id_" + this._autoinc
                    }, {sipa_alias: "item_" + this._autoinc++}));
                    this.update();
                }

                static template = () => {
                    return `<list-component>List<div class="list-container" sipa-list="list"></div></list-component>`;
                }
            }

            ListItemComponent = class extends SipaComponent {
                constructor(data = {}, opts = {}) {
                    data.name ??= "default";
                    super(data, opts);
                }

                static template = () => {
                    return `<list-item-component><%= name %></list-item-component>`;
                }
            }
        });
        beforeEach(() => {
            SipaComponent.destroyAll()
        });
        it('add 3 items, remove 1 by destroy(), add 2 again', function () {
            const comp = new ListComponent();
            const match1 = `<list-component sipa-id="[0-9]+">List<div class="list-container" sipa-list="list"></div></list-component>`;
            expect(comp.html()).toMatch(match1);
            expect(comp.childrenAliases().length).toEqual(0);
            comp.addItem("item 1A");
            comp.addItem("item 2A");
            comp.addItem("item 3A");
            const match2 = `<list-component sipa-id="[0-9]+">List<div class="list-container" sipa-list="list"><list-item-component sipa-id="[0-9]+">item 1A</list-item-component><list-item-component sipa-id="[0-9]+">item 2A</list-item-component><list-item-component sipa-id="[0-9]+">item 3A</list-item-component></div></list-component>`;
            expect(comp.html()).toMatch(match2);
            expect(comp.childrenAliases().length).toEqual(3);
            comp.children().item_1.destroy();
            const match3 = `<list-component sipa-id="[0-9]+">List<div class="list-container" sipa-list="list"><list-item-component sipa-id="[0-9]+">item 1A</list-item-component><list-item-component sipa-id="[0-9]+">item 3A</list-item-component></div></list-component>`;
            expect(comp.html()).toMatch(match3);
            comp.addItem("item 4A");
            comp.addItem("item 5A");
            const match4 = `<list-component sipa-id="[0-9]+">List<div class="list-container" sipa-list="list"><list-item-component sipa-id="[0-9]+">item 1A</list-item-component><list-item-component sipa-id="[0-9]+">item 3A</list-item-component><list-item-component sipa-id="[0-9]+">item 4A</list-item-component><list-item-component sipa-id="[0-9]+">item 5A</list-item-component></div></list-component>`;
            expect(comp.html()).toMatch(match4);
            expect(comp.childrenAliases().length).toEqual(4);
        });
        it('keeps correct references of sipa-list children', function () {
            ListItemComponent = class extends SipaComponent {
                constructor(data = {}, opts = {}) {
                    data.name ??= "default";
                    data.id ??= "0";
                    super(data, opts);
                }

                static template = () => {
                    return `<list-item-component id="<%= id %>"><%= name %></list-item-component>`;
                }
            }
            const comp = new ListComponent();
            comp.addItem("item 1 R");
            comp.addItem("item 2 R");
            comp.addItem("item 3 R");
            comp.append("playground");
            expect(comp.childrenAliases().length).toEqual(3);
            expect(comp.children().item_0).toBeInstanceOf(ListItemComponent);
            expect(comp.children().item_0._data.name).toEqual("item 1 R");
            expect(ListItemComponent.byId("list_item_id_0")).toBeInstanceOf(ListItemComponent);
            expect(ListItemComponent.byId("list_item_id_0")._data.name).toEqual("item 1 R");
            expect(ListItemComponent.byId("list_item_id_0")._data.name).toEqual(comp.children().item_0._data.name);
            expect(SipaComponent._component_instances.find(c => c._data.id === "list_item_id_0")).toBeInstanceOf(ListItemComponent);
            expect(SipaComponent._component_instances.find(c => c._data.id === "list_item_id_0")._data.name).toEqual("item 1 R");
            expect(ListItemComponent.byId("list_item_id_0") === SipaComponent._component_instances.find(c => c._data.id === "list_item_id_0")).toBe(true);
            expect(comp.children().item_0 === SipaComponent._component_instances.find(c => c._data.id === "list_item_id_0")).toBe(true);
            expect(comp.children().item_0 === ListItemComponent.byId("list_item_id_0")).toBe(true);
            expect(comp.children().item_1 === SipaComponent._component_instances.find(c => c._data.id === "list_item_id_1")).toBe(true);
            expect(comp.children().item_1 === ListItemComponent.byId("list_item_id_1")).toBe(true);
        });
    });
});

//----------------------------------------------------------------------------------------------------