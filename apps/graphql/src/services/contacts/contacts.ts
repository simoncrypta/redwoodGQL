import { buildContact, contacts as fixtureContacts, patchContact } from "../../data/fixtures.js";
import type {
  Contact,
  CreateContactInput,
  ServiceResolver,
  UpdateContactInput,
} from "../../types.js";

export const contacts: ServiceResolver<readonly Contact[]> = () => fixtureContacts;

export const contact: ServiceResolver<Contact | null, { readonly id: number }> = ({ id }) =>
  fixtureContacts.find((item) => item.id === id) ?? null;

export const createContact: ServiceResolver<Contact, { readonly input: CreateContactInput }> = ({
  input,
}) => buildContact(input);

export const updateContact: ServiceResolver<
  Contact,
  { readonly id: number; readonly input: UpdateContactInput }
> = ({ id, input }) => patchContact(id, input);

export const deleteContact: ServiceResolver<Contact, { readonly id: number }> = ({ id }) =>
  fixtureContacts.find((item) => item.id === id) ?? fixtureContacts[0];
