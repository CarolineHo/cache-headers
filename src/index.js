/**
 * @ignore
 * User: daletan
 * Date: 12/19/15
 * Time: 8:49 PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

'use strict';

import url from 'url';
import globject from 'globject';
import slasher from 'glob-slasher';
import {
    KEY_SURROGATE_CONTROL
} from './headerTypes';
import { generateAllCacheHeaders } from './cacheControl';
import { isNumberLike, isValidObject } from './utils';

export * from './headerTypes';
export * from './timeValues';

/**
 * This will either set a specific header or defer to using express' res.set() functionality
 * {{@link http://expressjs.com/en/api.html#res.set}}
 * @param {object} res The current response object
 * @param {object} headerData
 * @param {string} [headerData.name] The response header to use
 * @param {string} [headerData.value] The corresponding response header value
 */
function setHeader(res, headerData) {
    if (headerData.name && headerData.value) {
        res.set(headerData.name, headerData.value);
    } else {
        res.set(headerData);
    }
}

/**
 * @param {object<array>} headers
 * @param {string} headers[].name The header name
 * @param {string} headers[].value The header value
 * @returns {function(*, *=, *)}
 */
export function setAdditionalHeaders(headers = []) {
    return (req, res, next) => {
        if (Array.isArray(headers) && headers.length) {
            headers.map(headerData => setHeader(res, headerData));
        }
        next();
    };
}

/**
 * {{@link module:cacheControl#generate}} for acceptable values
 * @param {object} pathsConfig Cache settings with glob path patterns
 * @return {Function}
 */
export function setupInitialCacheHeaders(pathsConfig) {
    pathsConfig = pathsConfig || {};

    return (req, res, next) => {
        // current path (prefixed with a slash)
        const pathname = slasher(url.parse(req.originalUrl).pathname);

        /**
         * Takes a pathname and returns the first config whose glob key matches
         *
         * @param pathname - pathname prefixed with slash
         * @function
         */
        const getCacheConfig = globject(slasher(pathsConfig, { value: false }));

        // options by default are set to config
        let options = getCacheConfig(pathname);

        if (options === false) {
            // current path doesn't match any glob key in pathsConfig
            options = {
                [KEY_SURROGATE_CONTROL]: 0,
                setPrivate: true
            };
        } else if (isNumberLike(options)) {
            // catch `0` before !cacheValue check
            // make sure to convert value to actual number
            options = {
                [KEY_SURROGATE_CONTROL]: Number(options)
            };
        }

        setHeader(res, generateAllCacheHeaders(options));

        next();
    };
}

/**
 *
 * {{@link module:cacheControl#generate}} for acceptable values
 * @param {object} overrideConfig cacheSettings to override default
 * @returns {function(*, *=, *)}
 */
export function overrideCacheHeaders(overrideConfig) {
    return (req, res, next) => {

        let options = overrideConfig;
        if (overrideConfig === false) {
            options = {
                [KEY_SURROGATE_CONTROL]: 0,
                setPrivate: true
            };
        }

        if (isValidObject(options)) {
            setHeader(res, generateAllCacheHeaders(options));
        }

        next();
    };
}
