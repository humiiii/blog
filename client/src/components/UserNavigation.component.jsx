import React, { useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { LuFilePen } from "react-icons/lu";
import { UserContext } from "../App";
import { removeSession } from "../common/session";
import toast from "react-hot-toast";

const UserNavigationPanel = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  let User = userAuth.user;
  let username = User.username;

  const handleSignOut = () => {
    removeSession("user");
    setUserAuth({ accessToken: null });
    toast("Signed out", { icon: "☺️" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: "linear" }}
        className="border-gray absolute top-full right-0 w-60 overflow-hidden border bg-white duration-200"
      >
        <Link
          to={"/editor"}
          className="link flex gap-2 rounded-lg py-4 pl-8 md:hidden"
        >
          <LuFilePen className="text-xl" />
          <p>Write</p>
        </Link>
        <Link className="link py-4 pl-8" to={`/user/${username}`}>
          <p>Profile</p>
        </Link>
        <Link className="link py-4 pl-8" to={`/dashboard/blogs`}>
          <p>Dashboard</p>
        </Link>
        <Link className="link py-4 pl-8" to={`/settings/edit-profile`}>
          <p>Settings</p>
        </Link>
        <button
          onClick={handleSignOut}
          className="hover:bg-gray border-gray w-full cursor-pointer border-t py-4 pl-8 text-left"
        >
          <h1 className="mb-1 text-lg font-bold">Sign out</h1>
          <p className="text-dark-gray">@{username}</p>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserNavigationPanel;
