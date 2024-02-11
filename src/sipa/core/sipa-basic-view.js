/**
 * Basic class for pages and layouts
 */
class SipaBasicView {
    static onInit() {
        // called when page has been loaded, before fade animation
    }

    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    static reinit() {
        this.onDestroy();
        this.onInit();
    }

    /**
     * Check if the current view is loaded
     *
     * @example
     * // ImprintPage is loaded
     * LoginPage.isLoaded();
     * // => false
     *
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        if(self.type() === 'page') {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentPageId())).endsWith(self.className());
        } else {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentLayoutId())).endsWith(self.className());
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
     * @returns {'page'|'layout'}
     */
    static type() {
        const self = SipaBasicView;
        if(self.className().endsWith('Page')) {
            return 'page';
        } else {
            return 'layout';
        }
    }
}