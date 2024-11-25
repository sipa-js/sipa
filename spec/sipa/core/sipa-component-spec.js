//----------------------------------------------------------------------------------------------------

SipaComponentSpec = {};
SipaComponentSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SpecChildComponent extends SipaComponent {
}

SipaComponent.registerComponent(SpecChildComponent);

class SpecOneComponent extends SipaComponent {
}

SipaComponent.registerComponent(SpecOneComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {
        SpecOneComponent = class extends SipaComponent {
            static template = () => {
                return `<spec-one-component><spec-child-component sipa-alias="mychild" name="'Franz'"></spec-child-component></spec-one-component>`;
            }
        }

        SpecChildComponent = class extends SipaComponent {
            constructor(data, options) {
                data ??= {};
                data.name ??= "Default";
                data.family ??= "Chuck";
                super(data, options);
            }

            static template = () => {
                return `<spec-child-component><%= name %></spec-child-component>`;
            }
        }
        // rename from _ABC_ to SpecChildComponent again
        //Object.defineProperty(SpecChildComponent, "name", {value: "SpecChildComponent", enumerable: false});
    });
    describe('.initTemplate', () => {
        beforeEach(() => {
        });
        it('has a template with nested children', function () {
            const compo = new SpecOneComponent();
            expect(compo.children()).toEqual({});
            expect(compo._data.mychild).toEqual(undefined);
            compo.initTemplate();
            expect(Object.keys(compo.children())).toEqual(["mychild"]);
            expect(compo._data?.mychild?.name).toEqual("Franz");
        });
        it('has no alias for its children', function () {
            SpecOneComponent = class extends SipaComponent {
                static template = () => {
                    return `<spec-one-component><spec-child-component name="'Franz'"></spec-child-component></spec-one-component>`;
                }
            }
            expect(() => { (new SpecOneComponent()).initTemplate()}).toThrowError(SipaComponent.MissingSipaAliasError);
        });
        it('has duplicate alias for its children', function () {
            SpecOneComponent = class extends SipaComponent {
                static template = () => {
                    return `<spec-one-component><spec-child-component sipa-alias="lol"></spec-child-component><spec-child-component sipa-alias="lol"></spec-child-component></spec-one-component>`;
                }
            }
            expect(() => { (new SpecOneComponent()).initTemplate()}).toThrowError(SipaComponent.DuplicateSipaAliasError);
        });
    });
    describe('.html', () => {
        beforeEach(() => {
        });
        it('has a rendered html template with nested children', function () {
            const compo = new SpecOneComponent();
            expect(compo.html()).toMatch(`<spec-one-component sipa-id="[0-9]+"><spec-child-component sipa-id="[0-9]+">Franz<\\/spec-child-component><\\/spec-one-component>`);
        });
    });
    describe('.node', () => {
        beforeEach(() => {
        });
        it('has a rendered node template with nested children', function () {
            const compo = new SpecOneComponent();
            expect(compo.node().outerHTML).toMatch(`<spec-one-component sipa-id="[0-9]+"><spec-child-component sipa-id="[0-9]+">Franz<\\/spec-child-component><\\/spec-one-component>`);
        });
    });
    describe('.append', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="first"></div></playground>`)[0]);
        });
        it('appends after the other children', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            const html = document.querySelector("playground").outerHTML;
            expect(html).toMatch(`<playground><div class="first"></div><spec-one-component sipa-id="[0-9]+"><spec-child-component sipa-id="[0-9]+">Franz</spec-child-component></spec-one-component></playground>`);
        });
    });
    describe('.prepend', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="last"></div></playground>`)[0]);
        });
        it('prepends after the other children', function () {
            const compo = new SpecOneComponent();
            compo.prepend("playground");
            const html = document.querySelector("playground").outerHTML;
            expect(html).toMatch(`<playground><spec-one-component sipa-id="[0-9]+"><spec-child-component sipa-id="[0-9]+">Franz</spec-child-component></spec-one-component><div class="last"></div></playground>`);
        });
    });
    describe('.replaceWith', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="replacer"></div></playground>`)[0]);
        });
        it('prepends after the other children', function () {
            const compo = new SpecOneComponent();
            compo.replaceWith(".replacer");
            const html = document.querySelector("playground").outerHTML;
            expect(html).toMatch(`<playground><spec-one-component sipa-id="[0-9]+"><spec-child-component sipa-id="[0-9]+">Franz</spec-child-component></spec-one-component></playground>`);
        });
    });
    describe('.alias', () => {
        beforeEach(() => {
        });
        it('has no alias for the parent component', function () {
            const compo = new SpecOneComponent();
            expect(compo.alias()).toEqual(undefined);
        });
        it('has an alias for the child component', function () {
            const compo = new SpecOneComponent();
            compo.initTemplate();
            const child = compo.childrenValues().getFirst();
            expect(compo.childrenAliases()).toContain("mychild");
            expect(child.alias()).toEqual("mychild");
        });
    });
    describe('.cloneData', () => {
        beforeEach(() => {
        });
        it('cloned data is same as original data', function () {
            const compo = new SpecChildComponent();
            expect(compo.cloneData()).toEqual(compo._data);
        });
        it('cloned data is not referenced to original data', function () {
            const compo = new SpecChildComponent();
            const clone = compo.cloneData();
            const copy = compo._data;
            expect(compo._data.name).toEqual(clone.name);
            expect(compo._data.family).toEqual(clone.family);
            compo._data.name = "New";
            compo._data.family = "Other";
            // cloned copy is not changed
            expect(compo._data.name).not.toEqual(clone.name);
            expect(compo._data.family).not.toEqual(clone.family);
            // reference copy is changed as well
            expect(compo._data.name).toEqual(copy.name);
            expect(compo._data.family).toEqual(copy.family);
        });
    });
    describe('.resetToData', () => {
        beforeEach(() => {
        });
        it('reset data is not referenced to original data', function () {
            const compo = new SpecChildComponent();
            const new_data = {
                name: "Namos",
                family: "Familios",
            };
            const original_data = compo._data;
            compo.resetToData(new_data);
            expect(compo._data).toEqual(new_data);
            compo._data.name = "Shame";
            expect(compo._data).not.toEqual(new_data);
            expect(compo._data.name).not.toEqual(original_data.name);
        });
    });
    describe('.value', () => {
        beforeEach(() => {
        });
        it('get inherited value', function () {
            const compo = new SpecChildComponent();
            expect(parseInt(compo.node().getAttribute("sipa-id"),10)).toEqual(compo._meta.sipa.id);
        });
        it('get overwritten value', function () {
            class OverwrittenValueComponent extends SipaComponent {
                value() {
                    return this._meta.sipa.id*2;
                }
            }
            const compo = new OverwrittenValueComponent();
            expect(parseInt(compo.node().getAttribute("sipa-id"),10)*2).toEqual(compo.value());
        });
    });
    describe('.element / .remove', () => {
        beforeEach(() => {
        });
        it('get not existing element', function () {
            const compo = new SpecChildComponent();
            expect(compo.element()).toEqual(undefined);
        });
        it('get existing element and remove it', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(compo.element().outerHTML).toEqual(compo.node().outerHTML);
            compo.remove();
            expect(compo.element()).toEqual(undefined);
        });
    });
    describe('.elements / .remove', () => {
        beforeEach(() => {
        });
        it('get no existing elements', function () {
            const compo = new SpecChildComponent();
            expect(compo.elements()).toEqual([]);
        });
        it('get existing elements and remove them', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(compo.elements().length).toEqual(1);
            compo.append("playground");
            compo.append("playground");
            expect(compo.elements().length).toEqual(3);
            expect(compo.elements()[2].outerHTML).toEqual(compo.node().outerHTML);
            const sipa_id = compo._meta.sipa.id;
            expect(compo.elements().map(e => parseInt(e.getAttribute("sipa-id")))).toEqual([sipa_id, sipa_id, sipa_id]);
            compo.remove();
            expect(compo.elements().length).toEqual(0);
        });
    });
    describe('.selector', () => {
        beforeEach(() => {
        });
        it('get no existing elements', function () {
            const compo = new SpecChildComponent();
            expect(document.querySelector(compo.selector())).toEqual(null);
        });
        it('get existing elements and remove them', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(document.querySelectorAll(compo.selector()).length).toEqual(1);
            compo.append("playground");
            compo.append("playground");
            expect(document.querySelectorAll(compo.selector()).length).toEqual(3);
            expect(document.querySelectorAll(compo.selector())[2].outerHTML).toEqual(compo.node().outerHTML);
            const sipa_id = compo._meta.sipa.id;
            expect([...document.querySelectorAll(compo.selector())].map(e => parseInt(e.getAttribute("sipa-id")))).toEqual([sipa_id, sipa_id, sipa_id]);
            compo.remove();
            expect(document.querySelectorAll(compo.selector()).length).toEqual(0);
        });
    });
    describe('.bySipaId', () => {
        beforeEach(() => {
        });
        it('get SpecOneComponent by SipaComponent.bySipaId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SipaComponent.bySipaId(compo._meta.sipa.id)).toEqual(compo);
        });
        it('get SpecOneComponent by SpecOneComponent.bySipaId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SpecOneComponent.bySipaId(compo._meta.sipa.id)).toEqual(compo);
        });
        it('do not get SpecOneComponent by SpecChildComponent.bySipaId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SpecChildComponent.bySipaId(compo._meta.sipa.id)).toEqual(undefined);
        });
    });
    describe('.byId', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="by-id"></div></playground>`)[0]);
        });
        it('get SpecOneComponent by SipaComponent.byId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-1-test");
            expect(SipaComponent.byId("by-id-1-test")).toEqual(compo);
        });
        it('get SpecOneComponent by SpecOneComponent.byId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-2-test");
            expect(SpecOneComponent.byId("by-id-2-test")).toEqual(compo);
        });
        it('do not get SpecOneComponent by SpecChildComponent.byId', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-3-test");
            expect(SpecChildComponent.byId("by-id-3-test")).toEqual(undefined);
        });
    });
    describe('.destroy / .isDestroyed', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
        });
        it('destroys not appended element', function () {
            const compo = new SpecChildComponent();
            const selector = compo.selector();
            expect(compo.isDestroyed()).toEqual(false);
            compo.destroy();
            expect(compo.isDestroyed()).toEqual(true);
            expect(document.querySelectorAll(selector).length).toEqual(0);
            expect(() => { compo.selector() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.append("playground")() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.prepend("playground")() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.replaceWith("playground")() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.update() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.element() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.node() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.html() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.hide() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.show() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.addClass("suppe") }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.removeClass("suppe") }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.isVisible() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
        });
        it('destroys appended element', function () {
            const compo = new SpecChildComponent();
            const selector = compo.selector();
            compo.append("playground");
            expect(document.querySelectorAll(selector).length).toEqual(1);
            expect(compo.isDestroyed()).toEqual(false);
            compo.destroy();
            expect(compo.isDestroyed()).toEqual(true);
            expect(document.querySelectorAll(selector).length).toEqual(0);
            expect(() => { compo.append("playground")() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.update() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
            expect(() => { compo.element() }).toThrowError(SipaComponent.InstanceAlreadyDestroyedError);
        });
    });
    describe('events', () => {
        beforeEach(() => {
        });
        it('"before_update" event', function () {
            const compo = new SpecOneComponent();
            let before_val = null;
            const fun = (component, data, options) => {
                data ??= {};
                data.mychild ??= {};
                data.mychild.family = "Speculatius";
                before_val = component._data.attr;
            }
            compo.initTemplate();
            expect(compo.cloneData().mychild.family).toEqual("Chuck");
            compo.events().subscribe("before_update", fun);
            compo.update({ attr: true });
            expect(before_val).toEqual(undefined);
            compo.update({ attr: false });
            expect(before_val).toEqual(true);
            expect(compo.cloneData().mychild.family).toEqual("Speculatius");
            expect(compo.cloneData().attr).toEqual(false);
        });
        it('"after_update" event', function () {
            const compo = new SpecOneComponent();
            let after_val = null;
            const fun = (component, data, options) => {
                data ??= {};
                data.mychild ??= {};
                data.mychild.family = "Bruno";
                after_val = component._data.attr;
            }
            compo.initTemplate();
            expect(compo.cloneData().mychild.family).toEqual("Chuck");
            compo.events().subscribe("after_update", fun);
            expect(after_val).toEqual(null);
            compo.update({ attr: true });
            expect(after_val).toEqual(true);
            // data is not used or assigned on after_update
            expect(compo.cloneData().mychild.family).toEqual("Chuck");
        });
        it('"before_destroy" event', function () {
            const compo = new SpecOneComponent({ object: { some: "sama" } });
            let before_family_val = null;
            let before_object_val = null;
            let before_data_val = null;
            let before_data_ref = null;
            const fun = (component, data, options) => {
                before_family_val = component._data.mychild.family;
                before_object_val = component._data.object;
                before_data_val = component.cloneData();
                before_data_ref = component._data;
            }
            compo.initTemplate();
            expect(compo.cloneData().mychild.family).toEqual("Chuck");
            compo.events().subscribe("before_destroy", fun);
            compo.update({ some_data: "DATA" });
            expect(before_family_val).toEqual(null);
            compo.destroy();
            expect(before_family_val).toEqual("Chuck");
            expect(before_object_val).toEqual({ some: "sama"});
            expect(before_data_val).toEqual({ object: { some: "sama"}, mychild: { family: "Chuck", name: "Franz" }, some_data: "DATA" });
            // child reference not existing anymore, as they have been destroyed
            expect(before_data_ref).toEqual({ object: { some: "sama"}, some_data: "DATA" });
            expect(compo._data).toEqual(undefined);
        });
        it('"after_destroy" event', function () {
            const compo = new SpecOneComponent({ object: { some: "sama" } });
            let before_family_val = null;
            let before_object_val = null;
            let before_data_val = null;
            let before_data_ref = null;
            const fun = (component, data, options) => {
                before_family_val = component._data?.mychild?.family;
                before_object_val = component._data?.object;
                before_data_val = component.cloneData();
                before_data_ref = component._data;
            }
            compo.initTemplate();
            expect(compo.cloneData().mychild.family).toEqual("Chuck");
            compo.events().subscribe("after_destroy", fun);
            compo.update({ some_data: "DATA" });
            expect(before_family_val).toEqual(null);
            compo.destroy();
            expect(before_family_val).toEqual(undefined);
            expect(before_object_val).toEqual(undefined);
            expect(before_data_val).toEqual(undefined);
            expect(before_data_ref).toEqual(undefined);
            expect(compo._data).toEqual(undefined);
        });
    });
});

//----------------------------------------------------------------------------------------------------