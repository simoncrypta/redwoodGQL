"use client";

import WaterfallBlogPostCell from "@/app/components/WaterfallBlogPostCell/WaterfallBlogPostCell";

type WaterfallPageProps = {
  id: number;
};

const WaterfallPage = ({ id }: WaterfallPageProps) => <WaterfallBlogPostCell id={id} />;

export default WaterfallPage;
