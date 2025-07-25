import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

import Loader from "../components/Loader.component";
import PageAnimation from "../components/page.animation";
import BlogInteraction from "../components/BlogInteraction.component";
import BlogPost from "../components/BlogPost.component";
import BlogContent from "../components/BlogContent.component";

export const blogStructure = {
  activity: {
    total_likes: 0,
    total_comments: 0,
    total_reads: 0,
    total_parent_comments: 0,
  },
  _id: "",
  blog_id: "",
  title: "",
  banner: "",
  description: "",
  tags: [],
  content: {
    time: Date.now(),
    blocks: [],
    version: "2.31.0-rc.7",
  },
  author: {
    personal_info: {
      fullname: "",
      username: "",
      profile_img: "",
    },
    _id: "",
  },
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blogId } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  const [similarBlogs, setSimilarBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);

  const {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, profile_img, username },
    },
    publishedAt,
  } = blog;

  const fetchBlog = async () => {
    if (!blogId) {
      toast.error("Blog ID is missing.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/get-blog`,
        { blogId },
      );

      if (response?.data?.success && response.data.blog) {
        const blogData = response.data.blog;
        setBlog(blogData); // Fetch similar blogs now that we have tags

        if (blogData?.tags?.length) {
          const { data: similarRes } = await axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/search/search-blogs`,
            {
              tag: blogData.tags[0],
              limit: 5,
              currentBlog: blogId,
            },
          );

          if (similarRes?.success && Array.isArray(similarRes.blogs)) {
            setSimilarBlogs(similarRes.blogs);
          }
        }
      } else {
        toast.error(response.data.error || "Failed to fetch blog.");
      }
    } catch (error) {
      console.error("fetchBlog error:", error);
      toast.error("Something went wrong while fetching the blog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <PageAnimation>
      <BlogContext.Provider
        value={{ blog, setBlog, isLikedByUser, setIsLikedByUser }}
      >
        <div className="center max-w-[900px] py-10 max-lg:px-[5vw]">
          <img
            src={banner}
            className="aspect-video rounded-lg"
            alt="Blog Banner"
          />
          <div className="mt-12">
            <h2>{title}</h2>
            <div className="my-8 flex justify-between max-sm:flex-col">
              <div className="flex items-start gap-5">
                <img src={profile_img} className="h-12 w-12 rounded-lg" />

                <p className="capitalize">
                  {fullname} <br />
                  <span className="text-dark-gray text-sm">
                    @
                    <Link to={`/user/${username}`} className="underline">
                      {username}
                    </Link>
                  </span>
                </p>
              </div>

              <p className="text-dark-gray opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                Published on
                {publishedAt && format(new Date(publishedAt), "dd MMM")}
              </p>
            </div>
          </div>
          <BlogInteraction />
          <div className="font-gelasio blog-page-content my-12">
            <BlogContent blocks={content.blocks} />
          </div>
          <BlogInteraction />
          {similarBlogs.length > 0 && (
            <>
              <h1 className="mt-14 mb-10 text-2xl font-medium">
                Similar Blogs
              </h1>
              {similarBlogs.map((blog, index) => {
                let {
                  author: { personal_info },
                } = blog;
                return (
                  <PageAnimation
                    key={index}
                    transition={{ duration: 1, delay: index * 0.08 }}
                  >
                    <BlogPost content={blog} author={personal_info} />
                  </PageAnimation>
                );
              })}
            </>
          )}
        </div>
      </BlogContext.Provider>
    </PageAnimation>
  );
};

export default BlogPage;
