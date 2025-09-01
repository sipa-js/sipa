/**
 * Basic class for pages and layouts
 */
class SipaBasicView {
    /**
     * Called when the view is initialized
     *
     * @example
     *
     * class MyPage extends SipaBasicView {
     *   static onInit() {
     *     console.log("MyPage initialized");
     *   }
     * }
     *
     * SipaPage.load('my-page');
     * // => "MyPage initialized"
     *
     */
    static onInit() {
        // called when page has been loaded, before fade animation
    }

    /**
     * Called when the view is destroyed, when leaving the page.
     *
     * @example
     *
     * class MyPage extends SipaBasicView {
     *   static onDestroy() {
     *     console.log("MyPage destroyed");
     *   }
     * }
     *
     * SipaPage.load('my-page');
     * // => "MyPage initialized"
     * SipaPage.load('another-page');
     * // => "MyPage destroyed"
     *
     */
    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    /**
     * Shortcut to reinitialize the view (calls onDestroy and onInit)
     */
    static reinit() {
        this.onDestroy();
        this.onInit();
    }

    /**
     * Check if the current view is loaded
     *
     * @example
     * // Given ImprintPage is loaded
     * LoginPage.isLoaded();
     * // => false
     *
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        const navigator = SipaPage.isInitialized() ? SipaPage : SipaOnsenPage.isInitialized() ? SipaOnsenPage : false;
        if(navigator === false) {
            throw `SipaPage.setConfig or SipaOnsenPage.setConfig was not executed before application start.`;
        }
        // no page loaded at all
        if(!navigator.currentPageId()) {
            return false;
        } else if(this.type() === 'page') {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentPageId().replace(/\//g,'-'))) + 'Page').endsWith(this.className() );
        } else {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentLayoutId().replace(/\//g,'-'))) + 'Layout').endsWith(this.className());
        }
    }

    /**
     * Get the class name of the current view
     *
     * @example
     * class MyPage extends SipaBasicView {
     * }
     *
     * const a = MyPage;
     * a.className()
     * // => 'MyPage'
     *
     * @returns {string}
     */
    static className() {
        return this.name;
    }

    /**
     * Get the type of the current view
     *
     * @example
     * class MyLayout extends SipaBasicView {
     * }
     *
     * MyLayout.type()
     * // => 'layout'
     *
     * @example
     * class MyPage extends SipaBasicView {
     * }
     *
     * MyPage.type()
     * // => 'page'
     *
     * @returns {'page'|'layout'}
     */
    static type() {
        const self = SipaBasicView;
        if(this.className().endsWith('Page')) {
            return 'page';
        } else {
            return 'layout';
        }
    }
}