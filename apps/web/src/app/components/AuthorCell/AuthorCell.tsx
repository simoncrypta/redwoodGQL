"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type { FindAuthorQuery, FindAuthorQueryVariables } from "@/app/graphql/types";

import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import Author from "@/app/components/Author/Author";

export const QUERY = (): TypedDocumentNode<FindAuthorQuery, FindAuthorQueryVariables> => gql`
  query FindAuthorQuery($id: Int!) {
    author: user(id: $id) {
      email
      fullName
    }
  }
`;

export const Loading = () => <span>Loading...</span>;

export const Empty = () => <span>Empty</span>;

export const Failure = ({ error }: CellFailureProps<FindAuthorQueryVariables>) => (
  <span style={{ color: "red" }}>Error: {error?.message}</span>
);

export const Success = ({
  author,
}: CellSuccessProps<FindAuthorQuery, FindAuthorQueryVariables>) => {
  if (!author) {
    return <Empty />;
  }

  return (
    <span className="author-cell">
      <Author author={author} />
    </span>
  );
};

export default createCell<FindAuthorQuery, FindAuthorQueryVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
