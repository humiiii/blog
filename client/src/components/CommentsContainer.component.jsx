import React, { useContext } from "react";
import { BlogContext } from "../pages/Blog.page";
import { IoClose } from "react-icons/io5";
import CommentField from "./CommentField.component";
import Nodata from "./Nodata.component";
import PageAnimation from "./page.animation";
import CommentCard from "./CommentCard.component";
import axios from "axios";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFunction, comment_array = null }) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/blogs/get-blog-comments`,
      { blog_id, skip }
    );

    
    
    const data = response.data || {};
let results = Array.isArray(data.results) ? data.results : [];
let activity = data.activity || {};


results.forEach(comment => {
  comment.childrenLevel = 0;
});

if (setParentCommentCountFunction && results.length) {  
  setParentCommentCountFunction(prev => prev + results.length);
}

const combinedResults = comment_array === null ? results : [...comment_array, ...results];

    return { results: combinedResults, activity };
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return { results: comment_array || [], activity: {} };
  }
};


const CommentsContainer = () => {
  const {
    blog,
    commentsWrapper,
    setCommentsWrapper,
    blog:{activity},
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const total_parent_comments = activity?.total_parent_comments ?? 0;
  const title = blog?.title || "";
  const description = blog?.description || "";
  const commentsArray = blog?.comments?.results || [];    
    

  // Load more handler
  const loadMoreHandler = async () => {
    const { results, activity: freshActivity } = await fetchComments({
      blog_id: blog._id,
      skip: totalParentCommentsLoaded,
      setParentCommentCountFunction: setTotalParentCommentsLoaded, 
      comment_array: commentsArray,
    });

    setBlog(prevBlog => ({
      ...prevBlog,
      comments: { ...prevBlog.comments, results },
      activity: { ...prevBlog.activity, ...freshActivity },
    }));

    // If you don't use setParentCommentCountFunction, update loaded count here:
    setTotalParentCommentsLoaded(prev => prev + results.length);
  };

  return (
    <div className={`${commentsWrapper ? "top-0 sm:right-0" : "top-full sm:-right-full"} fixed z-50 h-full w-[30%] min-w-[350px] overflow-x-hidden overflow-y-auto bg-white p-8 px-16 shadow-2xl duration-700 max-sm:right-0 max-sm:w-full sm:top-0`}>
   <div className="relative mb-6">
        <h1 className="text-xl font-medium">{title}</h1>
        {/* Description can have styling with truncation */}
        <p className="text-dark-gray mt-1 line-clamp-2 w-[80%]">{description}</p>
        <button
          onClick={() => setCommentsWrapper(prev => !prev)}
          aria-label="Close comments"
          className="bg-gray absolute top-0 right-0 flex h-12 w-12 items-center justify-center rounded-lg"
        >
          <IoClose className="text-xl" />
        </button>
      </div>

      <CommentField action={"Comment"} />

      {commentsArray && commentsArray.length ? (
        commentsArray.map((comment, index) => (
          <PageAnimation key={index}>
            <CommentCard leftVal={comment.childrenLevel * 4} commentData={comment} index={index} />
          </PageAnimation>
        ))
      ) : (
        <Nodata message="No Comments..." />
      )}

      {total_parent_comments > totalParentCommentsLoaded && (
        <button onClick={loadMoreHandler} className="btn-load-more">
          Load more...
        </button>
      )}
    </div>
  );
};


export default CommentsContainer;
