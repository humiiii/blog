import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { LuFilePen } from "react-icons/lu";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  return (
    <nav className="navbar">
      <Link to={"/"} className="flex-none">
        <p className="font-gelasio text-3xl font-medium">Diary</p>
      </Link>

      <div
        className={`border-gray absolute top-full left-0 mt-0.5 w-full border-b bg-white px-[5vw] py-4 md:pointer-events-auto md:relative md:inset-0 md:block md:w-auto md:border-0 md:p-0 md:opacity-100 ${searchBoxVisibility ? "show" : "hide"}`}
      >
        <input
          type="text"
          placeholder="Search"
          className="bg-gray placeholder:text-dark-gray w-full rounded-lg p-4 pr-[12%] pl-6 md:w-auto md:pr-6 md:pl-13"
        />
        <BsSearch className="text-dark-gray absolute top-1/2 right-[10%] -translate-y-1/2 text-xl md:pointer-events-none md:left-5" />
      </div>

      <div className="text-dark-gray ml-auto flex items-center gap-3 md:gap-6">
        <button
          onClick={() => setSearchBoxVisibility((prev) => !prev)}
          className="cursor-pointer md:hidden"
        >
          <BsSearch className="text-xl" />
        </button>
        <Link to={"/editor"} className="link hidden gap-2 rounded-lg md:flex">
          <LuFilePen className="text-xl" />
          <p>Write</p>
        </Link>
        <Link to={"/signin"} className="btn-dark py-2">
          Sign In
        </Link>
        <Link to={"/signin"} className="btn-light hidden py-2 md:block">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
