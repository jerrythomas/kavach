# Learn Kavach

Kavach is a powerful Node.js library that simplifies integrating authentication and role-based route access control in your applications.

## Authentication

- Easy integration of authentication and role-based route access.
- Supports multiple authentication aggregators like Supabase, Firebase, Auth0, and Amplify.
- Offers various authentication mechanisms such as OAuth, magic links, and password authentication.

## Role Based Access Control

- Configure specific routes like home, login, logout, unauthorized, and session sync endpoints.
- All routes are protected by default; public routes need explicit configuration.
- Login page redirects to the home page post authentication.
- Private routes can be set for all roles, specific roles, or a single role.

## Demos

Explore various demo pages to see Kavach in action. Understand how to set up protected and public routes and experiment with role-based access.

- Protected page accessible to all roles.
- Public route for common access.
- Pages demonstrating secure and public endpoint calls with response codes.
- Role-based access demonstration page.
- Custom unauthorized access page.
- Example applications like Wordle (non-persistent) and Todos (backend-persisted).

- [Supabase](https://kavach-supabase.vercel.app/)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
