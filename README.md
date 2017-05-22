# Cache Headers

Create cache headers as application-level or route-level middleware. This has only been tested as middleware for an express app.
The primary cache header set is the `Cache-Control` header value. All time values are set as seconds per the [w3 spec][spec].

This package is developed using [ES6][es6-moz] and transpiled with [babel]. It is also using the [1stdibs eslint rules][eslint-rules].

## Installation

```sh
$ yarn add cache-headers
// with npm 
$ npm install --save cache-headers
```

## Tests
```sh
$ yarn
$ yarn test
// with npm
$ npm install
$ npm test
```

## Usage

### App-level setup/override middleware

```es6
const express = require('express');
const app = express();
const cache = require('cache-headers');
const pathsConfig = {
    paths: {
        '/**/generic': {
            staleRevalidate: 'ONE_HOUR',
            staleError: 'ONE_HOUR'
        },
        '/short-cached/route': {
            maxAge: 60
        },
        '/user/route': false,
        '/**': {
            maxAge: 600
        }
    }
};

// some other middleware

app.use(cache.setupInitialCacheHeaders(pathsConfig));

// rest of app setup
```

With the example above, the `Cache-Control` header is set as follows when a user hits these different site routes:
- `/**/generic` (any route ending in `generic`)
    - `Cache-Control: no-cache, no-store, must-revalidate, stale-while-revalidate=3600, stale-if-error=3600`
    - `Surrogate-Control: maxAge=600`
- `/cached/route`
    - `Cache-Control: no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=60`
- `/user/route`
    - `Cache-Control: private, no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=0`
- `/**` (any other route not listed)
    - `Cache-Control: no-cache, no-store, must-revalidate`
    - `Surrogate-Control: maxAge=600`

### Router-level middleware

Taking the app-level setup above, you can additionally override the default `paths` initially set in the `cacheOptions`.

```es6
const express = require('express');
const router = express.Router();
const cache = require('cache-headers');
const overrideConfig = {
    "maxAge": 2000
};

// app.use(cache.setupInitialCacheHeaders(pathsConfig)) is loaded prior to this route, therefore running by default
// and any subsequent call to set the header is then overwritten

router.get('/endswith/generic', cache.overrideCacheHeaders(overrideConfig), (req, res, next) => {
    // do route-y stuff
    next();
});

```

Rather than set the original headers defined in the `paths` config in the app-level setup (for the `/**/generic` path), this will output the following: `Cache-Control: max-age=2000`

## API

### cache.setupInitialCacheHeaders()
```js
{
    '/glob/**/path': object|string|boolean=false
}
```

The following are acceptable keys to use if an object is passed in

- `maxAge`: `string|number` (defaults to `TEN_MINUTES` if `setPrivate=false` and to `0` if `setPrivate=true`)
    - can be a number or string representing a number for `maxAge` Surrogate-Control Header
- `staleRevalidate`: `string|number`
    - can be a number or string representing a number for `stale-while-revalidate` Cache-Control Header 
- `staleError`
    - can be a number or string representing a number for `stale-if-error` Cache-Control Header
- `setPrivate`: `boolean` (defaults to `false`)
    - `true` - `Cache-Control: private, no-cache, no-store, must-revalidate` (if set to true forces Surrogate-Control Header `maxAge=0`)
    - `false` - `Cache-Control: no-cache, no-store, must-revalidate`
- `lastModified`: `string` (defaults to current time) 
    - force specific Last-Modified Header

The following are acceptable values to use if a string is passed in for cache values:

- `'ONE_MINUTE'`
- `'TEN_MINUTES'`
- `'ONE_HOUR'`
- `'ONE_DAY'`
- `'ONE_WEEK'`
- `'ONE_MONTH'`
- `'ONE_YEAR'`

The following are acceptable values to use if a boolean is passed in 

- `false` - this is equivalent to passing `{ setPrivate: true, maxAge: 0 }` 

If no options are passed in, the default value set is
 
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Surrogate-Control: max-age=600`

### cache.overrideCacheHeaders()
```js
{
    maxAge: number|string,
    staleRevalidate: number|string,
    staleError: number|string,
    setPrivate: boolean,
    lastModified: string
}
```

See `setupInitialCacheHeaders()` options

## Recipes
### 


## Contributing
All code additions and bugfixes must be accompanied by unit tests. Tests are run with jest and
written with the node [`assert`][assert] module.

## Acknowledgement
A portion of this code was taken from this [cache-control][cache-control] package/repo.

[eslint-rules]: https://github.com/1stdibs/eslint-config-1stdibs
[babel]: https://babeljs.io/
[es6-moz]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
[spec]: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.3
[cache-control]: https://github.com/divshot/cache-control
[assert]: https://nodejs.org/api/assert.html
