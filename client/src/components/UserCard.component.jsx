import React from "react";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  let {
    personal_info: { fullname, username, profile_img },
  } = user;
  return (
    <Link to={`/user/${username}`} className="mb-5 flex items-center gap-5">
      <img
        src={profile_img}
        alt={`${fullname} profile image`}
        className="h-14 w-14 rounded-lg"
      />
      <div className="">
        <h1 className="line-clamp-2 text-xl font-medium">{fullname}</h1>
        <p className="text-dark-gray text-sm">@{username}</p>
      </div>
    </Link>
  );
};

export default UserCard;
