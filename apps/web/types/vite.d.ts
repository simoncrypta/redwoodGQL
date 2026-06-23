declare module "*?url" {
  const result: string;
  export default result;
}

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URL?: string;
}
