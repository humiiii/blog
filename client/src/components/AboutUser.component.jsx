import { format } from "date-fns";
import React from "react";
import {
  FaFacebookSquare,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const AboutUser = ({ bio, social_links, joinedAt, className }) => {
  const socialIcons = {
    linkedin: <FaLinkedin className="text-2xl hover:text-black" />,
    instagram: <FaInstagram className="text-2xl hover:text-black" />,
    facebook: <FaFacebookSquare className="text-2xl hover:text-black" />,
    twitter: <FaTwitter className="text-2xl hover:text-black" />,
    github: <FaGithub className="text-2xl hover:text-black" />,
    website: <FaGlobe className="text-2xl hover:text-black" />,
  };

  return (
    <div className={`md:mt-7 md:w-[90%] ${className}`}>
      <p className="text-xl leading-7">
        {bio.length ? bio : "Nothing to read here"}
      </p>
      <div className="text-dark-gray my-7 flex flex-wrap items-center gap-x-7 gap-y-2">
        {Object.keys(social_links).map((key) => {
          const link = social_links[key];
          if (!link) return null;

          return (
            <Link
              to={link}
              key={key}
              target="_blank"
              className="flex items-center gap-2"
            >
              {socialIcons[key]}
            </Link>
          );
        })}
      </div>
      <p className="text-dark-gray text-xl leading-7">
        Joined on {joinedAt && format(new Date(joinedAt), "dd MMM yyyy")}
      </p>
    </div>
  );
};

export default AboutUser;
