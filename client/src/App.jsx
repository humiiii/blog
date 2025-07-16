import React from "react";
import Navbar from "./components/Navbar.component";
import { Route, Routes } from "react-router-dom";
import UserAuthForm from "./pages/UserAuthForm.page";
import { createContext } from "react";
import { useState, useEffect } from "react";
import { lookSession } from "./common/session";
import EditorPage from "./pages/Editor.page";
import HomePage from "./pages/Home.page";

export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserAuth] = useState({});

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
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type={"signin"} />} />
          <Route path="signup" element={<UserAuthForm type={"signup"} />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
