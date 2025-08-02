import React, { useContext, useState, useRef, useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { UserContext } from "../App";
import { LuBookA, LuFilePen } from "react-icons/lu";
import { FaBarsStaggered, FaRegBell } from "react-icons/fa6";
import { MdOutlineLockPerson } from "react-icons/md";
import { LiaUserEditSolid } from "react-icons/lia";

const SideNavbar = () => {
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const location = useLocation();
  const page = location.pathname.split("/")[2] || "";

  const [pageState, setPageState] = useState(page.replace("-", " ") || "");
  const [showSideNav, setshowSideNav] = useState(false);

  const activeTabLine = useRef(null);
  const sideBarIconTab = useRef(null);
  const pageStateTab = useRef(null);

  const handleChangePageState = (e) => {
    const { offsetWidth, offsetLeft } = e.target;

    if (activeTabLine.current) {
      activeTabLine.current.style.width = offsetWidth + "px";
      activeTabLine.current.style.left = offsetLeft + "px";
    }

    if (e.target === sideBarIconTab.current) {
      setshowSideNav(true);
    } else {
      setshowSideNav(false);
    }
  };

  useEffect(() => {
    setshowSideNav(false);
    if (pageStateTab.current) {
      pageStateTab.current.click();
    }
  }, [pageState]);

  if (accessToken == null) {
    return <Navigate to={"/signin"} />;
  }

  return (
    <>
      <section className="relative m-0 flex gap-10 py-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          {/* Mobile Top Bar */}
          <div className="border-gray flex flex-nowrap overflow-x-auto border-b bg-white py-1 md:hidden">
            <button
              ref={sideBarIconTab}
              onClick={handleChangePageState}
              className="p-5 capitalize"
            >
              <FaBarsStaggered className="pointer-events-none" />
            </button>
            <button
              ref={pageStateTab}
              onClick={handleChangePageState}
              className="p-5 capitalize"
            >
              {pageState}
            </button>
            <hr
              ref={activeTabLine}
              className="absolute bottom-0 duration-500"
            />
          </div>
          {/* Side Nav */}
          <div
            className={`md:h-cover h-[calc(100vh - 80px - 60px )] md:border-gray max-md:w-[calc(100% + 80px)] absolute top-24 min-w-[200px] overflow-y-auto bg-white p-6 duration-500 max-md:top-[64px] max-md:-ml-7 max-md:px-16 md:sticky md:border-r md:pr-0 ${!showSideNav ? "max-md:pointer-events-none max-md:opacity-0" : "pointer-events-auto opacity-100"}`}
          >
            <h1 className="text-dark-gray mb-3 text-xl">Dashboard</h1>
            <hr className="border-gray mr-6 mb-8 -ml-6" />

            <NavLink
              className={"sidebar-link"}
              to={"/dashboard/blogs"}
              onClick={(e) => setPageState(e.target.innerText)}
            >
              <LuBookA />
              Blogs
            </NavLink>
            <NavLink
              className={"sidebar-link"}
              to={"/dashboard/notification"}
              onClick={(e) => setPageState(e.target.innerText)}
            >
              <FaRegBell />
              Notification
            </NavLink>
            <NavLink
              className={"sidebar-link"}
              to={"/editor"}
              onClick={(e) => setPageState(e.target.innerText)}
            >
              <LuFilePen />
              Write
            </NavLink>

            <h1 className="text-dark-gray mt-20 mb-3 text-xl">Settings</h1>
            <hr className="border-gray mr-6 mb-8 -ml-6" />

            <NavLink
              className={"sidebar-link"}
              to={"/settings/edit-profile"}
              onClick={(e) => setPageState(e.target.innerText)}
            >
              <LiaUserEditSolid />
              Edit Profile
            </NavLink>
            <NavLink
              className={"sidebar-link"}
              to={"/settings/change-password"}
              onClick={(e) => setPageState(e.target.innerText)}
            >
              <MdOutlineLockPerson />
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="mt-5 w-full max-md:-mt-8">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNavbar;
