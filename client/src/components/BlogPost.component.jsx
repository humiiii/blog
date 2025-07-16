import React from "react";
import { format } from "date-fns";
import { FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const BlogPost = ({ content, author }) => {
  if (!content || !author) return null;

  const {
    publishedAt,
    tags = [],
    title = "",
    description = "",
    banner = "",
    activity: { total_likes = 0 } = {},
    blog_id: id,
  } = content;

  const {
    fullname = "Unknown Author",
    profile_img = "/default-profile.png",
    username = "unknown",
  } = author;

  return (
    <Link
      to={`/blog/${id}`}
      className="border-gray mb-4 flex items-center gap-8 border-b pb-5"
    >
      <div className="w-full">
        <div className="text-dark-gray mb-7 flex items-center gap-2 text-sm">
          <img
            src={profile_img}
            alt={`${fullname}'s profile`}
            className="h-6 w-6 rounded-lg object-cover"
          />
          <p className="line-clamp-1">
            {fullname} @{username}
          </p>
          <p className="min-w-fit">
            {format(new Date(publishedAt), "dd MMM yyyy")}
          </p>
        </div>

        <h1 className="blog-title">{title}</h1>
        <p className="font-gelasio my-3 line-clamp-2 text-xl leading-7 max-sm:hidden md:max-[1100px]:hidden">
          {description}
        </p>

        <div className="mt-7 flex items-center gap-4">
          {tags[0] && (
            <span className="btn-light border-none px-4 py-1 text-sm capitalize">
              {tags[0]}
            </span>
          )}
          <span className="text-dark-gray ml-3 flex items-center gap-2">
            <FaHeart />
            {total_likes}
          </span>
        </div>
      </div>

      <div className="bg-gray aspect-square h-28">
        <img
          src={banner || "/default-banner.png"}
          alt="Blog Banner"
          className="aspect-square h-full w-full rounded-lg object-cover"
        />
      </div>
    </Link>
  );
};

export default BlogPost;
