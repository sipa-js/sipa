class HomePage extends SipaBasicView {
    static onInit() {
        const self = HomePage;
        self.initTreeComponent();
    }

    static onShow() {
        // called when page is visible to the user, after the init() and optional fade animation has completed
    }

    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    static initTreeComponent() {
        const component = new TreeComponent();
        component.prepend("body");
    }
}