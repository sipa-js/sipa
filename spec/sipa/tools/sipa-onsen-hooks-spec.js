//----------------------------------------------------------------------------------------------------

SipaOnsenHooksSpec = {};
SipaOnsenHooksSpec.options = {};

SipaOnsenHooksSpec.layout = null;


//----------------------------------------------------------------------------------------------------

describe('SipaOnsenHooks', () => {
    beforeEach(() => {
        //$('<iframe>').attr('src', "web/index.html").appendTo("body");
        SipaOnsenHooksSpec = {};
        SipaOnsenHooksSpec.order ||= [];
        SipaOnsenPage.setConfig({
            /* default layout for all pages */
            default_layout: 'mobile',
            history_trees: [
            ],
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
        SipaOnsenPage.reset();
        SipaOnsenHooks.reset();
        SipaOnsenHooks.beforeInitLayout("on", () => {
            SipaOnsenHooksSpec.init_layout = "init_layout";
            SipaOnsenHooksSpec.order.push("init_layout");
        });
        SipaOnsenHooks.beforeDestroyLayout("on", () => {
            SipaOnsenHooksSpec.destroy_layout = "destroy_layout";
            SipaOnsenHooksSpec.order.push("destroy_layout");
        });
        SipaOnsenHooks.beforeInitPage("on", () => {
            SipaOnsenHooksSpec.init_page = "init_page";
            SipaOnsenHooksSpec.order.push("init_page");
        });
        SipaOnsenHooks.beforeShowPage("on", () => {
            SipaOnsenHooksSpec.show_page = "show_page";
            SipaOnsenHooksSpec.order.push("show_page");
        });
        SipaOnsenHooks.beforeDestroyPage("on", () => {
            SipaOnsenHooksSpec.destroy_page = "destroy_page";
            SipaOnsenHooksSpec.order.push("destroy_page");
        });
    });
    describe('Layout', () => {
        beforeEach(() => {
        });
        it('no layout destroy happens on first page load', function (done) {
            expect(SipaOnsenHooksSpec.destroy_layout).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenPage.currentPageId()).toEqual("mobile-test");
                expect(SipaOnsenHooksSpec.destroy_layout).toEqual(undefined);
                done();
            }, 444);
        });
        it('check layout init after first page load', function (done) {
            expect(SipaOnsenHooksSpec.init_layout).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenPage.currentPageId()).toEqual("mobile-test");
                expect(SipaOnsenHooksSpec.init_layout).toEqual("init_layout");
                done();
            }, 222);
        });
        it('layout destroy happens never after loading second page load', function (done) {
            expect(SipaOnsenHooksSpec.destroy_layout).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                SipaOnsenPage.load("mobile-sample");
                setTimeout(() => {
                    expect(SipaOnsenPage.currentPageId()).toEqual("mobile-sample");
                    expect(SipaOnsenHooksSpec.destroy_layout).toEqual(undefined);
                    done();
                }, 222);
            }, 222);
        });
    });
    describe('Page', () => {
        beforeEach(() => {
        });
        it('check page init after first page load', function (done) {
            expect(SipaOnsenHooksSpec.init_page).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenPage.currentPageId()).toEqual("mobile-test");
                expect(SipaOnsenHooksSpec.init_page).toEqual("init_page");
                done();
            }, 3000);
        });
        it('no page destroy happens on first page load', function (done) {
            expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenPage.currentPageId()).toEqual("mobile-test");
                expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
                done();
            }, 300);
        });
        it('page destroy happens not after loading second page load', function (done) {
            expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
                SipaOnsenPage.load("mobile-sample");
                setTimeout(() => {
                    expect(SipaOnsenPage.currentPageId()).toEqual("mobile-sample");
                    expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
                    done();
                }, 222);
            }, 222);
        });
        it('page destroy happens after loading second page load with reset', function (done) {
            expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenHooksSpec.destroy_page).toEqual(undefined);
                SipaOnsenPage.load("mobile-sample", { reset: true });
                setTimeout(() => {
                    expect(SipaOnsenPage.currentPageId()).toEqual("mobile-sample");
                    expect(SipaOnsenHooksSpec.destroy_page).toEqual("destroy_page");
                    done();
                }, 222);
            }, 222);
        });
    });
    describe('HookOrder', () => {
        beforeEach(() => {
        });
        it('checks order of hook events', function (done) {
            SipaOnsenHooksSpec.order = [];
            SipaOnsenPage.load("mobile-test");
            setTimeout(() => {
                expect(SipaOnsenPage.currentPageId()).toEqual("mobile-test");
                expect(SipaOnsenHooksSpec.order).toEqual(["init_layout","init_page","show_page"]);
                SipaOnsenHooksSpec.order = [];
                SipaOnsenPage.load("mobile-sample");
                setTimeout(() => {
                    expect(SipaOnsenPage.currentPageId()).toEqual("mobile-sample");
                    expect(SipaOnsenHooksSpec.order).toEqual(["init_page","show_page"]);
                    SipaOnsenHooksSpec.order = [];
                    SipaOnsenPage.popPage();
                    setTimeout(() => {
                        expect(SipaOnsenHooksSpec.order).toEqual(["destroy_page","show_page"]);
                        done();
                    }, 444);
                }, 444);
            }, 444);
        });
    });
});

//----------------------------------------------------------------------------------------------------