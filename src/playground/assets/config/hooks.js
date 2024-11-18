SipaHooks.beforeInitPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be initialized
    alert("init page");
    SipaComponent.init();
});

SipaHooks.beforeShowPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be initialized
    alert("show page");
    SipaComponent.init();
});

SipaHooks.beforeDestroyPage('on', () => {
    // put some custom stuff here that is execute on
    // every page before it will be destroyed
    alert("destroy page");
});

SipaHooks.beforeInitLayout('on', () => {
    // put some custom stuff here that is execute on
    // every layout before it will be initialized
    alert("init layout");
});

SipaHooks.beforeDestroyLayout('on', () => {
    // put some custom stuff here that is execute on
    // every layout before it will be destroyed
    alert("destroy layout");
});