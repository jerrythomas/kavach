# Kavach

> Authentication made simple with Kavach

Kavach is a powerful Svelte library that helps simplify the process of implementing authentication in your Svelte-Kit app. With support for social authentication, email/password authentication, and magic link authentication, Kavach has you covered no matter how you want to authenticate your users.

In addition to its robust authentication features, Kavach also provides a customizable set of components to help you build a wide variety of responsive UI for your authentication flow. This makes it easy to create a seamless and intuitive experience for your users, no matter what devices they are using.

Furthermore, Kavach is fully themeable and supports a variety of design styles, so it can fit seamlessly into any application's design system and theme. Whether you want a sleek and modern look or a more traditional and classic feel, Kavach has the tools and customization options you need.

Kavach also provides support for role-based route protection. This allows you to ensure that only users with the appropriate permissions can access certain routes or pages in your application.

Kavach currently supports using Supabase for authentication and also includes support for row-level security. This allows you to implement fine-grained controls over which users have access to which data within your application. Support for Firebase, Auth0, and AWS Cognito is coming soon, so you'll have even more options for secure and reliable authentication in your app.

[![Maintainability][maintainability_badge]][maintainability_url]
[![Test Coverage][coverage_badge]][coverage_url]
![GitHub Workflow Status][workflow_status_url]
![GitHub last commit](https://img.shields.io/github/last-commit/jerrythomas/kavach)

![kavach](kavach.svg)

## Try It out

If you're interested in trying out Kavach for yourself, you can visit the official website at [Kavach](https://kavach.vercel.app). There, you'll find detailed documentation and guides to help you get started with the library, as well as a live demo that you can play around with to see how Kavach works in action. Whether you're a seasoned developer or just getting started with Svelte-Kit, Kavach is a powerful and easy-to-use library that can help you add secure and reliable authentication to your app in no time. So, give it a try and see how it can simplify the process of adding authentication to your Svelte-Kit app.

## Libraries

- [@kavach/logger](packages/logger/README.md)
- [@kavach/svelte](packages/svelte/README.md)
- [@kavach/adapter-supabase](adapters/supabase/README.md)

## Getting started

Get started quickly using [degit](https://github.com/Rich-Harris/degit). Select the library you want to use and run "degit" to get a sample app.

```bash
npx degit jerrythomas/kavach/sites/skeleton my-app
```

### UnoCSS

This library uses UnoCSS and the components will not render properly if the required classes are not included in the final bundle.

## Route Configuration

Routes are configurable as shown in the example `config/routes.js` file. Sentry assumes that all routes are private by default. Public routes need to be listed so that they can be accessed without logging in.

## License

MIT © [Jerry Thomas](https://jerrythomas.name)

[workflow_status_url]: https://img.shields.io/github/workflow/status/jerrythomas/kavach/publish.yml/badge.svg?branch=next
[maintainability_badge]: https://api.codeclimate.com/v1/badges/fa032a4f7e29a8c89c7d/maintainability
[maintainability_url]: https://codeclimate.com/github/jerrythomas/kavach/maintainability
[coverage_badge]: https://api.codeclimate.com/v1/badges/fa032a4f7e29a8c89c7d/test_coverage
[coverage_url]: https://codeclimate.com/github/jerrythomas/kavach/test_coverage
