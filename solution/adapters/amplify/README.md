# @kavach/adapter-amplify

Adapter for using amplify with kavach

## Usage

```bash
pnpm add kavach @kavach/adapter-amplify
```

```js
{
  // The region where Amazon Cognito was created
  region: 'YOUR_COGNITO_REGION',
  // The Amazon Cognito User Pool ID
  userPoolId: 'YOUR_USER_POOL_ID',
  // The Web Client ID (found in the App clients section of the user pool)
  userPoolWebClientId: 'YOUR_APP_CLIENT_ID',
  // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
  authenticationFlowType: 'USER_SRP_AUTH'
  }
```
