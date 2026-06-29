export const standard = () => ({
  blogPost: {
    __typename: "Post" as const,
    author: {
      __typename: "User" as const,
      email: "five@5.com",
      fullName: "Five Lastname",
    },
    authorId: 5,
    body: "Mocked body",
    createdAt: "2022-01-17T13:57:51.607Z",
    id: 42,
    title: "Mocked title",
  },
});
