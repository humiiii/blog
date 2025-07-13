import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor.component";
import PublishForm from "../components/PublishForm.component";

const EditorPage = () => {
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const [editorState, setEditorState] = useState("editor");

  return !accessToken ? (
    <Navigate to={"/signin"} />
  ) : editorState ? (
    <BlogEditor />
  ) : (
    <PublishForm />
  );
};

export default EditorPage;
