import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_POOL_API;

if (!endpoint) {
  throw new Error("NEXT_PUBLIC_POOL_API is not defined");
}

export const graphClient = new GraphQLClient(endpoint);
