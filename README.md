# Kavach

Drop-in authentication including route protection and redirects for web apps.

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/jerrythomas/kavach/publish.yml/badge.svg?branch=next)
[![Maintainability](https://api.codeclimate.com/v1/badges/fa032a4f7e29a8c89c7d/maintainability)](https://codeclimate.com/github/jerrythomas/kavach/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/fa032a4f7e29a8c89c7d/test_coverage)](https://codeclimate.com/github/jerrythomas/kavach/test_coverage)
![GitHub last commit](https://img.shields.io/github/last-commit/jerrythomas/kavach)

![kavach](kavach.svg)

## Why?

Adding authentication to a web app is one of the most arduous tasks. Building apps in Svelte is great but there is no standard way to implement authentication. There are a lot of choices to add authentication for multiple providers. However, switching from one to another is not easy. The UI components for all the providers also need to meet the guidelines for the final app to be approved.

This is an attempt to make adding authentication to Svelte-Kit apps as simple as possible. This framework has been designed for Svelte.

- [logger](packages/core/README.md)

## Getting started

Get started quickly using [degit](https://github.com/Rich-Harris/degit). Select the library you want to use and run degit to get a sample app.

```bash
degit jerrythomas/kavach/sites/supabase my-app
```

### UnoCSS

This library uses UnoCSS and the components will not render properly if the required classes are not included in the final bundle.

## Route Configuration

Routes are configurable as shown in the example `config/routes.js` file. Sentry assumes that all routes are private by default. Public routes need to be listed so that they can be accessed without logging in.

## License

MIT © [Jerry Thomas](https://jerrythomas.name)
