//----------------------------------------------------------------------------------------------------

SipaComponentSpecSpec = {};
SipaComponentSpecSpec.options = {};

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
            expect(compo.data().mychild.family).toEqual("Chuck");
            compo.events().subscribe("before_update", fun);
            compo.update({ attr: true });
            expect(before_val).toEqual(undefined);
            compo.update({ attr: false });
            expect(before_val).toEqual(true);
            expect(compo.data().mychild.family).toEqual("Speculatius");
            expect(compo.data().attr).toEqual(false);
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
            expect(compo.data().mychild.family).toEqual("Chuck");
            compo.events().subscribe("after_update", fun);
            expect(after_val).toEqual(null);
            compo.update({ attr: true });
            expect(after_val).toEqual(true);
            // data is not used or assigned on after_update
            expect(compo.data().mychild.family).toEqual("Chuck");
        });
    });
});

//----------------------------------------------------------------------------------------------------