//----------------------------------------------------------------------------------------------------

SipaComponentClassesSpec = {};
SipaComponentClassesSpec.options = {};

//----------------------------------------------------------------------------------------------------

class ClassesComponent extends SipaComponent {
    static template = () => {
        return `<classes-component>Some content inside!</classes-component>`;
    }
}

class ClassesCombinedComponent {

}

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('using classes', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($("<playground></playground>")[0]);
        });
        it('can declare, remove and add classes in the template (programatically) by option', function () {
            const comp = new ClassesComponent(undefined, { sipa_classes: "template-class" });
            const match = `<classes-component sipa-id="[0-9]+" class="template-class">Some content inside!</classes-component>`;
            const match_removed = `<classes-component sipa-id="[0-9]+">Some content inside!</classes-component>`;
            // first init
            expect(comp.html()).toMatch(match);
            expect(comp.html()).toMatch(match); // caching
            expect(comp.node().outerHTML).toMatch(match);
            // hide
            comp.removeClass("template-class");
            expect(comp.html()).toMatch(match_removed);
            expect(comp.html()).toMatch(match_removed); // caching
            expect(comp.node().outerHTML).toMatch(match_removed);
            // show again
            comp.addClass("template-class");
            expect(comp.html()).toMatch(match);
            expect(comp.html()).toMatch(match); // caching
            expect(comp.node().outerHTML).toMatch(match);
        });
        it('can declare, remove and add classes in the template (programatically) by template', function () {
            class ClassesTemplateComponent extends SipaComponent {
                static template = () => {
                    return `<classes-template-component class="tempora-class">Some content inside!</classes-template-component>`;
                }
            }
            const comp = new ClassesTemplateComponent();
            const match = `<classes-template-component sipa-id="[0-9]+" class="tempora-class">Some content inside!</classes-template-component>`;
            const match_removed = `<classes-template-component sipa-id="[0-9]+">Some content inside!</classes-template-component>`;
            // first init
            expect(comp.html()).toMatch(match);
            expect(comp.html()).toMatch(match); // caching
            expect(comp.node().outerHTML).toMatch(match);
            // hide
            comp.removeClass("tempora-class");
            expect(comp.html()).toMatch(match_removed);
            expect(comp.html()).toMatch(match_removed); // caching
            expect(comp.node().outerHTML).toMatch(match_removed);
            // show again
            comp.addClass("tempora-class");
            expect(comp.html()).toMatch(match);
            expect(comp.html()).toMatch(match); // caching
            expect(comp.node().outerHTML).toMatch(match);
        });
        it('can declare classes in the template (declarative) by class attribute', function () {
            document.querySelector("playground").appendChild($(`<classes-component attr-class="class-class"></classes-component>`)[0]);
            ClassesComponent.init();
            const comp = ClassesComponent.all().getLast();
            comp._meta.sipa._render_period = 0; // disable as we render more than one time in period
            const match = `<classes-component sipa-id="[0-9]+" class="class-class">Some content inside!</classes-component>`;
            const match_removed = `<classes-component sipa-id="[0-9]+">Some content inside!</classes-component>`;
            let html = document.querySelector("classes-component").outerHTML;
            // first init
            expect(html).toMatch(match);
            // hide
            comp.removeClass("class-class");
            html = document.querySelector("classes-component").outerHTML;
            expect(html).toMatch(match_removed);
            comp.update();
            html = document.querySelector("classes-component").outerHTML;
            expect(html).toMatch(match_removed); // caching
            // show again
            comp.addClass("class-class");
            html = document.querySelector("classes-component").outerHTML;
            expect(html).toMatch(match);
            comp.update();
            html = document.querySelector("classes-component").outerHTML;
            expect(html).toMatch(match); // caching
        });
        it('can declare classes in the template (declarative) and programatically by class attribute', function () {
            ClassesCombinedComponent = class extends SipaComponent {
                static template = () => {
                    return `<classes-combined-component class="temp-combined-class">Some content inside!</classes-combined-component>`;
                }
            }
            document.querySelector("playground").appendChild($(`<classes-combined-component attr-class="attribute-class"></classes-combined-component>`)[0]);
            ClassesCombinedComponent.init();
            const comp = ClassesCombinedComponent.all().getLast();
            comp._meta.sipa._render_period = 0; // disable as we render more than one time in period
            const match = `<classes-combined-component sipa-id="[0-9]+" class="temp-combined-class attribute-class">Some content inside!</classes-combined-component>`;
            const match_one_removed = `<classes-combined-component sipa-id="[0-9]+" class="attribute-class">Some content inside!</classes-combined-component>`;
            const match_both_removed = `<classes-combined-component sipa-id="[0-9]+">Some content inside!</classes-combined-component>`;
            let html = document.querySelector("classes-combined-component").outerHTML;
            // first init
            expect(html).toMatch(match);
            // remove
            comp.removeClass("temp-combined-class");
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_one_removed);
            comp.update();
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_one_removed); // caching
            // remove again
            comp.removeClass("attribute-class");
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_both_removed);
            comp.update();
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_both_removed); // caching
        });
        it('can declare classes in the template (declarative) and programatically by class attribute 2', function () {
            ClassesCombinedComponent = class extends SipaComponent {
                static template = () => {
                    return `<classes-combined-component class="temp-combined-class">Some content inside!</classes-combined-component>`;
                }
            }
            document.querySelector("playground").appendChild($(`<classes-combined-component attr-class="attribute-class"></classes-combined-component>`)[0]);
            ClassesCombinedComponent.init();
            const comp = ClassesCombinedComponent.all().getLast();
            comp._meta.sipa._render_period = 0; // disable as we render more than one time in period
            const match = `<classes-combined-component sipa-id="[0-9]+" class="temp-combined-class attribute-class">Some content inside!</classes-combined-component>`;
            const match_one_removed = `<classes-combined-component sipa-id="[0-9]+" class="temp-combined-class">Some content inside!</classes-combined-component>`;
            const match_both_removed = `<classes-combined-component sipa-id="[0-9]+">Some content inside!</classes-combined-component>`;
            let html = document.querySelector("classes-combined-component").outerHTML;
            // first init
            expect(html).toMatch(match);
            // remove
            comp.removeClass("attribute-class");
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_one_removed);
            comp.update();
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_one_removed); // caching
            // remove again
            comp.removeClass("temp-combined-class");
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_both_removed);
            comp.update();
            html = document.querySelector("classes-combined-component").outerHTML;
            expect(html).toMatch(match_both_removed); // caching
        });
    });
});

//----------------------------------------------------------------------------------------------------