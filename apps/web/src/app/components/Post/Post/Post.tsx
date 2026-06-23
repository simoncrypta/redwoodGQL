"use client";

import { gql } from "@apollo/client";

import type {
  DeletePostMutation,
  DeletePostMutationVariables,
  FindPostById,
} from "@/app/graphql/types";

import { Link, routes, navigate } from "@/app/redwood/router";
import { useMutation } from "@/app/redwood/web";
import type { TypedDocumentNode } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import { timeTag } from "@/app/lib/formatters";

const deletePostMutation = (): TypedDocumentNode<
  DeletePostMutation,
  DeletePostMutationVariables
> => gql`
  mutation DeletePostMutation($id: Int!) {
    deletePost(id: $id) {
      id
    }
  }
`;

interface Props {
  post: NonNullable<FindPostById["post"]>;
}

const Post = ({ post }: Props) => {
  const [deletePost] = useMutation(deletePostMutation(), {
    onCompleted: () => {
      toast.success("Post deleted");
      navigate(routes.posts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDeleteClick = (id: DeletePostMutationVariables["id"]) => {
    if (confirm("Are you sure you want to delete post " + id + "?")) {
      void deletePost({ variables: { id } });
    }
  };

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">Post {post.id} Detail</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{post.id}</td>
            </tr>
            <tr>
              <th>Title</th>
              <td>{post.title}</td>
            </tr>
            <tr>
              <th>Body</th>
              <td>{post.body}</td>
            </tr>
            <tr>
              <th>Author id</th>
              <td>{post.authorId}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(post.createdAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link to={routes.editPost({ id: post.id })} className="rw-button rw-button-blue">
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(post.id)}
        >
          Delete
        </button>
      </nav>
    </>
  );
};

export default Post;
