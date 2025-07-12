import React, { useState, useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { LuBell, LuFilePen, LuSearch } from "react-icons/lu";

import { UserContext } from "../App";
import UserNavigationPanel from "./UserNavigation.component";
import { Toaster } from "react-hot-toast";

const Navbar = () => {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);

  const { userAuth } = useContext(UserContext);

  const { accessToken, user } = userAuth || {};
  const profile_img = user?.profile_img;
  const fullname = user?.fullname;

  return (
    <>
      <Toaster />
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
          <LuSearch className="text-dark-gray absolute top-1/2 right-[10%] -translate-y-1/2 text-xl md:pointer-events-none md:left-5" />
        </div>

        <div className="text-dark-gray ml-auto flex items-center gap-4 md:gap-5">
          <button
            onClick={() => setSearchBoxVisibility((prev) => !prev)}
            className="bg-gray flex h-10 w-12 cursor-pointer items-center justify-center rounded-lg md:hidden"
          >
            <LuSearch className="text-xl" />
          </button>
          <Link to={"/editor"} className="link hidden gap-2 rounded-lg md:flex">
            <LuFilePen className="text-xl" />
            <p>Write</p>
          </Link>
          {accessToken ? (
            <>
              <Link
                to={"/dashboard/notification"}
                className="flex items-center gap-3"
              >
                <button className="bg-gray flex h-10 w-12 cursor-pointer items-center justify-center rounded-lg">
                  <LuBell className="text-xl" />
                </button>
              </Link>
              <div
                className="relative"
                onClick={() => setUserNavPanel((prev) => !prev)}
                onBlur={() =>
                  setTimeout(() => {
                    setUserNavPanel(false);
                  }, 300)
                }
              >
                <button className="mt-1 h-12 w-12">
                  <img
                    src={profile_img}
                    alt={fullname}
                    className="h-full w-full rounded-lg object-cover"
                  />
                </button>
              </div>
              {userNavPanel && <UserNavigationPanel />}
            </>
          ) : (
            <Link to={"/signin"} className="btn-dark py-2">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Navbar;
