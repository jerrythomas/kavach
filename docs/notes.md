# Notes

## Components

This library consists of the following components.

- UI component with buttons for different OAuth providers
- Utility functions for various stages of auth lifecycle
- Store for managing the user session
- Route protection for pages & endpoints
- Logged in session details available in load function

## References

- Cookie parsing and serializing is required to support server-side auth guard. I had problems with the original npm library [jshttp/cookie](https://github.com/jshttp/cookie) on SvelteKit v1.0.0-next.218. Converting the original code from from CJS to ESM solved the issue and it has been included here.
-
