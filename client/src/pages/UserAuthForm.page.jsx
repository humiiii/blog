import React from "react";
import axios from "axios";
import { storeSession } from "../common/session";
import InputBox from "../components/InputBox.component";
import { LuKeyRound, LuUserRound } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { MdAlternateEmail } from "react-icons/md";
import { Link, Navigate } from "react-router-dom";
import PageAnimation from "../components/page.animation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { useContext } from "react";
import { UserContext } from "../App";

const getSchema = (type) =>
  z.object({
    ...(type !== "signin" && {
      fullname: z.string().min(3, "Full name is required"),
    }),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

const UserAuthForm = ({ type }) => {
  let {
    userAuth: { accessToken },
    setUserAuth,
  } = useContext(UserContext);

  const schema = getSchema(type);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const route = type === "signin" ? "signin" : "signup";
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    try {
      const res = await axios.post(`${serverUrl}/api/auth/${route}`, data);
      toast.success(res.data?.message || "Success!");
      storeSession("user", res.data);
      setUserAuth(res.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        "Something went wrong";
      toast.error(errorMsg);
    }
  };

  return accessToken ? (
    <Navigate to={"/"} />
  ) : (
    <PageAnimation keyValue={type}>
      <Toaster />
      <section className="h-cover flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[80%] max-w-[400px]"
        >
          <h1 className="font-gelasio mb-24 text-center text-4xl capitalize">
            {type == "signin" ? "Welcome Back" : "Join us today"}
          </h1>
          {type != "signin" ? (
            <InputBox
              name={"fullname"}
              type={"text"}
              placeholder={"Full Name"}
              Icon={LuUserRound}
              register={register}
              error={errors.fullname?.message}
            />
          ) : (
            ""
          )}

          <InputBox
            name={"email"}
            type={"email"}
            placeholder={"Email"}
            Icon={MdAlternateEmail}
            register={register}
            error={errors.email?.message}
          />
          <InputBox
            name={"password"}
            type={"password"}
            placeholder={"Password"}
            Icon={LuKeyRound}
            register={register}
            error={errors.password?.message}
          />

          <button className="btn-dark center mt-14 w-full" type="submit">
            {type}
          </button>

          {/* <div className="relative my-10 flex w-full items-center gap-2 font-bold text-black uppercase opacity-10">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div> */}

          {/* <button className="btn-dark flex w-full items-center justify-center gap-4">
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button> */}

          {type == "signin" ? (
            <p className="text-dark-gray mt-6 text-center text-xl">
              Don't have an account ?{" "}
              <Link
                to={"/signup"}
                className="font-gelasio ml-1 text-xl text-black underline"
              >
                Join Us Today
              </Link>
            </p>
          ) : (
            <p className="text-dark-gray mt-6 text-center text-xl">
              Already a member ?{" "}
              <Link
                to={"/signin"}
                className="font-gelasio ml-1 text-xl text-black underline"
              >
                Sign In
              </Link>
            </p>
          )}
        </form>
      </section>
    </PageAnimation>
  );
};

export default UserAuthForm;
