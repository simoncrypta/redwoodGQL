"use client";

import { gql } from "@apollo/client";

import type {
  DeleteContactMutation,
  DeleteContactMutationVariables,
  FindContactById,
} from "@/app/graphql/types";

import { Link, routes, navigate } from "@/app/redwood/router";
import { useMutation } from "@/app/redwood/web";
import type { TypedDocumentNode } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import { timeTag } from "@/app/lib/formatters";

const deleteContactMutation = (): TypedDocumentNode<
  DeleteContactMutation,
  DeleteContactMutationVariables
> => gql`
  mutation DeleteContactMutation($id: Int!) {
    deleteContact(id: $id) {
      id
    }
  }
`;

interface Props {
  contact: NonNullable<FindContactById["contact"]>;
}

const Contact = ({ contact }: Props) => {
  const [deleteContact] = useMutation(deleteContactMutation(), {
    onCompleted: () => {
      toast.success("Contact deleted");
      navigate(routes.contacts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onDeleteClick = (id: DeleteContactMutationVariables["id"]) => {
    if (confirm("Are you sure you want to delete contact " + id + "?")) {
      void deleteContact({ variables: { id } });
    }
  };

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">Contact {contact.id} Detail</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{contact.id}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{contact.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{contact.email}</td>
            </tr>
            <tr>
              <th>Message</th>
              <td>{contact.message}</td>
            </tr>
            <tr>
              <th>Created at</th>
              <td>{timeTag(contact.createdAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link to={routes.editContact({ id: contact.id })} className="rw-button rw-button-blue">
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(contact.id)}
        >
          Delete
        </button>
      </nav>
    </>
  );
};

export default Contact;
