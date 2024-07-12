//----------------------------------------------------------------------------------------------------

SipaComponentSlotsInstanceSpec = {};
SipaComponentSlotsInstanceSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SlotComponent extends SipaComponent {
}

SipaComponent.registerComponent(SlotComponent);


//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('slots by instance', () => {
        var slot_component;
        beforeAll(() => {
            SlotComponent = class extends SipaComponent {
                static template = () => {
                    return `<slot-component>Spaghetti<slot name="header"></slot><slot></slot><slot name="footer"></slot></slot-component>`;
                }
            }
        });
        it('can fill named slots', function () {
            const comp = new SlotComponent({},{
                content: `Banana<div slot="header">Header</div>`
            });
            expect(comp.html()).toMatch(`<slot-component sipa-id="[0-9]">Spaghetti<div slot="header">Header</div>Banana</slot-component>`);
        });
    });
});

//----------------------------------------------------------------------------------------------------