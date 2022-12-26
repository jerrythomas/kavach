# @kavach/cookie

Basic HTTP cookie parser and serializer for HTTP servers.

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
npm install @kavach/cookie
```

## API

```js
import * as cookie from '@kavach/cookie'
```

### parse(str, options)

Parse an HTTP `Cookie` header string and return an object of all cookie name-value pairs.
The `str` argument is the string representing a `Cookie` header value and the `options` parameter is an
optional object containing additional parsing options.

```js
import { parse } from '@kavach/cookie'
let cookies = parse('foo=bar; equation=E%3Dmc%5E2')
// { foo: 'bar', equation: 'E=mc^2' }
```

#### Parse Options

The `parse` function accepts these properties in the options object.

##### decode

Specifies a function that will be used to decode a cookie's value. Since the value of a cookie
has a limited character set (and must be a simple string), this function can be used to decode
a previously-encoded cookie value into a JavaScript string or other object.

The default function is the global `decodeURIComponent`, which will decode any URL-encoded
sequences into their byte representations.

**note** if an error is thrown from this function, the original, non-decoded cookie value will
be returned as the cookie's value.

### serialize(name, value, options)

Serialize a cookie name-value pair into a `Set-Cookie` header string. The `name` argument is the
name for the cookie, the `value` argument is the value to set the cookie to, and the `options`
argument is an optional object containing additional serialization options.

```js
import { serialize } from '@kavacg/cookie'
let setCookie = serialize('foo', 'bar')
// foo=bar
```

#### Serialize Options

The `serialize` function accepts these properties in the options object.

##### domain

Specifies the value for the [`Domain` `Set-Cookie` attribute]([rfc-6265-5.2.3]). By default, no
domain is set, and most clients will consider the cookie to apply to only the current domain.

##### encode

Specifies a function that will be used to encode a cookie's value. Since the value of a cookie
has a limited character set (and must be a simple string), this function can be used to encode
a value into a string suited for a cookie's value.

The default function is the global `encodeURIComponent`, which will encode a JavaScript string
into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

##### expires

Specifies the `Date` object to be the value for the [`Expires` `Set-Cookie` attribute]([rfc-6265-5.2.1]).
By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and
will delete it on a condition like exiting a web browser application.

##### maxAge

Specifies the `number` (in seconds) to be the value for the [`Max-Age` `Set-Cookie` attribute]([rfc-6265-5.2.2]).
The given number will be converted to an integer by rounding down. By default, no maximum age is set.

> **note** the [cookie storage model specification]([rfc-6265-5.3]) states that if both `expires` and
> `maxAge` are set, then `maxAge` takes precedence, but not all clients obey this, so if both are set,
> they should point to the same date and time.

##### httpOnly

Specifies the `boolean` value for the [`HttpOnly` `Set-Cookie` attribute]([rfc-6265-5.2.6]). When truthy,
the `HttpOnly` attribute is set, otherwise, it is not. By default, the `HttpOnly` attribute is not set.

> **note** be careful when setting this to `true`, as compliant clients will not allow client-side
> JavaScript to see the cookie in `document.cookie`.

##### path

Specifies the value for the [`Path` `Set-Cookie` attribute]([rfc-6265-5.2.4]). By default, the path
is considered the ["default path"]([rfc-6265-5.1.4]).

##### priority

Specifies the `string` to be the value for the [`Priority` `Set-Cookie` attribute]([rfc-west-cookie-priority-00-4.1]).

- `'low'` will set the `Priority` attribute to `Low`.
- `'medium'` will set the `Priority` attribute to `Medium`, the default priority when not set.
- `'high'` will set the `Priority` attribute to `High`.

More information about the different priority levels can be found in
[the specification]([rfc-west-cookie-priority-00-4.1]).

> **note** This is an attribute that has not yet been fully standardized, and may change in the future.
> This also means many clients may ignore this attribute until they understand it.

##### sameSite

Specifies the `boolean` or `string` to be the value for the [`SameSite` `Set-Cookie` attribute]([rfc-6265bis-09-5.4.7]).

- `true` will set the `SameSite` attribute to `Strict` for strict same-site enforcement.
- `false` will not set the `SameSite` attribute.
- `'lax'` will set the `SameSite` attribute to `Lax` for lax same-site enforcement.
- `'none'` will set the `SameSite` attribute to `None` for an explicit cross-site cookie.
- `'strict'` will set the `SameSite` attribute to `Strict` for strict same-site enforcement.

More information about the different enforcement levels can be found in
[the specification]([rfc-6265bis-09-5.4.7]).

> **note** This is an attribute that has not yet been fully standardized and may change in the future.
> This also means many clients may ignore this attribute until they understand it.

##### secure

Specifies the `boolean` value for the [`Secure` `Set-Cookie` attribute]([rfc-6265-5.2.5]). When truthy,
the `Secure` attribute is set, otherwise, it is not. By default, the `Secure` attribute is not set.

> **note**:
> be careful when setting this to `true`, as compliant clients will not send the cookie back to
> the server in the future if the browser does not have an HTTPS connection.

## Example

The following example uses this module in conjunction with the Node.js core HTTP server
to prompt a user for their name and display it back on future visits.

```js
import * as cookie from 'cookie'
import * as escapeHtml from 'escape-html'
import * as http from 'http'
import * as url from 'url'

function onRequest(req, res) {
  // Parse the query string
  let query = url.parse(req.url, true, true).query

  if (query && query.name) {
    // Set a new cookie with the name
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('name', String(query.name), {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
    )

    // Redirect back after setting cookie
    res.statusCode = 302
    res.setHeader('Location', req.headers.referer || '/')
    res.end()
    return
  }

  // Parse the cookies on the request
  let cookies = cookie.parse(req.headers.cookie || '')

  // Get the visitor name set in the cookie
  let name = cookies.name

  res.setHeader('Content-Type', 'text/html; charset=UTF-8')

  if (name) {
    res.write('<p>Welcome back, <b>' + escapeHtml(name) + '</b>!</p>')
  } else {
    res.write('<p>Hello, new visitor!</p>')
  }

  res.write('<form method="GET">')
  res.write(
    '<input placeholder="enter your name" name="name"> <input type="submit" value="Set Name">'
  )
  res.end('</form>')
}

http.createServer(onRequest).listen(3000)
```

## Testing

```sh
pnpm test
```

## Benchmark

```text
$ pnpm bench

> @kavach/cookie@1.0.0-next.0 bench cookie
> node benchmark/index.js


  node@16.15.0
  v8@9.4.146.24-node.20
  uv@1.43.0
  zlib@1.2.11
  brotli@1.0.9
  ares@1.18.1
  modules@93
  nghttp2@1.47.0
  napi@8
  llhttp@6.0.4
  openssl@1.1.1n+quic
  cldr@40.0
  icu@70.1
  tz@2021a3
  unicode@14.0
  ngtcp2@0.1.0-DEV
  nghttp3@0.1.0-DEV
  cookie.parse - generic

  6 tests completed.

  simple      x 2,285,991 ops/sec ±1.46% (191 runs sampled)
  decode      x 1,720,499 ops/sec ±1.25% (189 runs sampled)
  unquote     x 1,883,221 ops/sec ±1.30% (186 runs sampled)
  duplicates  x   765,346 ops/sec ±1.46% (185 runs sampled)
  10 cookies  x   225,063 ops/sec ±1.04% (185 runs sampled)
  100 cookies x    20,354 ops/sec ±1.17% (185 runs sampled)

  cookie.parse - top sites

  16 tests completed.

  parse accounts.google.com x 1,096,402 ops/sec ±0.76% (193 runs sampled)
  parse apple.com           x 2,229,368 ops/sec ±1.14% (184 runs sampled)
  parse cloudflare.com      x   665,688 ops/sec ±0.91% (183 runs sampled)
  parse docs.google.com     x   974,477 ops/sec ±1.07% (181 runs sampled)
  parse drive.google.com    x 1,044,377 ops/sec ±0.95% (188 runs sampled)
  parse en.wikipedia.org    x   444,311 ops/sec ±1.14% (184 runs sampled)
  parse linkedin.com        x   287,581 ops/sec ±0.84% (186 runs sampled)
  parse maps.google.com     x   481,702 ops/sec ±0.88% (185 runs sampled)
  parse microsoft.com       x   249,242 ops/sec ±0.92% (183 runs sampled)
  parse play.google.com     x   686,403 ops/sec ±0.92% (187 runs sampled)
  parse plus.google.com     x   989,099 ops/sec ±0.86% (184 runs sampled)
  parse sites.google.com    x   975,948 ops/sec ±1.71% (182 runs sampled)
  parse support.google.com  x   552,380 ops/sec ±1.03% (189 runs sampled)
  parse www.google.com      x   507,071 ops/sec ±0.96% (181 runs sampled)
  parse youtu.be            x   941,225 ops/sec ±0.97% (194 runs sampled)
  parse youtube.com         x   976,920 ops/sec ±0.61% (192 runs sampled)
```

## References

This library is an ES module version of [jshttp/cookie](https://github.com/jshttp/cookie), for working with cookies in kavach.

- [RFC 6265: HTTP State Management Mechanism][rfc-6265]
- [Same-site Cookies][rfc-6265bis-09-5.4.7]

[rfc-west-cookie-priority-00-4.1]: https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1
[rfc-6265bis-09-5.4.7]: https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7
[rfc-6265]: https://tools.ietf.org/html/rfc6265
[rfc-6265-5.1.4]: https://tools.ietf.org/html/rfc6265#section-5.1.4
[rfc-6265-5.2.1]: https://tools.ietf.org/html/rfc6265#section-5.2.1
[rfc-6265-5.2.2]: https://tools.ietf.org/html/rfc6265#section-5.2.2
[rfc-6265-5.2.3]: https://tools.ietf.org/html/rfc6265#section-5.2.3
[rfc-6265-5.2.4]: https://tools.ietf.org/html/rfc6265#section-5.2.4
[rfc-6265-5.2.5]: https://tools.ietf.org/html/rfc6265#section-5.2.5
[rfc-6265-5.2.6]: https://tools.ietf.org/html/rfc6265#section-5.2.6
[rfc-6265-5.3]: https://tools.ietf.org/html/rfc6265#section-5.3
