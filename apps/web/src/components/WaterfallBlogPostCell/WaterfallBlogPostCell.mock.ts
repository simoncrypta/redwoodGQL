export const standard = () => ({
  waterfallBlogPost: {
    __typename: "Post" as const,
    author: {
      __typename: "User" as const,
      email: "se7en@7.com",
      fullName: "Se7en Lastname",
    },
    authorId: 7,
    body: "Mocked body",
    createdAt: "2022-01-17T13:57:51.607Z",
    id: 42,
    title: "Mocked title",
  },
});
