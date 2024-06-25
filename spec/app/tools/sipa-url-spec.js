//----------------------------------------------------------------------------------------------------

SipaUrlSpecSpec = {};
SipaUrlSpecSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaUrl', () => {
    beforeEach(() => {
        SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
    });
    describe('.getUrl', () => {
        beforeEach(() => {
        });
        it('is a string and not empty', function () {
            expect(Typifier.isString(SipaUrl.getUrl())).toEqual(true);
            expect(SipaUrl.getUrl().length >= 1).toEqual(true);
        });
        it('starts with http://', function () {
            expect(SipaUrl.getUrl().startsWith("http://")).toEqual(true);
        });
    });
    describe('.getProtocol', () => {
        beforeEach(() => {
        });
        it('is a string and not empty', function () {
            expect(Typifier.isString(SipaUrl.getProtocol())).toEqual(true);
            expect(SipaUrl.getProtocol().length >= 1).toEqual(true);
        });
        it('starts with http', function () {
            expect(SipaUrl.getProtocol().startsWith("http")).toEqual(true);
        });
    });
    describe('.getHostname', () => {
        beforeEach(() => {
        });
        it('is a string and not empty', function () {
            expect(Typifier.isString(SipaUrl.getHostName())).toEqual(true);
            expect(SipaUrl.getHostName().length >= 1).toEqual(true);
        });
    });
    describe('.removeParams', () => {
        beforeEach(() => {
        });
        it('can remove one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            expect(SipaUrl.getParams()).toEqual({ remove1: "333" });
            SipaUrl.removeParams(["remove1"]);
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can remove several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            SipaUrl.setParam('remove2', 666);
            SipaUrl.setParam('remove3', 999);
            expect(SipaUrl.getParams()).toEqual({ remove1: "333", remove2: "666", remove3: "999" });
            SipaUrl.removeParams(["remove1"]);
            SipaUrl.removeParams(["remove2"]);
            expect(SipaUrl.getParams()).toEqual({ remove3: "999"});
        });
        it('can remove all parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove3', 333);
            SipaUrl.setParam('remove6', 666);
            SipaUrl.setParam('remove9', 999);
            expect(SipaUrl.getParams()).toEqual({ remove3: "333", remove6: "666", remove9: "999" });
            SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
            expect(SipaUrl.getParams()).toEqual({});
        });
    });
    describe('.removeParam', () => {
        beforeEach(() => {
        });
        it('can remove one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            expect(SipaUrl.getParams()).toEqual({ remove1: "333" });
            SipaUrl.removeParam("remove1");
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can remove several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            SipaUrl.setParam('remove2', 666);
            SipaUrl.setParam('remove3', 999);
            expect(SipaUrl.getParams()).toEqual({ remove1: "333", remove2: "666", remove3: "999" });
            SipaUrl.removeParam("remove1");
            SipaUrl.removeParam("remove2");
            expect(SipaUrl.getParams()).toEqual({ remove3: "999"});
        });
        it('can remove all parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove3', 333);
            SipaUrl.setParam('remove6', 666);
            SipaUrl.setParam('remove9', 999);
            expect(SipaUrl.getParams()).toEqual({ remove3: "333", remove6: "666", remove9: "999" });
            SipaUrl.getParams().eachWithIndex((key, value) => {
               SipaUrl.removeParam(key);
            });
            expect(SipaUrl.getParams()).toEqual({});
        });
    });
    describe('.getParams', () => {
        beforeEach(() => {
        });
        it('has no parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('has one parameter', function () {
            SipaUrl.setParam('fish', 123);
            expect(SipaUrl.getParams()).toEqual({ fish: "123" });
        });
    });
});

//----------------------------------------------------------------------------------------------------