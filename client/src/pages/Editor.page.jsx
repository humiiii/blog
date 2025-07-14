import React, { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor.component";
import PublishForm from "../components/PublishForm.component";

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

  return (
    <EditorContext.Provider
      value={{ blog, setBlog, editorState, setEditorState }}
    >
      {!accessToken ? (
        <Navigate to={"/signin"} />
      ) : editorState ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default EditorPage;
