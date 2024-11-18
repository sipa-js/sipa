
SipaPage.setConfig({
    /* default layout for all pages */
    default_layout: 'default',
    /* specific layouts for some pages { <page-name>: <layout-name> } */
    default_layouts: {
       /* @example overwrites the layout for the page 'login-page' with layout 'mini-dialog' */
       // 'login-page': 'mini-dialog'
    },
    /* keep URL anchor when loading other page */
    keep_anchor: false,
    /* keep query params when loading other page */
    keep_params: true,
    /* use jQuery cache: true/false.

       when disabled, jQuery will add a underscore parameter ?_=<number> on
       page and layout requests, to avoid browser caching
     */
    cache_page_layout_requests: false,
});