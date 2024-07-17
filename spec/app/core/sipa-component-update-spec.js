//----------------------------------------------------------------------------------------------------

SipaComponentUpdateSpec = {};
SipaComponentUpdateSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SlotUnoComponent extends SipaComponent {
    static template = () => {
        return `<slot-uno-component>Unostarto<slot></slot>Uno<%= name %><slot-tres-component sipa-alias="treso"></slot-tres-component>Unoendo</slot-uno-component>`;
    }
}
SipaComponent.registerComponent(SlotUnoComponent);
class SlotDosComponent extends SipaComponent {

    constructor(data, options) {
        data ??= {};
        data.name ??= "Dosos"
        super(data, options);
    }
    static template = () => {
        return `<slot-dos-component><%= name %></slot-dos-component>`;
    }
}
SipaComponent.registerComponent(SlotDosComponent);
class SlotTresComponent extends SipaComponent {

    constructor(data, options) {
        data ??= {};
        data.name ??= "Tresos"
        super(data, options);
    }
    static template = () => {
        return `<slot-tres-component><%= name %><slot-cuatro-component sipa-alias="cuatroso">Nothing</slot-cuatro-component></slot-tres-component>`;
    }
}
SipaComponent.registerComponent(SlotTresComponent);
class SlotCuatroComponent extends SipaComponent {

    constructor(data, options) {
        data ??= {};
        data.name ??= "Cuasros"
        super(data, options);
    }
    static template = () => {
        return `<slot-cuatro-component><%= name %></slot-cuatro-component>`;
    }
}
SipaComponent.registerComponent(SlotCuatroComponent);


//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('update by instance', () => {
        var slot_component;
        beforeAll(() => {
        });
        it('can update nested children and slots by parent top component', function () {
            const comp = new SlotUnoComponent({ name: "Unosos" },{
                content: `Birne<slot-dos-component sipa-alias="doso"></slot-dos-component>`
            });
            const first_match = `<slot-uno-component sipa-id="[0-9]+">UnostartoBirne<slot-dos-component sipa-id="[0-9]+">Dosos</slot-dos-component>UnoUnosos<slot-tres-component sipa-id="[0-9]+">Tresos<slot-cuatro-component sipa-id="[0-9]+">Cuasros</slot-cuatro-component></slot-tres-component>Unoendo</slot-uno-component>`;
            expect(comp.html()).toMatch(first_match);
            expect(comp.html()).toMatch(first_match); // check cache
            comp.update({name: "Unostara"});
            const second_match = `<slot-uno-component sipa-id="[0-9]+">UnostartoBirne<slot-dos-component sipa-id="[0-9]+">Dosos</slot-dos-component>UnoUnostara<slot-tres-component sipa-id="[0-9]+">Tresos<slot-cuatro-component sipa-id="[0-9]+">Cuasros</slot-cuatro-component></slot-tres-component>Unoendo</slot-uno-component>`;
            expect(comp.html()).toMatch(second_match);
            comp.update({name: "Barbara", treso: { name: "Tretos", cuatroso: { name: "Cuatros" } }, doso: { name: "Dotos" } });
            const third_match = `<slot-uno-component sipa-id="[0-9]+">UnostartoBirne<slot-dos-component sipa-id="[0-9]+">Dotos</slot-dos-component>UnoBarbara<slot-tres-component sipa-id="[0-9]+">Tretos<slot-cuatro-component sipa-id="[0-9]+">Cuatros</slot-cuatro-component></slot-tres-component>Unoendo</slot-uno-component>`;
            expect(comp.html()).toMatch(third_match);
        });
    });
});

//----------------------------------------------------------------------------------------------------