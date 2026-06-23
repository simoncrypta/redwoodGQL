"use client";

import { gql } from "@apollo/client";
import { createCell } from "@rwsdk/cell";

import type {
  EditContactById,
  UpdateContactInput,
  UpdateContactMutationVariables,
} from "@/app/graphql/types";

import { navigate, routes } from "@/app/redwood/router";
import type { CellSuccessProps, CellFailureProps, TypedDocumentNode } from "@/app/redwood/web";
import { useMutation } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import ContactForm from "@/app/components/Contact/ContactForm/ContactForm";

export const QUERY = (): TypedDocumentNode<EditContactById> => gql`
  query EditContactById($id: Int!) {
    contact: contact(id: $id) {
      id
      name
      email
      message
      createdAt
    }
  }
`;

const updateContactMutation = (): TypedDocumentNode<
  EditContactById,
  UpdateContactMutationVariables
> => gql`
  mutation UpdateContactMutation($id: Int!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) {
      id
      name
      email
      message
      createdAt
    }
  }
`;

export const Loading = () => <div>Loading...</div>;

export const Failure = ({ error }: CellFailureProps) => (
  <div className="rw-cell-error">{error?.message}</div>
);

export const Success = ({ contact }: CellSuccessProps<EditContactById>) => {
  const [updateContact, { loading, error }] = useMutation(updateContactMutation(), {
    onCompleted: () => {
      toast.success("Contact updated");
      navigate(routes.contacts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSave = (
    input: UpdateContactInput,
    id?: NonNullable<EditContactById["contact"]>["id"],
  ) => {
    if (id === undefined) {
      return;
    }

    void updateContact({ variables: { id, input } });
  };

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">Edit Contact {contact?.id}</h2>
      </header>
      <div className="rw-segment-main">
        <ContactForm contact={contact} onSave={onSave} error={error} loading={loading} />
      </div>
    </div>
  );
};

export default createCell<EditContactById, { readonly id: number }>({
  QUERY,
  Loading,
  Failure,
  Success,
});
