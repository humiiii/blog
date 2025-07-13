import React, { useRef, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import PageAnimation from "./page.animation";

const BlogEditor = () => {
  const BlogBannerRef = useRef(null);
  const defaultBanner = "./images/blogbanner.png";

  const [imageUrl, setImageUrl] = useState("");
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
      setImageUrl(uploadedUrl);

      if (BlogBannerRef.current) {
        BlogBannerRef.current.src = uploadedUrl;
      }

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
  };

  return (
    <>
      <Toaster />
      <nav className="navbar">
        <Link to={"/"} className="flex-none">
          <p className="font-gelasio text-3xl font-medium">Diary</p>
        </Link>
        <p className="line-clamp-1 w-full text-black max-md:hidden">New Blog</p>
        <div className="ml-auto flex gap-4">
          <button className="btn-dark py-2">Publish</button>
          <button className="btn-light py-2">Save Draft</button>
        </div>
      </nav>
      <PageAnimation>
        <section>
          <div className="mx-auto w-full max-w-[900px]">
            <div className="border-gray relative aspect-video border-4 bg-white hover:opacity-80">
              <label htmlFor="uploadBanner">
                <img
                  ref={BlogBannerRef}
                  src={defaultBanner}
                  className="z-20 cursor-pointer"
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
              onKeyDown={(e) => e.keyCode == 13 && e.preventDefault()}
              onChange={handleTitleChange}
            ></textarea>
          </div>
        </section>
      </PageAnimation>
    </>
  );
};

export default BlogEditor;
