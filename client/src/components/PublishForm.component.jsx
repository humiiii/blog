import React, { useContext } from "react";
import PageAnimation from "./page.animation";
import { Toaster } from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { EditorContext } from "../pages/Editor.page";

const PublishForm = () => {
  const {
    blog: { banner, title, tags, description },
    setEditorState,
    blog,
    setBlog,
  } = useContext(EditorContext);
  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };
  return (
    <PageAnimation>
      <Toaster />
      <section className="grid min-h-screen w-screen items-center py-16 lg:grid-cols-2 lg:gap-4">
        <button
          onClick={handleCloseEvent}
          className="link hover:bg-gray absolute top-[5%] right-[5vw] z-10 h-10 w-12 cursor-pointer rounded-lg lg:top-[10%]"
        >
          <IoClose className="text-xl" />
        </button>

        <div className="center max-w-[550px]">
          <p className="text-dark-gray mb-1">Preview</p>
          <div className="bg-gray mt-4 aspect-video w-full overflow-hidden rounded-lg">
            <img src={banner} />
          </div>
          <h1 className="mt-2 line-clamp-2 text-4xl leading-tight font-medium">
            {title}
          </h1>
          <p className="font-gelasio mt-4 line-clamp-2 text-xl leading-7">
            {description}
          </p>
        </div>

        <div className="border-gray lg:border-2 lg:pl-8">
          <p className="text-dark-gray mt-9 mb-2">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange}
          />
          <p className="text-dark-gray mt-9 mb-2">
            Short description about your blog
          </p>
        </div>
      </section>
    </PageAnimation>
  );
};

export default PublishForm;
