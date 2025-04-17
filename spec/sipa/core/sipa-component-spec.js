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
        it('get SipaComponent by SipaComponent.bySipaId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SipaComponent.bySipaId(compo._meta.sipa.id)).toEqual(compo);
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
        it('do not get SipaComponent by SpecChildComponent.bySipaId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SpecChildComponent.bySipaId(compo._meta.sipa.id)).toEqual(undefined);
        });
        it('do not get SipaComponent by SpecChildComponent.bySipaId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SpecChildComponent.bySipaId(compo._meta.sipa.id)).toEqual(undefined);
        });
    });
    describe('.byId', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="by-id"></div></playground>`)[0]);
        });
        it('get SipaComponent by SipaComponent.byId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-1-test");
            expect(SipaComponent.byId("by-id-1-test")).toEqual(compo);
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
        it('do not get SipaComponent by SpecChildComponent.byId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-4-test");
            expect(SpecChildComponent.byId("by-id-4-test")).toEqual(undefined);
        });
        it('do not get SipaComponent by SpecOneComponent.byId', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            compo.element().setAttribute("id", "by-id-5-test");
            expect(SpecOneComponent.byId("by-id-5-test")).toEqual(undefined);
        });
    });
    describe('.instanceOfElement', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="instance-of-element"></div></playground>`)[0]);
        });
        it('get SipaComponent instance by SipaComponent', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SipaComponent.instanceOfElement(compo.element())).toBeInstanceOf(SipaComponent);
        });
        it('get SpecOneComponent instance by SipaComponent', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SipaComponent.instanceOfElement(compo.element())).toBeInstanceOf(SpecOneComponent);
        });
        it('get SpecOneComponent instance by SpecOneComponent', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SpecOneComponent.instanceOfElement(compo.element())).toBeInstanceOf(SpecOneComponent);
        });
        it('get SpecChildComponent instance by SipaComponent', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(SipaComponent.instanceOfElement(compo.element())).toBeInstanceOf(SpecChildComponent);
        });
        it('get SpecChildComponent instance by SpecChildComponent', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(SpecChildComponent.instanceOfElement(compo.element())).toBeInstanceOf(SpecChildComponent);
        });
        it('do not get SpecOneComponent instance by SpecChildComponent', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(SpecChildComponent.instanceOfElement(compo.element())).toBeUndefined();
        });
        it('do not get SpecChildComponent instance by SpecOneComponent', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(SpecOneComponent.instanceOfElement(compo.element())).toBeUndefined();
        });
        it('do not get SipaComponent instance by SpecChildComponent', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SpecChildComponent.instanceOfElement(compo.element())).toBeUndefined();
        });
        it('do not get SipaComponent instance by SpecOneComponent', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(SpecOneComponent.instanceOfElement(compo.element())).toBeUndefined();
        });
    });
    describe('instance', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground><div class="instance"></div></playground>`)[0]);
        });
        it('get SipaComponent', function () {
            const compo = new SipaComponent();
            compo.append("playground");
            expect(instance(compo.element())).toBeInstanceOf(SipaComponent);
        });
        it('get SpecOneComponent', function () {
            const compo = new SpecOneComponent();
            compo.append("playground");
            expect(instance(compo.element())).toBeInstanceOf(SpecOneComponent);
        });
        it('get SpecChildComponent', function () {
            const compo = new SpecChildComponent();
            compo.append("playground");
            expect(instance(compo.element())).toBeInstanceOf(SpecChildComponent);
        });
    });
    describe('.destroy / .isDestroyed / .destroyAll', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
            SipaComponent.destroyAll();
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
        it('destroy instances and list is empty after', function () {
            expect(SipaComponent._component_instances.length).toEqual(0);
            const c1 = new SpecChildComponent();
            expect(SipaComponent._component_instances.length).toEqual(1);
            const c2 = new SpecChildComponent();
            expect(SipaComponent._component_instances.length).toEqual(2);
            const c3 = new SpecChildComponent();
            expect(SipaComponent._component_instances.length).toEqual(3);
            expect(SipaComponent._component_instances.includes(c1)).toEqual(true);
            expect(SipaComponent._component_instances.includes(c2)).toEqual(true);
            expect(SipaComponent._component_instances.includes(c3)).toEqual(true);
            c1.destroy();
            expect(SipaComponent._component_instances.includes(c1)).toEqual(false);
            expect(SipaComponent._component_instances.length).toEqual(2);
            c2.destroy();
            expect(SipaComponent._component_instances.includes(c2)).toEqual(false);
            expect(SipaComponent._component_instances.length).toEqual(1);
            c3.destroy();
            expect(SipaComponent._component_instances.includes(c3)).toEqual(false);
            expect(SipaComponent._component_instances.length).toEqual(0);
        });
        it('destroys all instances at once and list is cleaned', function () {
            expect(SipaComponent._component_instances.length).toEqual(0);
            const c1 = new SpecChildComponent();
            const c2 = new SpecChildComponent();
            const c3 = new SpecChildComponent();
            const c4 = new SpecOneComponent();
            const c5 = new SpecOneComponent();
            expect(SipaComponent._component_instances.length).toEqual(5);
            SpecOneComponent.destroyAll();
            expect(SipaComponent._component_instances.length).toEqual(3);
            SpecChildComponent.destroyAll();
            expect(SipaComponent._component_instances.length).toEqual(0);
            const c6 = new SpecChildComponent();
            const c7 = new SpecOneComponent();
            const c8 = new SpecOneComponent();
            expect(SipaComponent._component_instances.length).toEqual(3);
            SipaComponent.destroyAll();
            expect(SipaComponent._component_instances.length).toEqual(0);
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
        it('"can handle numbers that are smaller than big integers', function () {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
            $("playground").append($(`<spec-child-component attr-id="bigint1" name="123456789012345"></spec-child-component>`)[0])
            SpecChildComponent.init();
            expect(SpecChildComponent.byId("bigint1").element().textContent).toEqual("123456789012345");
        });
        it('"can handle numbers that are big integers', function () {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
            $("playground").append($(`<spec-child-component attr-id="bigint1" name="12345678901234567890"></spec-child-component>`)[0])
            SpecChildComponent.init();
            expect(SpecChildComponent.byId("bigint1").element().textContent).toEqual("12345678901234567890");
        });
        it('"can handle numbers that are negative big integers', function () {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
            $("playground").append($(`<spec-child-component attr-id="bigint1" name="-12345678901234567890"></spec-child-component>`)[0])
            SpecChildComponent.init();
            expect(SpecChildComponent.byId("bigint1").element().textContent).toEqual("-12345678901234567890");
        });
        it('"can handle numbers that are invalid big integers', function () {
            $("playground").remove();
            $("body").append($(`<playground></playground>`)[0]);
            $("playground").append($(`<spec-child-component attr-id="bigint1" name="'12345678901234567890a'"></spec-child-component>`)[0])
            SpecChildComponent.init();
            expect(SpecChildComponent.byId("bigint1").element().textContent).toEqual("12345678901234567890a");
        });
    });
});

//----------------------------------------------------------------------------------------------------