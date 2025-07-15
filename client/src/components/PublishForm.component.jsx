import React, { useContext } from "react";
import PageAnimation from "./page.animation";
import toast, { Toaster } from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { EditorContext } from "../pages/Editor.page";
import Tag from "./Tag.componen";

const characterLimit = 200;
const tagsLimit = 10;

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

  const handleBlogDescriptionChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, description: input.value });
  };

  const handleTagKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();

      let tag = e.target.value;

      if (tags.length < tagsLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagsLimit} tags`);
      }

      e.target.value = "";
    }
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
          <p className="font-gelasio mt-4 line-clamp-2 w-full text-xl leading-7">
            {description}
          </p>
        </div>

        <div className="border-gray lg:border-2 lg:p-4">
          <p className="text-dark-gray mb-2 lg:mt-9">Blog Title</p>
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
          <textarea
            maxLength={characterLimit}
            defaultValue={description}
            className="input-box h-40 resize-none pl-4 leading-7"
            onChange={handleBlogDescriptionChange}
            onKeyDown={(e) => e.keyCode === 13 && e.preventDefault()}
          ></textarea>
          <p className="text-dark-gray mt-1 text-right text-sm">
            {characterLimit - description.length} characters left
          </p>

          <p className="text-dark-gray mt-9 mb-2">
            Tags {`{ Helps in search and ranking your blog }`}
          </p>
          <div className="input-box relative mb-4 py-2 pl-2">
            <input
              type="text"
              placeholder="Tags"
              className="input-box sticky top-0 left-0 mb-3 bg-white pl-4 focus:bg-white"
              onKeyDown={handleTagKeyDown}
            />
            {tags.map((tag, index) => (
              <Tag tag={tag} key={index} tagIndex={index} />
            ))}
          </div>

          <p className="text-dark-gray mt-1 mb-4 text-right">
            {tagsLimit - tags.length} tags left
          </p>
          <button className="btn-dark w-full">Publish</button>
        </div>
      </section>
    </PageAnimation>
  );
};

export default PublishForm;
