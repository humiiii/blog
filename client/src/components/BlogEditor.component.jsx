import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import PageAnimation from "./page.animation";
import { EditorContext } from "../pages/Editor.page";
import EditorJS from "@editorjs/editorjs";
import { tools } from "../common/editorJStools";

const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, tags, description },
    setBlog,
    setEditorState,
  } = useContext(EditorContext);

  const defaultBanner = "./images/blogbanner.png";

  const editorRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleOnChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    toast.loading("Uploading image...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}api/upload-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const uploadedUrl = res.data.url;
      setBlog({ ...blog, banner: uploadedUrl });

      toast.dismiss();
      toast.success("Upload successful!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.dismiss();
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: "editorjs",
        data: content,
        tools: tools,
        placeholder:
          "Verily, in the remembrance of Allah do hearts find rest - { 13:28 }",
        onReady: () => {
          console.log("Editor.js is ready to use");
        },
        onChange: async () => {
          try {
            const savedData = await editorRef.current.save();
            setBlog((prev) => ({ ...prev, content: savedData }));
          } catch (err) {
            console.warn("Saving error:", err);
          }
        },
      });
    }
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handlePublishEvent = async () => {
    if (!banner || !banner.length) {
      return toast.error("Upload a blog banner to publish it");
    }
    if (!title || !title.trim().length) {
      return toast.error("Blog title missing");
    }

    try {
      await editorRef.current.isReady;
      const data = await editorRef.current.save();

      if (data.blocks.length > 0) {
        setBlog({ ...blog, content: data });
        setEditorState("publish");
        console.log("Blog content ready for publish:", data);
      } else {
        toast.error("Write something in your blog to publish it");
      }
    } catch (err) {
      console.error("Editor save error:", err);
      toast.error("Failed to save blog content");
    }
  };

  return (
    <>
      <Toaster />
      <nav className="navbar">
        <Link to={"/"} className="flex-none">
          <p className="font-gelasio text-3xl font-medium">Diary</p>
        </Link>
        <p className="line-clamp-1 w-full text-black max-md:hidden">
          {title ? title : "New Blog"}
        </p>
        <div className="ml-auto flex gap-4">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>
      <PageAnimation>
        <section>
          <div className="mx-auto w-full max-w-[900px]">
            <div className="border-gray relative aspect-video border-4 bg-white hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img
                  src={banner || defaultBanner}
                  className="z-20 h-full w-full cursor-pointer object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultBanner;
                  }}
                />
                <input
                  type="file"
                  id="uploadBanner"
                  accept=".png, .jpeg, .jpg"
                  hidden
                  onChange={handleOnChange}
                />
              </label>
            </div>

            <textarea
              name="blogTitle"
              placeholder="Blog Title"
              className="mt-10 h-20 w-full resize-none text-4xl leading-tight font-medium outline-none placeholder:opacity-40"
              onKeyDown={(e) => e.keyCode === 13 && e.preventDefault()}
              onChange={handleTitleChange}
              value={title}
            ></textarea>

            <hr className="my-5 w-full opacity-10" />

            <div className="font-gelasio" id="editorjs"></div>
          </div>
        </section>
      </PageAnimation>
    </>
  );
};

export default BlogEditor;
