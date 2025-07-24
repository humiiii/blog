// importing tools from EditorJS

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import Inline from "@editorjs/inline-code";
import axios from "axios";

const handleUploadByFile = async (e) => {
  const formData = new FormData();
  formData.append("image", e);
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/image/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    const url = res.data.url;
    if (url) {
      return { success: 1, file: { url } };
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
};

const handleUploadByUrl = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (error) {
      reject(error);
    }
  });
  return link.then((url) => {
    return { success: 1, file: { url } };
  });
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: handleUploadByUrl,
        uploadByFile: handleUploadByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Your heading here...",
      levels: [2, 3],
      default: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: Inline,
};
