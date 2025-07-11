import React, { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";

const InputBox = ({ type, name, placeholder, value, id, Icon }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <div className="relative mb-4 w-full">
      <input
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        placeholder={placeholder}
        name={name}
        defaultValue={value}
        id={id}
        className="input-box"
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
    </div>
  );
};

export default InputBox;
