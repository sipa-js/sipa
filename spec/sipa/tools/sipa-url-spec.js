//----------------------------------------------------------------------------------------------------

SipaUrlSpec = {};
SipaUrlSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaUrl', () => {
    beforeEach(() => {
        SipaUrl.resetParams();
        SipaUrl.removeAnchor();
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
    describe('.getParamsOfUrl', () => {
        beforeEach(() => {
        });
        it('gets parameters from url', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({param1: "value1", param2: "value2"});
        });
        it('gets parameters from url with hash', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#hash";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({param1: "value1", param2: "value2"});
        });
        it('gets no parameters from url without parameters', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({});
        });
        it('gets no parameters from url with hash but without parameters', function () {
            const url = "https://example.com/path#hash";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({});
        });
        it('gets an empty parameter from url with parameters', function () {
            const url = "https://example.com/path?param1=&param2=value2";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({param1: "", param2: "value2"});
        });
        it('gets a parameter with special characters from url with parameters', function () {
            const url = "https://example.com/path?param1=hello%20world%21&param2=value2";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({param1: "hello world!", param2: "value2"});
        });
        it('gets a parameter with special characters from url with parameters and hash', function () {
            const url = "https://example.com/path?param1=hello%20world%21&param2=value2#hash";
            expect(SipaUrl.getParamsOfUrl(url)).toEqual({param1: "hello world!", param2: "value2"});
        });
    });
    describe('.removeParamsOfUrl', () => {
        beforeEach(() => {
        });
        it('removes all parameters from url', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1", "param2"])).toEqual("https://example.com/path");
        });
        it('removes all parameters from url with parameters and hash', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#hash";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1", "param2"])).toEqual("https://example.com/path#hash");
        });
        it('removes one parameter from url with parameters and hash', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#hash";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1"])).toEqual("https://example.com/path?param2=value2#hash");
        });
        it('removes one parameter from url with parameters', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1"])).toEqual("https://example.com/path?param2=value2");
        });
        it('removes no parameter from url with parameters', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.removeParamsOfUrl(url, [])).toEqual("https://example.com/path?param1=value1&param2=value2");
        });
        it('removes no parameter from url without parameters', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1"])).toEqual("https://example.com/path");
        });
        it('removes a parameter that is not in the url', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.removeParamsOfUrl(url, ["param3"])).toEqual("https://example.com/path?param1=value1&param2=value2");
        });
        it('removes an empty parameter from url with parameters', function () {
            const url = "https://example.com/path?param1=&param2=value2";
            expect(SipaUrl.removeParamsOfUrl(url, ["param1"])).toEqual("https://example.com/path?param2=value2");
        });
    });
    describe('.removeParams', () => {
        beforeEach(() => {
        });
        it('can remove one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            expect(SipaUrl.getParams()).toEqual({remove1: "333"});
            SipaUrl.removeParams(["remove1"]);
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can remove several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            SipaUrl.setParam('remove2', 666);
            SipaUrl.setParam('remove3', 999);
            expect(SipaUrl.getParams()).toEqual({remove1: "333", remove2: "666", remove3: "999"});
            SipaUrl.removeParams(["remove1"]);
            SipaUrl.removeParams(["remove2"]);
            expect(SipaUrl.getParams()).toEqual({remove3: "999"});
        });
        it('can remove all parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove3', 333);
            SipaUrl.setParam('remove6', 666);
            SipaUrl.setParam('remove9', 999);
            expect(SipaUrl.getParams()).toEqual({remove3: "333", remove6: "666", remove9: "999"});
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
            expect(SipaUrl.getParams()).toEqual({remove1: "333"});
            SipaUrl.removeParam("remove1");
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can remove several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove1', 333);
            SipaUrl.setParam('remove2', 666);
            SipaUrl.setParam('remove3', 999);
            expect(SipaUrl.getParams()).toEqual({remove1: "333", remove2: "666", remove3: "999"});
            SipaUrl.removeParam("remove1");
            SipaUrl.removeParam("remove2");
            expect(SipaUrl.getParams()).toEqual({remove3: "999"});
        });
        it('can remove all parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('remove3', 333);
            SipaUrl.setParam('remove6', 666);
            SipaUrl.setParam('remove9', 999);
            expect(SipaUrl.getParams()).toEqual({remove3: "333", remove6: "666", remove9: "999"});
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
            expect(SipaUrl.getParams()).toEqual({fish: "123"});
        });
    });
    describe('.setParam', () => {
        beforeEach(() => {
        });
        it('can set one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('set1', 333);
            expect(SipaUrl.getParams()).toEqual({set1: "333"});
        });
        it('can set several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('set1', 333);
            SipaUrl.setParam('set2', 666);
            SipaUrl.setParam('set3', 999);
            expect(SipaUrl.getParams()).toEqual({set1: "333", set2: "666", set3: "999"});
        });
        it('can override a parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('set1', 333);
            expect(SipaUrl.getParams()).toEqual({set1: "333"});
            SipaUrl.setParam('set1', 666);
            expect(SipaUrl.getParams()).toEqual({set1: "666"});
        });
    });
    describe('.setParams', () => {
        beforeEach(() => {
        });
        it('can set one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParams({set1: 333});
            expect(SipaUrl.getParams()).toEqual({set1: "333"});
        });
        it('can set several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParams({set1: 333, set2: 666, set3: 999});
            expect(SipaUrl.getParams()).toEqual({set1: "333", set2: "666", set3: "999"});
        });
        it('can override a parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParams({set1: 333});
            expect(SipaUrl.getParams()).toEqual({set1: "333"});
            SipaUrl.setParams({set1: 666});
            expect(SipaUrl.getParams()).toEqual({set1: "666"});
        });
        it('can override several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParams({set1: 333, set2: 666, set3: 999});
            expect(SipaUrl.getParams()).toEqual({set1: "333", set2: "666", set3: "999"});
            SipaUrl.setParams({set1: 111, set2: 222});
            expect(SipaUrl.getParams()).toEqual({set1: "111", set2: "222", set3: "999"});
        });
    });
    describe('.hasParam', () => {
        beforeEach(() => {
        });
        it('can check for one parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.hasParam('check1')).toEqual(false);
            SipaUrl.setParam('check1', 333);
            expect(SipaUrl.hasParam('check1')).toEqual(true);
        });
        it('can check for several parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.hasParam('check1')).toEqual(false);
            expect(SipaUrl.hasParam('check2')).toEqual(false);
            expect(SipaUrl.hasParam('check3')).toEqual(false);
            SipaUrl.setParam('check1', 333);
            SipaUrl.setParam('check2', 666);
            SipaUrl.setParam('check3', 999);
            expect(SipaUrl.hasParam('check1')).toEqual(true);
            expect(SipaUrl.hasParam('check2')).toEqual(true);
            expect(SipaUrl.hasParam('check3')).toEqual(true);
        });
        it('can check for a non-existing parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.hasParam('check1')).toEqual(false);
            SipaUrl.setParam('check1', 333);
            expect(SipaUrl.hasParam('check1')).toEqual(true);
            expect(SipaUrl.hasParam('check2')).toEqual(false);
        });
        it('can check for a parameter with value 0', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.hasParam('check1')).toEqual(false);
            SipaUrl.setParam('check1', 0);
            expect(SipaUrl.hasParam('check1')).toEqual(true);
        });
        it('can check for an empty parameter', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.hasParam('check1')).toEqual(false);
            SipaUrl.setParam('check1', "");
            expect(SipaUrl.hasParam('check1')).toEqual(true);
        });
    });
    describe('.resetParams', () => {
        beforeEach(() => {
            SipaUrl.resetParams();
            SipaUrl.removeParam("check1")
        });
        it('can reset all parameters', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('reset1', 333);
            SipaUrl.setParam('reset2', 666);
            SipaUrl.setParam('reset3', 999);
            expect(SipaUrl.getParams()).toEqual({reset1: "333", reset2: "666", reset3: "999"});
            SipaUrl.resetParams();
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can reset when no parameters are set', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.resetParams();
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can reset when one parameter is set', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('reset1', 333);
            expect(SipaUrl.getParams()).toEqual({reset1: "333"});
            SipaUrl.resetParams();
            expect(SipaUrl.getParams()).toEqual({});
        });
        it('can reset when parameters and anchor are set', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setParam('reset1', 333);
            SipaUrl.setParam('reset2', 666);
            SipaUrl.setParam('reset3', 999);
            SipaUrl.setAnchor("my_anchor");
            expect(SipaUrl.getParams()).toEqual({reset1: "333", reset2: "666", reset3: "999"});
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
            SipaUrl.resetParams();
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
        });
        it('can reset when only anchor is set', function () {
            expect(SipaUrl.getParams()).toEqual({});
            SipaUrl.setAnchor("my_anchor");
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
            SipaUrl.resetParams();
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
        });
    });
    describe('._getUrlWithoutParamsAndAnchor', function () {
        beforeEach(() => {
        });
        it('gets a url with query params', function () {
            const url = "https://example.com/path?param=value";
            expect(SipaUrl._getUrlWithoutParamsAndAnchor(url)).toEqual("https://example.com/path");
        });
        it('gets a url without query params', function () {
            const url = "https://example.com/path";
            expect(SipaUrl._getUrlWithoutParamsAndAnchor(url)).toEqual("https://example.com/path");
        });
        it('gets a url with anchor and query params', function () {
            const url = "https://example.com/path?param=value#hash";
            expect(SipaUrl._getUrlWithoutParamsAndAnchor(url)).toEqual("https://example.com/path");
        });
        it('gets a url with anchor but without query params', function () {
            const url = "https://example.com/path#hash";
            expect(SipaUrl._getUrlWithoutParamsAndAnchor(url)).toEqual("https://example.com/path");
        });
    });
    describe('.getAnchor / .setAnchor / .removeAnchor', () => {
        it('has no anchor by default', function () {
            expect(SipaUrl.getAnchor()).toEqual(undefined);
        });
        it('can set and remove an anchor', function () {
            SipaUrl.setAnchor("my_anchor");
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
            SipaUrl.removeAnchor();
            expect(SipaUrl.getAnchor()).toEqual(undefined);
        });
        it('can set an empty anchor', function () {
            SipaUrl.setAnchor("");
            expect(SipaUrl.getAnchor()).toEqual("");
            expect(SipaUrl.getUrl().getLast()).toEqual("#");
            SipaUrl.removeAnchor();
            expect(SipaUrl.getAnchor()).toEqual(undefined);
        });
    });
    describe('.getUrl with parameters and anchor', () => {
        it('can get url with parameters and anchor', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.getAnchor()).toEqual(undefined);
            SipaUrl.setParam('set1', 333);
            SipaUrl.setParam('set2', 666);
            SipaUrl.setParam('set3', 999);
            SipaUrl.setAnchor("my_anchor");
            expect(SipaUrl.getParams()).toEqual({set1: "333", set2: "666", set3: "999"});
            expect(SipaUrl.getAnchor()).toEqual("my_anchor");
            let url = SipaUrl.getUrl();
            expect(url).toContain("?set1=333&set2=666&set3=999#my_anchor");
        });
        it('can get url with parameters and no anchor', function () {
            expect(SipaUrl.getParams()).toEqual({});
            expect(SipaUrl.getAnchor()).toEqual(undefined);
            SipaUrl.setParam('set1', 333);
            SipaUrl.setParam('set2', 666);
            SipaUrl.setParam('set3', 999);
            expect(SipaUrl.getParams()).toEqual({set1: "333", set2: "666", set3: "999"});
            expect(SipaUrl.getAnchor()).toEqual(undefined);
            let url = SipaUrl.getUrl();
            expect(url).toContain("?set1=333&set2=666&set3=999");
            expect(url).not.toContain("#");
        });
    });
    describe('.setAnchorOfUrl', () => {
        it('can set anchor of url with parameters and anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setAnchorOfUrl(url, "new_anchor")).toEqual("https://example.com/path?param1=value1&param2=value2#new_anchor");
        });
        it('can set anchor of url with parameters but without anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.setAnchorOfUrl(url, "new_anchor")).toEqual("https://example.com/path?param1=value1&param2=value2#new_anchor");
        });
        it('can set empty anchor of url with parameters and anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setAnchorOfUrl(url, "")).toEqual("https://example.com/path?param1=value1&param2=value2#");
        });
        it('can set empty anchor of url with parameters but without anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.setAnchorOfUrl(url, "")).toEqual("https://example.com/path?param1=value1&param2=value2#");
        });
        it('can set anchor of url without parameters but with anchor', function () {
            const url = "https://example.com/path#old_anchor";
            expect(SipaUrl.setAnchorOfUrl(url, "new_anchor")).toEqual("https://example.com/path#new_anchor");
        });
        it('can set anchor of url without parameters and without anchor', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.setAnchorOfUrl(url, "new_anchor")).toEqual("https://example.com/path#new_anchor");
        });
        it('can set empty anchor of url without parameters but with anchor', function () {
            const url = "https://example.com/path#old_anchor";
            expect(SipaUrl.setAnchorOfUrl(url, "")).toEqual("https://example.com/path#");
        });
        it('can set empty anchor of url without parameters and without anchor', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.setAnchorOfUrl(url, "")).toEqual("https://example.com/path#");
        });
        it('can set anchor of empty url', function () {
            const url = "";
            expect(SipaUrl.setAnchorOfUrl(url, "new_anchor")).toEqual("#new_anchor");
        });
    });
    describe('.getHostnameOfUrl', () => {
        it('can get hostname of url with parameters and anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url with parameters but without anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url without parameters but with anchor', function () {
            const url = "https://example.com/path#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url without parameters and without anchor', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url without protocol', function () {
            const url = "example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url with subdomain', function () {
            const url = "https://sub.example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("sub.example.com");
        });
        it('can get hostname of url with port', function () {
            const url = "https://example.com:8080/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("example.com");
        });
        it('can get hostname of url with ip address', function () {
            const url = "https://127.0.0.1/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("127.0.0.1");
        });
        it('can get hostname of url with ip address and port', function () {
            const url = "https://127.0.0.1/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("127.0.0.1");
        });
        it('can get hostname of url with localhost', function () {
            const url = "http://localhost/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("localhost");
        });
        it('can get hostname of url with localhost and port', function () {
            const url = "http://localhost:3000/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("localhost");
        });
        it('can get hostname of invalid url', function () {
            const url = "ht!tp://exa mple.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("");
            const url2 = "://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url2)).toEqual("");
        });
        it('can repair some invalid URLs automatically', function () {
            const url4 = "http:/example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url4)).toEqual("example.com");
            const url3 = "//example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url3)).toEqual("example.com");
            const url5 = "http//:example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.getHostNameOfUrl(url5)).toEqual("example.com");
        });
        it('can get hostname of empty url', function () {
            const url = "";
            expect(SipaUrl.getHostNameOfUrl(url)).toEqual("");
        });
    });
    describe('.setHostnameOfUrl', () => {
        it('can set hostname of url with parameters and anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with parameters but without anchor', function () {
            const url = "https://example.com/path?param1=value1&param2=value2";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path?param1=value1&param2=value2");
        });
        it('can set hostname of url without parameters but with anchor', function () {
            const url = "https://example.com/path#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path#old_anchor");
        });
        it('can set hostname of url without parameters and without anchor', function () {
            const url = "https://example.com/path";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path");
        });
        it('can set hostname of url without protocol', function () {
            const url = "example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with subdomain', function () {
            const url = "https://sub.example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with port', function () {
            const url = "https://example.com:8080/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com:8080/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with ip address', function () {
            const url = "https://127.0.0.1/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with ip address and port', function () {
            const url = "https://127.0.0.1:8080/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("https://new-example.com:8080/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with localhost', function () {
            const url = "http://localhost/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("http://new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of url with localhost and port', function () {
            const url = "http://localhost:3000/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("http://new-example.com:3000/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of repairable url', function () {
            const url = "http:/example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("http://new-example.com/path?param1=value1&param2=value2#old_anchor");
            const url2 = "//example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url2, "new-example.com")).toEqual("//new-example.com/path?param1=value1&param2=value2#old_anchor");
            const url3 = "http//:example.com/path?param1=value1&param2=value2#old_anchor";
            expect(SipaUrl.setHostNameOfUrl(url3, "new-example.com")).toEqual("http//:new-example.com/path?param1=value1&param2=value2#old_anchor");
        });
        it('can set hostname of empty url', function () {
            const url = "";
            expect(SipaUrl.setHostNameOfUrl(url, "new-example.com")).toEqual("new-example.com");
        });
        it('can set empty hostname', function () {
            const url = "https://example.com/path?param1=value1&param2=value2#old_anchor";
            expect(() => {
                SipaUrl.setHostNameOfUrl(url, "");
            }).toThrow("Given hostname is not valid: ''");
        });
        it('can set empty hostname of empty url', function () {
            expect(() => {
                expect(SipaUrl.setHostNameOfUrl("", ""))
            }).toThrow("Given hostname is not valid: ''");
        });
    });
});

//----------------------------------------------------------------------------------------------------