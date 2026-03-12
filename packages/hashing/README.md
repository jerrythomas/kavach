# @kavach/hashing

Hashing utilities used internally by Kavach.

## Installation

```bash
bun add @kavach/hashing
```

## Usage

```js
import { md5 } from '@kavach/hashing'

const hash = md5('hello@example.com')
// => '5d41402abc4b2a76b9719d911017c592'
```

## API

### `md5(input: string): string`

Returns the MD5 hex digest of the input string. Used internally for generating Gravatar URLs.
