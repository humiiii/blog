import React, { useRef, useContext } from "react";
import PageAnimation from "../components/page.animation";
import InputBox from "../components/InputBox.component";
import { MdOutlineLockOpen } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { z } from "zod";

// Zod validation schema for password fields
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const ChangePassword = () => {
  const {
    userAuth: { accessToken },
  } = useContext(UserContext);

  const changePasswordForm = useRef();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const form = new FormData(changePasswordForm.current);
    const formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    // Validate inputs with Zod
    try {
      passwordSchema.parse(formData);
    } catch (err) {
      const errorMsg = err.errors?.[0]?.message || "Check your inputs.";
      return toast.error(errorMsg);
    }

    // Make API call
    const loadingToast = toast.loading("Updating...");

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/user/change-password`,
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      toast.success("Password changed successfully!");
      changePasswordForm.current.reset();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to change password. Please try again.";
      toast.error(msg);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <PageAnimation>
      <Toaster />
      <form ref={changePasswordForm} onSubmit={handleChangePassword}>
        <h1 className="max-md:hidden">Change Password</h1>
        <div className="w-full py-10 md:max-w-[400px]">
          <InputBox
            name="currentPassword"
            type="password"
            className="profile-edit-input"
            placeholder="Current Password"
            Icon={MdOutlineLockOpen}
          />
          <InputBox
            name="newPassword"
            type="password"
            className="profile-edit-input"
            placeholder="New Password"
            Icon={MdOutlineLockOpen}
          />
          <button type="submit" className="btn-dark px-10">
            Change Password
          </button>
        </div>
      </form>
    </PageAnimation>
  );
};

export default ChangePassword;
