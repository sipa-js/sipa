//----------------------------------------------------------------------------------------------------

SipaComponentParentSpec = {};
SipaComponentParentSpec.options = {};

//----------------------------------------------------------------------------------------------------

class TopParentComponent extends SipaComponent {
    static template() {
        return `
            <top-parent-component>
                TOP
                <child-one-component sipa-alias="child_1"></child-one-component>
            </top-parent-component>
            `;
    }
}

SipaComponent.registerComponent(TopParentComponent);

class ChildOneComponent extends SipaComponent {
    static template() {
        return `
            <child-one-component>
                CHILD ONE
                <child-two-component sipa-alias="child_2"></child-two-component>
            </child-one-component>
            `;
    }
}

SipaComponent.registerComponent(ChildOneComponent);

class ChildTwoComponent extends SipaComponent {
    static template() {
        return `
            <child-two-component>
                CHILD TWO
                <child-three-component sipa-alias="child_3"></child-three-component>
            </child-two-component>
            `;
    }
}

SipaComponent.registerComponent(ChildTwoComponent);

class ChildThreeComponent extends SipaComponent {
    static template() {
        return `
            <child-three-component>
                CHILD THREE
            </child-three-component>
            `;
    }
}

SipaComponent.registerComponent(ChildThreeComponent);

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeAll(() => {
        SipaComponent.destroyAll();
    });
    describe('children references', () => {
        beforeAll(() => {
            SipaTest.enableTestingMode();
        });
        it('contains one children at each level after .initTemplate()', function () {
            const top = new TopParentComponent();
            top.initTemplate();
            expect(Object.keys(top.children()).length).toBe(1);
            expect(Object.keys(top.children())[0]).toBe("child_1");
            expect(Object.keys(top.children().child_1.children()).length).toBe(1);
            expect(Object.keys(top.children().child_1.children())[0]).toBe("child_2");
            expect(Object.keys(top.children().child_1.children().child_2.children()).length).toBe(1);
            expect(Object.keys(top.children().child_1.children().child_2.children())[0]).toBe("child_3");
        });
        it('contains one children at each level after append() to DOM', function () {
            const top = new TopParentComponent();
            top.append("playground");
            expect(Object.keys(top.children()).length).toBe(1);
            expect(Object.keys(top.children())[0]).toBe("child_1");
            expect(Object.keys(top.children().child_1.children()).length).toBe(1);
            expect(Object.keys(top.children().child_1.children())[0]).toBe("child_2");
            expect(Object.keys(top.children().child_1.children().child_2.children()).length).toBe(1);
            expect(Object.keys(top.children().child_1.children().child_2.children())[0]).toBe("child_3");
        });
    });
    describe('.parentTop()', () => {
        beforeAll(() => {
            SipaTest.enableTestingMode();
        });
        beforeEach(() => {
            $("playground").remove();
            $("body").append($("<playground></playground>")[0]);
        });
        it('returns parent top from child one', function () {
            const top = new TopParentComponent();
            top.initTemplate();
            top.append("playground");
            expect(top.children().child_1.parentTop()).toBe(top)
        });
        it('returns parent top from child two', function () {
            const top = new TopParentComponent();
            top.append("playground");
            expect(top.children().child_1.children().child_2.parentTop()).toBe(top)
        });
        it('returns parent top from child three', function () {
            const top = new TopParentComponent();
            top.append("playground");
            expect(top.children().child_1.children().child_2.children().child_3.parentTop()).toBe(top)
        });
    });
});

//----------------------------------------------------------------------------------------------------