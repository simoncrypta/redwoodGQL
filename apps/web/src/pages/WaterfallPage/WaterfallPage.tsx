"use client";

import WaterfallBlogPostCell from "@/components/WaterfallBlogPostCell/WaterfallBlogPostCell";

type WaterfallPageProps = {
  id: number;
};

const WaterfallPage = ({ id }: WaterfallPageProps) => <WaterfallBlogPostCell id={id} />;

export default WaterfallPage;
