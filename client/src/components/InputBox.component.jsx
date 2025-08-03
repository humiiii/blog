import React, { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";

const InputBox = ({
  type,
  name,
  placeholder,
  value,
  id,
  Icon,
  register,
  error,
  disable = false,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className="relative mb-8 w-full">
      <input
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        name={name}
        defaultValue={value}
        id={id}
        className="input-box"
        disabled={disable}
        {...(typeof register === "function" ? register(name) : {})}
      />
      <Icon className={"input-icon"} />
      {type === "password" && (
        <span
          className="input-icon right-5 left-[auto] cursor-pointer"
          onClick={() => setPasswordVisible((prev) => !prev)}
        >
          {passwordVisible ? <LuEye /> : <LuEyeClosed />}
        </span>
      )}
      {error && (
        <span className="absolute -bottom-5 left-0 text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default InputBox;
