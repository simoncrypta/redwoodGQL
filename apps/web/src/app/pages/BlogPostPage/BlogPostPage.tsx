"use client";

import { Metadata } from "@/app/redwood/web";

type BlogPostPageProps = {
  id: number;
};

import BlogPostCell from "@/app/components/BlogPostCell/BlogPostCell";

const BlogPostPage = ({ id }: BlogPostPageProps) => {
  return (
    <>
      <Metadata title={`Post ${id}`} description={`Description ${id}`} og />

      <BlogPostCell id={id} />
    </>
  );
};

export default BlogPostPage;
