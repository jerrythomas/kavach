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

The new layout.js provides interesting possibilities. Layout data reload can be forced using a dependency setup. 

Can the client side connection be passed to the server or the JWT from client side auth be used to auth on server side?

All api endpoints for auth can be functions that are auto included as part of the hook handler. Use sequence helper for handle hooks.

- [ ] handleSignIn
- [ ] handleSession
- [ ] handleSignOut
- [ ] handleUnauthorizedAccess

These handlers will be exposed as an array so that hooks.server.js can use them. This also provides a flexibility to the developer to add their additional handlers on server side.

Handle signin performs the initialisation of auth. Both magic link and oauth will redirect to the auth handler ui where the actual auth change happens. On this change the current session data should be sent to server side for server side session to be created.

Server side session will be created by the handle session endpoint. Client will post client side session to this endpoint and server will generate a session object from the data received. This session will be used for all actions on server side.

- [ ] Setting the session cookie
- [ ] Clearing the session cookie
- [ ] Server side auth
- [ ] Protecting routes with fallback endpoints. Generally speaking unauthenticated access will be routed to the login/sign-up page and unauthorised access would be routed to home/landing page for a role. 
- [ ] Providing an option to override this fallback url will be useful 

Functions for some endpoints. Root path is default /api/auth

- [ ] login: perform login
- [ ] cookie: set the auth token cookie
- [ ] logout: perform logout
- [ ] protect: allow or redirect based on role

Api end points will follow the structure 

/api/data/[role]/[entity]/[id|email]
/api/data/[role]/[entity]

Restrictions on which entities are available  and which operations are allowed (get/put/post) can be configured using an entity map. A generic function can be used to implement these actions. Developer can choose to write their own way. However this will make it easier to perform role based access control on api’s because of the root url having the role as a parent path. 

To do:

On Auth Change handler for UI, should call the set auth cookie endpoint so that the auth info is stored in cookie. This endpoint should redirect to home page or auth page based on the values of user. This function should also internally be called by the handleSignIn and signOut functions. These actually just initiate the sign in and sign out and do not actually perform sign in. This may end up causing redirect twice.  Need to avoid double redirect.

Handle should also perform server side sign in using the sb:token.Look into multi schema auth also using this approach..


- [ ] Kavach: Support for handling api routes with access control for read/write/delete options based on role. 
    - [ ] Page routes v/s api  or as object with permissions r/w/d. 
    - [ ] If permissions is not present assumed to be all. 
    - [ ] If route is not present assumes none

Kavach

Deflector

Add endpoints for server routes. These routes should return unauthorised access message when accessing using without authentication.

Add support for api key based endpoints. Assume that api key based endpoints are under separate path and user auth endpoints are under different path. 

Different api endpoints may have different api keys, so the deflector should reject any api endpoint calls without api-key in header. Also include api key validation for each endpoint.

Possible structure 

api-key-header: ‘x-api-key’
Routes:[
{ path: /api, key: ‘xyz’, type:’api’}
{ path: /data, type:’endpoint’, roles:[]}
{ path: /, type:’page’, roles:[]}
{ path: /auth, type:’page’, public:true}
]

- [ ] Any routes not in list will be redirected to 404 for all. 
- [ ] Mixed paths will not be supported. 
    - [ ] Page routes should not include endpoints. 
    - [ ] And user auth endpoints should be separate from api key based endpoints. 
    - [ ] Throw error’s for such scenarios. 
- [ ] Any entry that has key will use key based auth. 
- [ ] Others will check for the role.
- [ ] In case of unauthorised, pages will be routed to unauthorised page
- [ ] In case of invalid role, it will be redirected to home
- [ ] In case of unauthorised or invalid api key return appropriate error for endpoints.


Kavach
Kavach

- [ ] signIn
- [ ] signOut
- [ ] signUp
- [ ] recoverPassword
- [ ] updatePassword
- [ ] updateProfile
- [ ] onAuthChange
- [ ] handle
    - [ ] synchronizeServerSession
    - [ ] handleUnauthorizedAccess
- [ ] handleClientRouteAccess
- [ ] getClient

Adapter
- [ ] signIn
- [ ] signUp
- [ ] signOut
- [ ] synchronise
- [ ] recoverPassword
- [ ] updatePassword
- [ ] updateProfile
- [ ] onAuthChange
- [ ] getClient

Major functions are offloaded to the adapter. However, kavach adds some additional actions which augment the adapter actions.

- [ ] invalidate
- [ ] callSynchronize
- [ ] redirects
- [ ] protect
