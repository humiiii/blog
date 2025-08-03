import React from "react";
import Navbar from "./components/Navbar.component";
import { Route, Routes } from "react-router-dom";
import UserAuthForm from "./pages/UserAuthForm.page";
import { createContext } from "react";
import { useState, useEffect } from "react";
import { lookSession } from "./common/session";
import EditorPage from "./pages/Editor.page";
import HomePage from "./pages/Home.page";
import Search from "./pages/Search.page";
import PageNotFound from "./pages/404.page";
import Profile from "./pages/Profile.page";
import BlogPage from "./pages/Blog.page";
import SideNavbar from "./components/SideNavbar.component";
import ChangePassword from "./pages/ChangePassword.page";
import EditProfile from "./pages/EditProfile.page";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState(null);

  useEffect(() => {
    const userInSession = lookSession("user");

    userInSession
      ? setUserAuth(userInSession)
      : setUserAuth({ accessToken: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:blogId" element={<EditorPage />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SideNavbar />}>
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="signin" element={<UserAuthForm type={"signin"} />} />
          <Route path="signup" element={<UserAuthForm type={"signup"} />} />
          <Route path="search/:query" element={<Search />} />
          <Route path="user/:id" element={<Profile />} />
          <Route path="blog/:blogId" element={<BlogPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
