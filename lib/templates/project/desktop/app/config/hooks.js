SipaHooks.beforeInitPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be initialized
    SipaComponent.init();
});

SipaHooks.beforeShowPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be initialized
    SipaComponent.init();
});

SipaHooks.beforeDestroyPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be destroyed
});

SipaHooks.beforeInitLayout('on', () => {
    // put some custom stuff here that is execute on
    // every layout before it will be initialized
});

SipaHooks.beforeDestroyLayout('on', () => {
    // put some custom stuff here that is execute on
    // every layout before it will be destroyed
    SipaComponent.destroyAll();
});