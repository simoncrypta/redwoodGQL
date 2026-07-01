"use client";

import BlogPostCell from "@/components/BlogPostCell/BlogPostCell";

type BlogPostPageProps = {
  id: number;
};

const BlogPostPage = ({ id }: BlogPostPageProps) => {
  return <BlogPostCell id={id} />;
};

export default BlogPostPage;
