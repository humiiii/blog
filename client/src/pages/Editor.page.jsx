import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor.component";
import PublishForm from "../components/PublishForm.component";
import Loader from "../components/Loader.component";
import axios from "axios";

const BlogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  description: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const EditorPage = () => {
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const [blog, setBlog] = useState(BlogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const { blogId } = useParams();
  const [loading, setLoading] = useState(true);

  const getEditBlog = async () => {
    if (!blogId) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/blogs/get-blog`,
        {
          blogId,
          draft: true,
          mode: "edit",
        },
      );

      if (response.data?.success && response.data.blog) {
        setBlog(response.data.blog);
        console.log(blog);
      } else {
        console.error("Failed to fetch blog:", response.data?.error);
      }
    } catch (error) {
      console.error("Error fetching blog for edit:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEditBlog();
  }, [blogId]);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {!accessToken ? (
        <Navigate to={"/signin"} />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : editorState === "publish" ? (
        <PublishForm />
      ) : null}
    </EditorContext.Provider>
  );
};

export default EditorPage;
