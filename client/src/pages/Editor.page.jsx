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
  const [textEditor, setTextEditor] = useState({ isReady: false });

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
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : editorState === "publish" ? (
        <PublishForm />
      ) : null}
    </EditorContext.Provider>
  );
};

export default EditorPage;
