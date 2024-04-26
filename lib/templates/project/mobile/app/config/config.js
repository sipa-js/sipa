
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
});