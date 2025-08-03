import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./Profile.page";
import PageAnimation from "../components/page.animation";
import Loader from "../components/Loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/InputBox.component";
import { LuUser } from "react-icons/lu";
import { MdAlternateEmail } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import {
  FaFacebookSquare,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import { storeSession } from "../common/session";

const bioLimit = 150;

const socialIcons = {
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  facebook: FaFacebookSquare,
  twitter: FaTwitter,
  github: FaGithub,
  website: FaGlobe,
};

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { accessToken, user },
    setUserAuth,
  } = useContext(UserContext);

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);

  // Form state
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);

  const personal_info = profile?.personal_info || {};
  const {
    fullname,
    username: profile_username,
    profile_img,
    email,
    bio,
  } = personal_info;

  const social_links = profile?.social_links || {};

  // Image refs
  const profileImageRef = useRef();
  const fileInputRef = useRef();
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    let isCancelled = false;

    const fetchProfile = async () => {
      if (!accessToken || !user?.username) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/user/get-profile`,
          { username: user.username },
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!isCancelled) {
          setProfile(response.data.user);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoading(false);
        }
        console.error("Failed to fetch profile:", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isCancelled = true;
    };
  }, [accessToken, user?.username]);

  // Bio chars count
  const handleBioChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  // Handle image preview
  const handlePreviewImage = (e) => {
    const img = e.target.files?.[0];
    if (!img) return;
    // Show image preview
    if (profileImageRef.current) {
      profileImageRef.current.src = URL.createObjectURL(img);
    }
    setUpdatedProfileImage(img);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    const file = updatedProfileImage;
    if (!file) return toast.error("No image selected.");

    setUploading(true);
    const loadingToast = toast.loading("Uploading image...");
    try {
      // Upload to your image server
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/image/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const uploadedUrl = uploadRes.data.url;
      if (!uploadedUrl) throw new Error("No image URL returned from server");

      // Update profile image on user
      const updateRes = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/update-profile-image`,
        { uploadedUrl },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const updatedProfileImg = updateRes.data.profile_img;
      // Update context and session state
      const newUserAuth = {
        ...userAuth,
        user: { ...userAuth.user, profile_img: updatedProfileImg },
      };
      storeSession("user", newUserAuth);
      setUserAuth(newUserAuth);

      setUpdatedProfileImage(null);
      // Optionally update preview to the freshly uploaded image
      if (profileImageRef.current) profileImageRef.current.src = uploadedUrl;
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.dismiss(loadingToast);
      toast.success("Profile image updated!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.dismiss(loadingToast);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageAnimation>
      <Toaster />
      {loading ? (
        <Loader />
      ) : (
        <form>
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col items-start gap-8 py-10 lg:flex-row lg:gap-10">
            {/* Profile picture uploader */}
            <div className="max-lg:center relative mb-5">
              <label
                htmlFor="uploading"
                id="profileImgLabel"
                className="relative cursor-pointer"
                aria-label="Upload profile image"
              >
                <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity hover:opacity-100">
                  Upload Image
                </div>
                <img
                  ref={profileImageRef}
                  src={profile_img}
                  alt={
                    fullname ? `Profile image of ${fullname}` : "Profile image"
                  }
                  className="bg-gray block h-48 w-48 overflow-hidden rounded-lg"
                />
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="uploading"
                accept=".jpeg,.png,.jpg"
                hidden
                onChange={handlePreviewImage}
              />
              <div>
                <button
                  onClick={handleImageUpload}
                  type="button"
                  className="btn-light max-lg:center mt-5 px-10 lg:w-full"
                  disabled={uploading || !updatedProfileImage}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <InputBox
                  name="fullname"
                  type="text"
                  value={fullname}
                  placeholder="Full Name"
                  disable={true}
                  Icon={LuUser}
                />
                <InputBox
                  name="email"
                  type="email"
                  value={email}
                  placeholder="Email"
                  disable={true}
                  Icon={IoMailOutline}
                />
              </div>
              <InputBox
                type="text"
                name="username"
                value={profile_username}
                placeholder="Username"
                Icon={MdAlternateEmail}
              />
              <p className="text-dark-gray -mb-3">
                Username will be used to search user and will be visible to all
                users
              </p>
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box mt-5 h-64 resize-none pl-5 leading-7 lg:h-40"
                placeholder="Bio"
                onChange={handleBioChange}
              ></textarea>
              <p className="text-dark-gray mt-1">
                {charactersLeft} Characters Left
              </p>
              <p className="text-dark-gray my-6">
                Add your social handles below
              </p>
              <div className="gap-x-6 md:grid md:grid-cols-2">
                {Object.keys(social_links).map((key, index) => {
                  const IconComponent = socialIcons[key] || null;
                  const link = social_links[key];
                  return (
                    <InputBox
                      key={index}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      Icon={IconComponent}
                    />
                  );
                })}
              </div>
            </div>
            <button className="btn-dark w-auto px-10" type="submit">
              Update
            </button>
          </div>
        </form>
      )}
    </PageAnimation>
  );
};

export default EditProfile;
