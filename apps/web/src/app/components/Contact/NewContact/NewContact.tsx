"use client";

import { gql } from "@apollo/client";

import type {
  CreateContactMutation,
  CreateContactInput,
  CreateContactMutationVariables,
} from "@/app/graphql/types";

import { navigate, routes } from "@/app/redwood/router";
import { useMutation } from "@/app/redwood/web";
import type { TypedDocumentNode } from "@/app/redwood/web";
import { toast } from "@/app/redwood/toast";

import ContactForm from "@/app/components/Contact/ContactForm/ContactForm";

const createContactMutation = (): TypedDocumentNode<
  CreateContactMutation,
  CreateContactMutationVariables
> => gql`
  mutation CreateContactMutation($input: CreateContactInput!) {
    createContact(input: $input) {
      id
    }
  }
`;

const NewContact = () => {
  const [createContact, { loading, error }] = useMutation(createContactMutation(), {
    onCompleted: () => {
      toast.success("Contact created");
      navigate(routes.contacts());
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSave = (input: CreateContactInput) => {
    void createContact({ variables: { input } });
  };

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Contact</h2>
      </header>
      <div className="rw-segment-main">
        <ContactForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default NewContact;
