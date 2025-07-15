import React, { useContext } from "react";
import { IoClose } from "react-icons/io5";
import { EditorContext } from "../pages/Editor.page";

const Tag = ({ tag, tagIndex }) => {
  let {
    blog: { tags },
    blog,
    setBlog,
  } = useContext(EditorContext);

  const handleTagDelete = () => {
    tags = tags.filter((t) => t != tag);
    setBlog({ ...blog, tags });
  };

  const handleTagEdit = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();

      let currentTag = e.target.innerText;

      tags[tagIndex] = currentTag;

      setBlog({ ...blog, tags });
      e.target.setAttribute("contentEditable", false);
    }
  };

  const handleEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  return (
    <div className="relative mt-2 mr-2 inline-block rounded-full bg-white p-2 px-5 pr-10 hover:bg-white/50">
      <p
        className="outline-none"
        onClick={handleEditable}
        onKeyDown={handleTagEdit}
      >
        {tag}
      </p>
      <button
        className="absolute top-1/2 right-3 mt-0.5 -translate-y-1/2 rounded-full"
        onClick={handleTagDelete}
      >
        <IoClose className="pointer-events-none text-sm" />
      </button>
    </div>
  );
};

export default Tag;
