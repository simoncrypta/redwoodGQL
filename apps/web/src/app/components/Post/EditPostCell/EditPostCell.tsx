"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwgql/cell";

import type {
  EditPostById,
  UpdatePostInput,
  UpdatePostMutationVariables,
} from "@/app/graphql/types";

import { navigate, routes } from "@/app/redwood/router";
import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";
import { useMutation } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import PostForm from "@/app/components/Post/PostForm/PostForm";

export const QUERY = (): TypedDocumentNode<EditPostById> => gql`
  query EditPostById($id: Int!) {
    post: post(id: $id) {
      id
      title
      body
      authorId
      createdAt
    }
  }
`;

const updatePostMutation = (): TypedDocumentNode<EditPostById, UpdatePostMutationVariables> => gql`
  mutation UpdatePostMutation($id: Int!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      body
      authorId
      createdAt
    }
  }
`;

export const Loading = () => <div>Loading...</div>;

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({ post }: CellSuccessProps<EditPostById>) => {
  const [updatePost, { loading, error }] = useMutation(updatePostMutation(), {
    onCompleted: () => {
      toast.success("Post updated");
      navigate(routes.posts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSave = (input: UpdatePostInput, id?: NonNullable<EditPostById["post"]>["id"]) => {
    if (id === undefined) {
      return;
    }

    void updatePost({ variables: { id, input } });
  };

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Post {post?.id}</h2>
      </header>
      <div className="rw-segment-main">
        <PostForm post={post} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  );
};

export default createCell<EditPostById, { readonly id: number }>({
  QUERY,
  Loading,
  Failure,
  Success,
});
