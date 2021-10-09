# @racy/azure-middleware

It is a middleware implementation for azure functions inspired on MiddyJs.

It works in the same way as MiddyJs but without plugins.

## Installation

```sh
npm install @racy/azure-middleware --save
```

## Example

```typescript
import {AzureMiddleware} from '@racy/azure-middleware'

const middlware = new AzureMiddleware(handler); // where handler is you azure function;
middleware.use(yourMiddlewareBuilder()); // the middleware builder function should return a MiddlewareConfiguration object

export = middleware.listen(); // this should return the final handler your original handler should be wrapped
                             // in the middleware onion patter in the same way that middy works;
```
