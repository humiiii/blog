import React from "react";
import InputBox from "../components/InputBox.component";
import { LuKeyRound, LuUserRound } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { MdAlternateEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import PageAnimation from "../components/page.animation";

const UserAuthForm = ({ type }) => {
  return (
    <PageAnimation keyValue={type}>
      <section className="h-cover flex items-center justify-center">
        <form action="" className="w-[80%] max-w-[400px]">
          <h1 className="font-gelasio mb-24 text-center text-4xl capitalize">
            {type == "signin" ? "Welcome Back" : "Join us today"}
          </h1>
          {type != "signin" ? (
            <InputBox
              name={"fullname"}
              type={"text"}
              placeholder={"Full Name"}
              Icon={LuUserRound}
            />
          ) : (
            ""
          )}

          <InputBox
            name={"email"}
            type={"email"}
            placeholder={"Email"}
            Icon={MdAlternateEmail}
          />
          <InputBox
            name={"password"}
            type={"password"}
            placeholder={"Password"}
            Icon={LuKeyRound}
          />

          <button className="btn-dark center mt-14 w-full" type="submit">
            {type}
          </button>

          <div className="relative my-10 flex w-full items-center gap-2 font-bold text-black uppercase opacity-10">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button className="btn-dark flex w-full items-center justify-center gap-4">
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>

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
