//----------------------------------------------------------------------------------------------------

SipaComponentSlotsDeclarativeSpec = {};
SipaComponentSlotsDeclarativeSpec.options = {};

//----------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('slots by declaration', () => {
        var slot_component;
        beforeAll(() => {
            SlotComponent.template = () => {
                return `<slot-component>Spaghetti<slot name="header"></slot><slot></slot><slot name="footer"></slot></slot-component>`;
            };
        });
        it('can fill named slots', function () {
            document.querySelector("body").append($(`<slot-component>Banana<div slot="header">Header</div></slot-component>`)[0]);
            SlotComponent.init();
            expect(document.querySelector("slot-component").outerHTML).toMatch(`<slot-component sipa-id="[0-9]">Spaghetti<div slot="header">Header</div>Banana</slot-component>`);
        });
    });
});

//----------------------------------------------------------------------------------------------------