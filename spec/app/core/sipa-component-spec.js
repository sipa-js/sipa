//----------------------------------------------------------------------------------------------------

SipaComponentSpec = {};
SipaComponentSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SpecChildComponent extends SipaComponent {
}

SipaComponent.registerComponent(SpecChildComponent);

class SpecOneComponent extends SipaComponent {

    static template = () => {
        return `<spec-one-component><spec-child-component sipa-alias="mychild" name="'Franz'"></spec-child-component></spec-one-component>`;
    }
}

SipaComponent.registerComponent(SpecOneComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {
        SpecChildComponent = class extends SipaComponent {
            constructor(data, options) {
                data ??= {};
                data.name ??= "Default";
                data.family ??= "Chuck";
                super(data, options);
            }

            dance() {
                console.log("DANCE");
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
    });
    describe('.html', () => {
        beforeEach(() => {
        });
        it('has a rendered html template with nested children', function () {
            const compo = new SpecOneComponent();
            expect(compo.html()).toMatch(`<spec-one-component sipa-id="[0-9]"><spec-child-component sipa-id="[0-9]">Franz<\\/spec-child-component><\\/spec-one-component>`);
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