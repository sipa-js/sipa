//----------------------------------------------------------------------------------------------------

SipaComponentShowHideSpec = {};
SipaComponentShowHideSpec.options = {};

//----------------------------------------------------------------------------------------------------

class ShowHideComponent extends SipaComponent {
    static template = () => {
        return `<show-hide-component>Some content to show!</show-hide-component>`;
    }
}

//----------------------------------------------------------------------------------------------------

describe('SipaComponent', () => {
    beforeEach(() => {

    });
    describe('hide and show', () => {
        beforeEach(() => {
            $("playground").remove();
            $("body").append($("<playground></playground>")[0]);
        });
        it('can hide and show a component (programmatically)', function () {
            const comp = new ShowHideComponent();
            const match_init = `<show-hide-component sipa-id="[0-9]+">Some content to show!</show-hide-component>`;
            const match_hidden = `<show-hide-component sipa-id="[0-9]+" style="display: none;">Some content to show!</show-hide-component>`;
            // first init
            expect(comp.html()).toMatch(match_init);
            expect(comp.html()).toMatch(match_init); // caching
            expect(comp.node().outerHTML).toMatch(match_init);
            // hide
            comp.hide();
            expect(comp.html()).toMatch(match_hidden);
            expect(comp.html()).toMatch(match_hidden); // caching
            expect(comp.node().outerHTML).toMatch(match_hidden);
            // show again
            comp.show();
            expect(comp.html()).toMatch(match_init);
            expect(comp.html()).toMatch(match_init); // caching
            expect(comp.node().outerHTML).toMatch(match_init);
        });
        it('can hide and show a component (declarative)', function () {
            document.querySelector("playground").appendChild($(`<show-hide-component></show-hide-component>`)[0]);
            ShowHideComponent.init();
            const comp = ShowHideComponent.all().getLast();
            comp._meta.sipa._render_period = 0; // disable as we render more than one time in period
            const match_init = `<show-hide-component sipa-id="[0-9]+">Some content to show!</show-hide-component>`;
            const match_hidden = `<show-hide-component sipa-id="[0-9]+" style="display: none;">Some content to show!</show-hide-component>`;
            let html = document.querySelector("show-hide-component").outerHTML;
            // first init
            expect(html).toMatch(match_init);
            comp.update();
            html = document.querySelector("show-hide-component").outerHTML;
            expect(html).toMatch(match_init); // caching
            // hide
            comp.hide();
            html = document.querySelector("show-hide-component").outerHTML;
            expect(html).toMatch(match_hidden);
            comp.update();
            html = document.querySelector("show-hide-component").outerHTML;
            expect(html).toMatch(match_hidden); // caching
            // show again
            comp.show();
            html = document.querySelector("show-hide-component").outerHTML;
            expect(html).toMatch(match_init);
            comp.update();
            html = document.querySelector("show-hide-component").outerHTML;
            expect(html).toMatch(match_init); // caching
        });
    });
});

//----------------------------------------------------------------------------------------------------