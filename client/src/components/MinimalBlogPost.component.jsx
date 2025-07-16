import React from "react";
import { Link } from "react-router-dom";

const MinimalBlogPost = ({ blog, index }) => {
  let {
    title,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img },
    },
    publishedAt,
  } = blog;

  return (
    <Link to={`/blog/${id}`} className="mb-4 flex gap-5">
      <h1>{index < 10 ? 0 + (index + 1) : index}</h1>
    </Link>
  );
};

export default MinimalBlogPost;
