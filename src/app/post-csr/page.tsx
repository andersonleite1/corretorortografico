"use client";

import { useState, useEffect, useMemo } from "react";

import PostHeader from "../../components/shared/PostHeader";
import PostToc from "../../components/shared/PostToc";
import PostContent from "../../components/shared/PostContent";
import PostSharing from "../../components/shared/PostSharing";
import PostReadingProgress from "../../components/shared/PostReadingProgress";
import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";
import Image from "next/image";

import { getPost } from "@/services/post";
import Link from "next/link";
import { FaEdit, FaEye } from "react-icons/fa";

export default function PostPage() {
  const [post, setPost] = useState<any>(null);

  const readingTime = useMemo(() => {
    const wpm = 150;
    return Math.ceil(post?.wordCount / wpm);
  }, [post]);

  useEffect(() => {
    getPost().then(setPost);
  }, []);

  const formatDateToday = () => {
    const today = new Date();

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(today);
  };

  if (!post) return null;

  return (
    <article className="py-10 px-6 flex flex-col items-center ">
      <PostReadingProgress />
      <PostHeader
        title={post.title}
        author={post.author}
        createdAt={formatDateToday()}
        readingTime={readingTime}
        cover={post.cover}
      />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">
        <PostSharing />
        <PostContent>
          <Link
            className="bg-green-400 hover:bg-green-500 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center w-full sm:w-auto"
            href="/"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Editar Post
          </Link>
          <TiptapRenderer>{post.content}</TiptapRenderer>
        </PostContent>
        <PostToc />
      </div>
      {/* <Image src={"/doraemon.png"} width={350} height={350} alt="" className="mx-auto mt-20" /> */}
    </article>
  );
}
