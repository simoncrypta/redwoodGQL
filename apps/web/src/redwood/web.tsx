"use client";

import type { TypedDocumentNode } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

export { useMutation, useQuery };
export type { TypedDocumentNode };

export type CellSuccessProps<TData extends object, TVariables extends object = object> = TData & {
  readonly variables?: TVariables;
};

export type CellFailureProps<TVariables extends object = object> = {
  readonly error: Error;
  readonly variables?: TVariables;
};

export const Metadata = (_props: {
  readonly description?: string;
  readonly og?: boolean;
  readonly title?: string;
}) => null;
