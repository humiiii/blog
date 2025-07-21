import React from "react";
import pageNotFoundImage from "/images/404.png";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="h-cover relative flex flex-col items-center gap-20 p-10 text-center">
      <img
        src={pageNotFoundImage}
        className="border-gray aspect-square w-72 rounded-lg border-2 object-cover select-none"
      />
      <h1 className="font-gelasio text-4xl leading-7">Page Not Found</h1>
      <p className="text-dark-gray -mt-8 text-xl leading-7">
        The page you are looking for does not exist. Head back to the{" "}
        <Link to={"/"} className="font-gelasio text-xl text-black underline">
          Home Page
        </Link>
      </p>
      <div className="mt-auto">
        <p className="text-dark-gray mt-5">
          {`" Surely with hardship comes ease " {Surah Ash-Sharh (94:6)}`}
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
