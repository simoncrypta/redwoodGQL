# @rwgql/rwsdk-apollo-client

Apollo Client + RWSDK SSR streaming. Demo wiring: `apps/web/src/worker.tsx`, `apps/web/src/GraphQLProvider.tsx`.

## Cedar imports

| Cedar                                             | RedwoodGQL                                              |
| ------------------------------------------------- | ------------------------------------------------------- |
| `@redwoodjs/web/apollo` → `RedwoodApolloProvider` | `ApolloRwsdkProvider` from `@rwgql/rwsdk-apollo-client` |
| `@redwoodjs/web` → `useQuery`, `useMutation`      | `@apollo/client/react`                                  |
| `@redwoodjs/web` → Cells                          | `@rwgql/cell`                                           |
| App shell in `src/App.tsx`                        | Worker `renderPage` + app `GraphQLProvider`             |

`ApolloRwsdkProvider` does not take Cedar's `useAuth` prop. Pass auth via `createRwsdkApolloMakeClient`
(e.g. `credentials: "include"`) and compose `AuthProvider` in your app shell when auth and GraphQL are coupled.

## Exports

- `@rwgql/rwsdk-apollo-client` — client provider, `createRwsdkApolloMakeClient`, streaming links
- `/worker` — `createApolloRwsdkTransportId`, `renderApolloRwsdkStream`, `renderApolloRwsdkRscStream`
- `/rsc` — RSC helpers (`registerApolloClient`, etc.)

Worker `renderPage` must create a transport id per request, pass `nonce` and `transportId` into your app
provider, and render through the matching stream helper.

## Client factory

```tsx
import { ApolloRwsdkProvider, createRwsdkApolloMakeClient } from "@rwgql/rwsdk-apollo-client";

const makeClient = createRwsdkApolloMakeClient({ uri: graphQLUrl });

<ApolloRwsdkProvider makeClient={makeClient} nonce={nonce} transportId={transportId}>
  {children}
</ApolloRwsdkProvider>;
```
