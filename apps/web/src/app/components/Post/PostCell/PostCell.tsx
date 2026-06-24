"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type { FindPostById, FindPostByIdVariables } from "@/app/graphql/types";

import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";

import Post from "@/app/components/Post/Post/Post";

export const QUERY = (): TypedDocumentNode<FindPostById, FindPostByIdVariables> =>
  gql`
    query FindPostById($id: Int!) {
      post: post(id: $id) {
        id
        title
        body
        authorId
        createdAt
      }
    }
  `;

export const Loading = () => <div>Loading...</div>;

export const Empty = () => <div>Post not found</div>;

export const Failure = ({ error }: CellFailureProps<FindPostByIdVariables>) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({ post }: CellSuccessProps<FindPostById, FindPostByIdVariables>) => {
  if (!post) {
    return <Empty />;
  }

  return <Post post={post} />;
};

export default createCell<FindPostById, FindPostByIdVariables>({
  QUERY,
  Loading,
  Empty,
  Failure,
  Success,
});
