//----------------------------------------------------------------------------------------------------

SipaComponentSlotsInstanceSpec = {};
SipaComponentSlotsInstanceSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SlotComponent extends SipaComponent {
}
class SlotNestComponent extends SipaComponent {
}
class SlotSuperNestComponent extends SipaComponent {
}

SipaComponent.registerComponent(SlotComponent);
SipaComponent.registerComponent(SlotNestComponent);
SipaComponent.registerComponent(SlotSuperNestComponent);


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
            const match = `<slot-component sipa-id="[0-9]+">Parentus<div slot="header"><slot-nest-component sipa-id="[0-9]+">NestedBoratza</slot-nest-component></div>TopLevelPinguin</slot-component>`;
            // first init
            expect(comp.html()).toMatch(match);
            // second init (check if caching is working properly)
            expect(comp.html()).toMatch(match);
        });
        it('can nest components in slots twice', function () {
            class SlotOneComponent extends SipaComponent {
                static template = () => {
                    return `<slot-one-component><slot></slot>Slot</slot-one-component>`;
                }
            }
            class SlotTwoComponent extends SipaComponent {
                static template = () => {
                    return `<slot-two-component><slot></slot>Nest</slot-two-component>`;
                }
            }
            class SlotThreeComponent extends SipaComponent {
                static template = () => {
                    return `<slot-three-component><slot></slot>Super</slot-three-component>`;
                }
            }
            const comp = new SlotOneComponent({},{
                content: `First<slot-two-component sipa-alias="nest">Second<slot-three-component sipa-alias="super">Third</slot-three-component></slot-two-component></div>`
            });
            // first init
            const match = `<slot-one-component sipa-id="[0-9]+">First<slot-two-component sipa-id="[0-9]+">Second<slot-three-component sipa-id="[0-9]+">ThirdSuper</slot-three-component>Nest</slot-two-component>Slot</slot-one-component>`;
            expect(comp.html()).toMatch(match);
            // second init (check if caching is working properly)
            expect(comp.html()).toMatch(match);
        });
    });
});

//----------------------------------------------------------------------------------------------------