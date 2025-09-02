/**
 * SipaUrl
 *
 * Tool class to access and manipulate
 * the current or given URLs
 */
class SipaUrl {
    /**
     * Get the current URL of the address bar
     *
     * @example
     *
     * SipaUrl.getUrl();
     * // => https://my-website.com/web/?page=abc&param=ok
     *
     * @returns {string}
     */
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the protocol of the current url (without colon)
     *
     * @example
     *
     * // URL: https://my-business.com/some-param
     * SipaUrl.getProtocol();
     * // => 'https'
     *
     * // URL: http://my-insecure-business.com/other-param
     * SipaUrl.getProtocol();
     * // => 'http'
     *
     * @returns {'http'|'https'}
     */
    static getProtocol() {
        return window.location.protocol.replace(':', '');
    }

    /**
     * Get the host name of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'my-business.com'
     *
     * // URL https://www.my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'www.my-business.com'
     *
     * // URL: https://subdomain.my-business.com/some-param
     * SipaUrl.getHostName();
     * // => 'subdomain.my-business.com'
     *
     * // URL: http://localhost:7000/other-param
     * SipaUrl.getHostName();
     * // => 'localhost'
     *
     * // URL: http://127.0.0.1/foo
     * SipaUrl.getHostName();
     * // => '127.0.0.1'
     *
     * // URL: http://localhost/foo
     * SipaUrl.getHostName();
     * // => 'localhost'
     *
     * @returns {string}
     */
    static getHostName() {
        return window.location.hostname;
    }

    /**
     * Get all params of the current URL.
     *
     * @example
     *
     * // URL: https://my-business.com/?one=1&stat=true
     * SipaUrl.getParams();
     * // => { "one": "1", "stat": "true" }
     *
     * @returns {Object<string, string>}
     */
    static getParams() {
        const self = SipaUrl;
        return self.getParamsOfUrl(self.getUrl());
    }

    /**
     * Set or overwrite given parameters of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?one=1&stat=true&that=cool
     * SipaUrl.setParams({ "more": "better", "stat": "false"});
     * // URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     */
    static setParams(params) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: params, param_name: 'params', expected_type: 'Object'}]);
        const new_url = self.setParamsOfUrl(self.getUrl(), params);
        self._setUrl(new_url);
    }

    /**
     * Set or overwrite one specific parameter of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?super=banana&coca=cola
     * SipaUrl.setParam("pepsi","coke");
     * // URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
     *
     * @param {string} param_key
     * @param {string} value
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
    }

    /**
     * Remove given params of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar&more=power
     * SipaUrl.removeParams(["some","more"]);
     * // URL: https://my-business.com/?foo=bar
     *
     * @param {Array<String>} param_keys
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self._setUrl(new_url);
    }

    /**
     * Remove given param of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.removeParam("foo");
     * // URL: https://my-business.com/?some=stuff
     *
     * @param {string} param_key
     */
    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        self.removeParams([param_key]);
    }

    /**
     * Remove all params of the current url.
     * If there is no parameter, nothing happens.
     * If there is an anchor, it will be preserved.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.resetParams();
     * // URL: https://my-business.com/#my-anchor
     *
     */
    static resetParams() {
        const self = SipaUrl;
        const new_url = self.removeParamsOfUrl(self.getUrl(), Object.keys(self.getParams()));
        self._setUrl(new_url);
    }

    /**
     * Check if the current url has the given parameter.
     * If the parameter exists, it does not matter if it has a value or not.
     * If the parameter exists multiple times, it also returns true.
     * If the parameter does not exist, it returns false.
     *
     * @param {string} param_key
     * @returns {boolean}
     */
    static hasParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        const params = self.getParams();
        return typeof params[param_key] !== "undefined";
    }

    /**
     * Set or overwrite given anchor of the current url.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff#my-anchor
     * SipaUrl.setAnchor("new-anchor");
     * // URL: https://my-business.com/?some=stuff#new-anchor
     *
     * // URL: https://my-business.com/?without=anchor
     * SipaUrl.setAnchor("added-anchor");
     * // URL: https://my-business.com/?without=anchor#added-anchor
     *
     * @param {string} anchor without leading # character
     * @param {boolean} jump jump to anchor
     */
    static setAnchor(anchor, jump = false) {
        const self = SipaUrl;
        if (typeof anchor === "undefined") {
            self.removeAnchor();
        }
        if (jump) {
            let state = {};
            if (window.history.state) {
                state = window.history.state;
            }
            let params = {page: state.page_id};
            if (typeof anchor !== "undefined") {
                window.location.href = window.location.href + '#' + anchor;
            } else {
                window.location.href = self.removeAnchorOfUrl(window.location.href);
            }
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(SipaUrl.getUrl(), params));
        } else {
            const new_url = self.setAnchorOfUrl(self.getUrl(), anchor);
            self._setUrl(new_url);
        }
    }

    /**
     * Remove the anchor of the current URL.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.removeAnchor();
     * // URL: https://my-business.com/?some=stuff&foo=bar
     *
     */
    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self._setUrl(new_url);
    }

    /**
     * Get the anchor of the current URL without leading #.
     *
     * @example
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.getAnchor();
     * // => 'my-anchor'
     *
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.getAnchor();
     * // => undefined
     *
     * @returns {string|undefined}
     */
    static getAnchor() {
        const self = SipaUrl;
        return self.getAnchorOfUrl(self.getUrl());
    }

    /**
     * Creates a URL query string based on the given key<->value object.
     *
     * @example
     *
     * SipaUrl.createUrlParams({ a: 1, b: [1,2,3], c: "test space" })
     * // => 'a=1&b=1&b=2&b=3&c=test%20space'
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @param {Object} options
     * @param {boolean} options.url_encode url encode parameter keys and values, default: true
     * @param {boolean} options.multi_param_attributes if attribute is of array, make it 'id=1&id=2&id=3' on true, or 'id=1,2,3' on false
     * @returns {string}
     */
    static createUrlParams(params, options = {}) {
        const default_options = {
            url_encode: true,
            multi_param_attributes: true
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const ret = [];
        for (let d in params) {
            let key = d;
            let value = params[d];
            if (Typifier.isArray(value) && options.multi_param_attributes) {
                if (options.url_encode) {
                    ret.push(
                        encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join('&' + encodeURIComponent(key) + '=')
                    );
                } else {
                    ret.push(
                        key + '=' + value.join(key + '=')
                    );
                }
            } else {
                if (options.url_encode) {
                    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
                } else {
                    ret.push(d + '=' + params[d]);
                }
            }
        }
        return ret.join('&');
    }

    /**
     * Create a JSON, containing the parameters of the given url.
     *
     * @example
     *
     * SipaUrl.getParamsOfUrl("https://my-business.com/?some=stuff&foo=bar");
     * // => { "some": "stuff", "foo": "bar" }
     *
     * @param {string} url the url to extract parameters from
     * @param {Object} options
     * @param {boolean} options.decode_uri decode uri parameter values
     * @returns {Object<string, string>} return a JSON with { param1: value1, param2: value2, ... }
     */
    static getParamsOfUrl(url, options = {}) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            decode_uri: true, // decode url variables
        };
        options = SipaHelper.mergeOptions(default_options, options);
        url = self.removeAnchorOfUrl(url);
        let obj = {};
        let query_string = null;
        try {
            query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : (new URL(url)).search.slice(1);
        } catch (e) {
            return obj; // return empty object if it is no valid url
        }
        if (query_string) {
            query_string = self.removeAnchorOfUrl(query_string);
            // split our query string into its parts
            let arr = query_string.split('&');
            for (let i = 0; i < arr.length; i++) {
                // separate the keys and values
                let a = arr[i].split('=');
                // set parameter name and value (use 'true' if empty)
                let param_name = a[0];
                let param_value = typeof (a[1]) === 'undefined' ? true : a[1];
                if (options.decode_uri) {
                    param_value = decodeURIComponent(param_value);
                }
                // if the param_name ends with square brackets, e.g. colors[] or colors[2]
                if (param_name.match(/\[(\d+)?\]$/)) {
                    // create key if it doesn't exist
                    let key = param_name.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];
                    // if it's an indexed array e.g. colors[2]
                    if (param_name.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        let index = /\[(\d+)\]/.exec(param_name)[1];
                        obj[key][index] = param_value;
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(param_value);
                    }
                } else {
                    // we're dealing with a string
                    if (!obj[param_name]) {
                        // if it doesn't exist, create property
                        obj[param_name] = param_value;
                    } else if (obj[param_name] && typeof obj[param_name] === 'string') {
                        // if property does exist and it's a string, convert it to an array
                        obj[param_name] = [obj[param_name]];
                        obj[param_name].push(param_value);
                    } else {
                        // otherwise add the property
                        obj[param_name].push(param_value);
                    }
                }
            }
        }
        return obj;
    }

    /**
     * Remove the given parameters from the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar&more=power";
     * SipaUrl.removeParamsOfUrl(url, ["some","more"]);
     * // => https://my-business.com/?foo=bar
     *
     * @param {string} url to remove the params from
     * @param {Array<String>} param_keys array of keys to remove from the given url, e.g. ['key1','key2'}
     * @returns {string}
     */
    static removeParamsOfUrl(url, param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_name: 'param_keys', param_value: param_keys, expected_type: 'Array'},
            {param_name: 'url', param_value: url, expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (typeof curr_params[key] !== "undefined") {
                delete curr_params[key];
            }
        });
        let query_params = self.createUrlParams(curr_params);
        if (query_params) {
            query_params = '?' + query_params;
        }
        if (typeof anchor === "undefined") {
            anchor = "";
        }
        return self._getUrlWithoutParamsAndAnchor(url) + query_params + anchor;
    }

    /**
     * Remove the given one parameter from the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar";
     * SipaUrl.removeParamOfUrl(url, "foo");
     * // => https://my-business.com/?some=stuff
     *
     * @param {string} url
     * @param {string} param_key name of the param
     */
    static removeParamOfUrl(url, param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: param_key, param_name: 'param_key', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        self.removeParamsOfUrl(url, [param_key]);
    }

    /**
     * Set/overwrite the parameters of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?one=1&stat=true&that=cool"
     * SipaUrl.setParamsOfUrl(url, { "more": "better", "stat": "false"});
     * // => https://my-business.com/?one=1&stat=false&that=cool&more=better
     *
     * @param {string} url
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @returns {string} with given parameters
     */
    static setParamsOfUrl(url, params) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: params, param_name: 'params', expected_type: 'Object'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        if (typeof anchor === "undefined") {
            anchor = "";
        }
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self.removeAnchorOfUrl(self._getUrlWithoutParamsAndAnchor(url)) + '?' + self.createUrlParams(curr_params) + anchor;
    }


    /**
     * Set/overwrite the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff#my-anchor";
     * SipaUrl.setAnchorOfUrl(url, "new-anchor");
     * // => https://my-business.com/?some=stuff#new-anchor
     *
     * const url2 = "https://my-business.com/?without=anchor";
     * SipaUrl.setAnchorOfUrl(url2, "added-anchor");
     * // => https://my-business.com/?without=anchor#added-anchor
     *
     * @param {string} url
     * @param {string} anchor as string, without leading #
     * @returns {string} with given anchor
     */
    static setAnchorOfUrl(url, anchor) {
        const self = SipaUrl;
        if (typeof anchor === "undefined") {
            return url;
        }
        SipaHelper.validateParams([
            {param_value: anchor, param_name: 'anchor', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let final_url = self._getUrlWithoutParamsAndAnchor(url);
        if (Object.keys(curr_params).length > 0) {
            final_url += '?';
        }
        return final_url + self.createUrlParams(curr_params) + '#' + anchor;
    }

    /**
     * Get the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
     * SipaUrl.getAnchorOfUrl(url);
     * // => 'my-anchor'
     *
     * const url2 = "https://my-business.com/?some=stuff&foo=bar";
     * SipaUrl.getAnchorOfUrl(url2);
     * // => undefined
     *
     * @param {string} url
     * @param {object} options
     * @param {boolean} options.return_prefixed_hash return the prefixed hash
     * @returns {string|undefined} the anchor of the given url
     */
    static getAnchorOfUrl(url, options = {}) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            return_prefixed_hash: false
        }
        options = SipaHelper.mergeOptions(default_options, options);
        let prefix = '#';
        if (!options.return_prefixed_hash) {
            prefix = '';
        }
        if (url.indexOf('#') !== -1) {
            return prefix + url.split('#')[1];
        } else {
            return undefined;
        }
    }

    /**
     * Remove the anchor of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
     * SipaUrl.removeAnchorOfUrl(url);
     * // => https://my-business.com/?some=stuff&foo=bar
     *
     * @param {string} url
     * @returns {string} without anchor
     */
    static removeAnchorOfUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (url.indexOf('#') !== -1) {
            return url.split('#')[0];
        } else {
            return url;
        }
    }

    /**
     * Get the host name of the given url.
     *
     * Returns an empty string if the given url is not valid or no hostname could be extracted.
     *
     * @example
     *
     * const url = "https://my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url);
     * // => 'my-business.com'
     *
     * const url2 = "https://www.my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url2);
     * // => 'www.my-business.com'
     *
     * const url3 = "https://subdomain.my-business.com/some-param";
     * SipaUrl.getHostNameOfUrl(url3);
     * // => 'subdomain.my-business.com'
     *
     * @param {string} url
     * @returns {string}
     */
    static getHostNameOfUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        try {
            // Support file:// protocol
            if (url.startsWith('file://')) {
                // file://hostname/path or file:///path (no hostname)
                const match = url.match(/^file:\/\/([^\/]*)/);
                return match && match[1] ? match[1] : '';
            }
            // Support protocol-relative URLs: //example.com/path
            if (url.startsWith('//')) {
                url = 'http:' + url;
            }
            // Repair URLs with pattern like "http:/example.com"
            url = url.replace(/^(https?:)\/([^\/])/, '$1//$2');
            // Repair URLs with pattern like "http:/example.com" or "http//:example.com" to "http://example.com"
            url = url.replace(/^(https?)\/{1,2}:/, '$1://');
            let u = new URL(url);
            return u.hostname;
        } catch (e) {
            // Support Windows UNC paths: \\hostname\share\path
            const uncMatch = url.match(/^\\\\([^\\\/]+)[\\\/]/);
            if (uncMatch && uncMatch[1]) {
                return uncMatch[1];
            }
            // Fallback: extract hostname from http(s) or protocol-relative URLs
            const hostname_extract_regex = /^(https?:\/\/|\/\/)?([^\/]+)/;
            const match = url.match(hostname_extract_regex);
            if (match && match.length >= 3) {
                const hostname = match[2];
                if (/^[a-zA-Z0-9.\-]+$/.test(hostname)) {
                    return hostname;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }
    }

    /**
     * Set/overwrite the host name of the given url.
     *
     * @example
     *
     * const url = "https://my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url, "new-host.com");
     * // => https://new-host.com/some-param
     *
     * const url2 = "https://www.my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url2, "other-host.org");
     * // => https://other-host.org/some-param
     *
     * const url3 = "https://subdomain.my-business.com/some-param";
     * SipaUrl.setHostNameOfUrl(url3, "127.0.0.1");
     * // => https://127.0.0.1/some-param
     *
     * @param {string} url
     * @param {string} hostname
     * @returns {string}
     */
    static setHostNameOfUrl(url, hostname) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: hostname, param_name: 'hostname', expected_type: 'string'}
        ]);
        // check if hostname is valid
        const hostname_regex = /^(?!:\/\/)([a-zA-Z0-9-_\.]+)$/;
        if (!hostname.match(hostname_regex)) {
            throw `Given hostname is not valid: '${hostname}'`;
        }
        try {
            let u = new URL(url);
            u.hostname = hostname;
            return u.toString();
        } catch (e) {
            let h = self.getHostNameOfUrl(url);
            if (h) {
                return url.replace(h, hostname);
            } else if (url.trim() === "") {
                return hostname;
            } else {
                throw `Given URL is not valid: ${url}`;
            }
        }
    }

    /**
     * Get the given url without query parameters and without anchors.
     *
     * @example
     *
     * const url = "https://my-business.com/post?some=stuff&foo=bar#my-anchor";
     * SipaUrl._getUrlWithoutParamsAndAnchor(url);
     * // => https://my-business.com/post
     *
     * @param {string} url
     * @returns {string} url without parameters
     * @private
     */
    static _getUrlWithoutParamsAndAnchor(url) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (url.indexOf('?') !== -1) {
            return url.substr(0, url.indexOf('?'));
        } else {
            return self.removeAnchorOfUrl(url);
        }
    }

    /**
     * Overwrite the current url with the given url in the address bar without reloading the page.
     *
     * @example
     *
     * // Current URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl._setUrl("https://my-business.com/?other=param#new-anchor");
     * // New URL: https://my-business.com/?other=param#new-anchor
     *
     * @param {string} url
     * @private
     */
    static _setUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        window.history.replaceState(window.history.state, '', url);
    }
}
