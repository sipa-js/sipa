//----------------------------------------------------------------------------------------------------

SipaHooksSpec = {};
SipaHooksSpec.options = {};

SipaHooksSpec.layout = null;


//----------------------------------------------------------------------------------------------------

describe('SipaHooks', () => {
    beforeEach(() => {
        SipaHooksSpec = {};
        SipaHooksSpec.order ||= [];
        SipaPage.setConfig({
            /* default layout for all pages */
            default_layout: 'default',
            /* specific layouts for some pages { <page-name>: <layout-name> } */
            default_layouts: {
                /* @example overwrites the layout for the page 'login-page' with layout 'mini-dialog' */
                // 'login-page': 'mini-dialog'
            },
            /* keep URL anchor when loading other page */
            keep_anchor: true,
            /* keep query params when loading other page */
            keep_params: true,
            /* use jQuery cache: true/false.

               when disabled, jQuery will add a underscore parameter ?_=<number> on
               page and layout requests, to avoid browser caching
             */
            cache_page_layout_requests: false,
            preserve_script_link_tags: true,
        });
        SipaPage.reset();
        SipaHooks.reset();
        SipaHooks.beforeInitLayout("on", () => {
            SipaHooksSpec.init_layout = "init_layout";
            SipaHooksSpec.order.push("init_layout");
        });
        SipaHooks.beforeDestroyLayout("on", () => {
            SipaHooksSpec.destroy_layout = "destroy_layout";
            SipaHooksSpec.order.push("destroy_layout");
        });
        SipaHooks.beforeInitPage("on", () => {
            SipaHooksSpec.init_page = "init_page";
            SipaHooksSpec.order.push("init_page");
        });
        SipaHooks.beforeShowPage("on", () => {
            SipaHooksSpec.show_page = "show_page";
            SipaHooksSpec.order.push("show_page");
        });
        SipaHooks.beforeDestroyPage("on", () => {
            SipaHooksSpec.destroy_page = "destroy_page";
            SipaHooksSpec.order.push("destroy_page");
        });
    });
    describe('Layout', () => {
        beforeEach(() => {
        });
        it('no layout destroy happens on first page load', function (done) {
            expect(SipaHooksSpec.destroy_layout).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("test");
                expect(SipaHooksSpec.destroy_layout).toEqual(undefined);
                done();
            }, 222);
        });
        it('check layout init after first page load', function (done) {
            expect(SipaHooksSpec.init_layout).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("test");
                expect(SipaHooksSpec.init_layout).toEqual("init_layout");
                done();
            }, 222);
        });
        it('layout destroy happened after loading second page load', function (done) {
            expect(SipaHooksSpec.destroy_layout).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                SipaPage.load("sample");
                setTimeout(() => {
                    expect(SipaPage.currentPageId()).toEqual("sample");
                    expect(SipaHooksSpec.destroy_layout).toEqual("destroy_layout");
                    done();
                }, 222);
            }, 222);
        });
    });
    describe('Page', () => {
        beforeEach(() => {
        });
        it('check page init after first page load', function (done) {
            expect(SipaHooksSpec.init_page).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("test");
                expect(SipaHooksSpec.init_page).toEqual("init_page");
                done();
            }, 3000);
        });
        it('no page destroy happens on first page load', function (done) {
            expect(SipaHooksSpec.destroy_page).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("test");
                expect(SipaHooksSpec.destroy_page).toEqual(undefined);
                done();
            }, 300);
        });
        it('page destroy happened after loading second page load', function (done) {
            expect(SipaHooksSpec.destroy_page).toEqual(undefined);
            SipaPage.load("test");
            setTimeout(() => {
                SipaPage.load("sample");
            });
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("sample");
                expect(SipaHooksSpec.destroy_page).toEqual("destroy_page");
                done();
            }, 600);
        });
    });
    describe('HookOrder', () => {
        beforeEach(() => {
        });
        it('checks order of hook events', function (done) {
            SipaHooksSpec.order = [];
            SipaPage.load("test");
            setTimeout(() => {
                expect(SipaPage.currentPageId()).toEqual("test");
                expect(SipaHooksSpec.order).toEqual(["init_layout","init_page","show_page"]);
                SipaHooksSpec.order = [];
                SipaPage.load("sample");
                setTimeout(() => {
                    expect(SipaPage.currentPageId()).toEqual("sample");
                    expect(SipaHooksSpec.order).toEqual(["destroy_page","destroy_layout","init_layout","init_page","show_page"]);
                    done();
                }, 444);
            }, 444);
        });
    });
});

//----------------------------------------------------------------------------------------------------