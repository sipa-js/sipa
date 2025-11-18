
SipaOnsenPage.setConfig({
    /* default layout for all pages */
    default_layout: 'default',
    /* optional history trees, to define what parent sides should be loaded, if you enter a sub page by a link, so you can navigate backwards */
    history_trees: [
        ['home','settings'],
    ],
    /* keep URL anchor when loading other page */
    keep_anchor: false,
    /* keep query params when loading other page */
    keep_params: true,
    /* use jQuery cache: true/false.

       when disabled, jQuery will add a underscore parameter ?_=<number> on
       page and layout requests, to avoid browser caching
     */
    cache_page_layout_requests: false,
    /*
        Preserve <link> and <script> children tags of body on layout loading
        Useful when you inject scripts or stylesheets on the body dynamically
    */
    preserve_script_link_tags: true,
});