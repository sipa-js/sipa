//----------------------------------------------------------------------------------------------------

SipaComponentSlotsInstanceSpec = {};
SipaComponentSlotsInstanceSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SlotComponent extends SipaComponent {
}
class SlotNestComponent extends SipaComponent {
}

SipaComponent.registerComponent(SlotComponent);
SipaComponent.registerComponent(SlotNestComponent);


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
            SlotNestComponent = class extends SipaComponent {
                static template = () => {
                    return `<slot-nest-component>Nested<slot name="header"></slot><slot></slot><slot name="foobar"></slot></slot-nest-component>`;
                }
            }
        });
        it('can fill named slots', function () {
            const comp = new SlotComponent({},{
                content: `Banana<div slot="header">Header</div>`
            });
            expect(comp.html()).toMatch(`<slot-component sipa-id="[0-9]+">Spaghetti<div slot="header">Header</div>Banana</slot-component>`);
        });
        it('can nest components in slots', function () {
            SlotComponent = class extends SipaComponent {
                static template = () => {
                    return `<slot-component>Parentus<slot name="header"></slot><slot></slot><slot name="footer"></slot>Pinguin</slot-component>`;
                }
            }
            const comp = new SlotComponent({},{
                content: `TopLevel<div slot="header"><slot-nest-component sipa-alias="nestos"><slot>Boratza</slot></slot-nest-component></div>`
            });
            // first init
            expect(comp.html()).toMatch(`<slot-component sipa-id="[0-9]+">Parentus<div slot="header"><slot-nest-component sipa-id="[0-9]+">NestedBoratza</slot-nest-component></div>TopLevelPinguin</slot-component>`);
            // second init (caching working?)
            expect(comp.html()).toMatch(`<slot-component sipa-id="[0-9]+">Parentus<div slot="header"><slot-nest-component sipa-id="[0-9]+">NestedBoratza</slot-nest-component></div>TopLevelPinguin</slot-component>`);
        });
    });
});

//----------------------------------------------------------------------------------------------------