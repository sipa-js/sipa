/**
 * SipaUrl
 *
 * Tool class to access and manipulate
 * the current or given URLs
 */
class SipaUrl {
    /**
     * Get the current address of the website
     *
     * @example
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
     * SipaUrl.getProtocol();
     * // => 'https'
     *
     * @returns {'http'|'https'}
     */
    static getProtocol() {
        return window.location.protocol.replace(':', '');
    }

    /**
     * Get the host name of the current url
     *
     * @example
     *      localhost
     *      127.0.0.1
     *      localhost:7000
     *      my-domain.com
     *
     * @returns {string}
     */
    static getHostName() {
        return window.location.hostname;
    }

    /**
     * Get all params of the current URL
     *
     * @example
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
     * Set or overwrite given parameters of the current url
     *
     * @example
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
     * Set or overwrite one specific parameter of the current url
     *
     * @example
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
     * Remove given params of the current url
     *
     * @example
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
     * Remove given param of the current url
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.removeParam("foo");
     * // URL: https://my-business.com/?some=stuff
     * @param {string} param_key
     */
    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        self.removeParams([param_key]);
    }

    /**
     * Remove the anchor of the URL
     *
     * @example
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
     * Creates an url query string based on the given key<->value object
     *
     * @example
     *  { a: 1, b: [1,2,3], c: "test space" }
     *  =>
     *  'a=1&b=1&b=2&b=3&c=test%20space'
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
            if(Typifier.isArray(value) && options.multi_param_attributes) {
                if(options.url_encode) {
                    ret.push(
                        encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join('&' + encodeURIComponent(key) + '=')
                    );
                } else {
                    ret.push(
                        key + '=' + value.join(key + '=')
                    );
                }
            } else {
                if(options.url_encode) {
                    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
                } else {
                    ret.push(d + '=' + params[d]);
                }
            }
        }
        return ret.join('&');
    }

    /**
     * Create a JSON, containing the parameters of the given url
     *
     * @example
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
        let query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : (new URL(url)).search.slice(1);
        let obj = {};
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
     * Remove the given parameters from the given url
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
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (curr_params[key]) {
                delete curr_params[key];
            }
        });
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
    }

    /**
     * Remove the given one parameter from the given url
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
     * Set/overwrite the parameters of the given url
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
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
    }

    /**
     * Get the anchor of the given url
     *
     * @param {string} url
     * @param {object} options
     * @param {boolean} options.return_prefixed_hash return the prefixed hash
     * @returns {string} the anchor of the given url
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
            return '';
        }
    }

    /**
     * Remove the anchor of the given url
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
     * Get the given url without query parameters
     *
     * @param {string} url
     * @returns {string} url without parameters
     * @private
     */
    static _getUrlWithoutParams(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        return url.substr(0, url.indexOf('?'));
    }

    /**
     * Overwrite the current url with the given url
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
