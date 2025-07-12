"use client";

import { useState, useEffect, useMemo } from "react";

import PostContent from "../../components/shared/PostContent";
import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

import { getPost } from "@/services/post";

export default function PostPage() {
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    getPost().then(setPost);
  }, []);

  if (!post) return null;

  return (
    <article id="printable-content" className="w-[793px] h-[1122px] p-[3cm] pb-[2cm] pl-[3cm] pr-[2cm]">
      <PostContent>
        <TiptapRenderer>{post.content}</TiptapRenderer>
      </PostContent>
    </article>
  );
}
