// src/pages/MyAccount.jsx

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import { IoMdCloudUpload } from "react-icons/io";

import { MyContext } from "../../App";
import NoUserImg from "../../assets/images/no-user.jpg";

import {
  fetchDataFromApi,
  editData2,
  uploadImage,
  postData2,
} from "../../utils/api";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`myaccount-tabpanel-${index}`}
      aria-labelledby={`myaccount-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `myaccount-tab-${index}`,
    "aria-controls": `myaccount-tabpanel-${index}`,
  };
}

const MyAccount = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [userData, setUserData] = useState(null);
  const [profilePreviews, setProfilePreviews] = useState([]); // array of image URLs

  const [profileFields, setProfileFields] = useState({
    name: "",
    email: "",
    phone: "",
    images: [],
  });

  const [passwordFields, setPasswordFields] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // On component mount, verify token and fetch user
  useEffect(() => {
    window.scrollTo(0, 0);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signIn");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.userId) {
      navigate("/signIn");
      return;
    }

    // Fetch user data from API
    fetchDataFromApi(`/api/user/${storedUser.userId}`)
      .then((resp) => {
        // resp is the user object
        setUserData(resp);
        setProfilePreviews(resp.images || []);
        setProfileFields({
          name: resp.name || "",
          email: resp.email || "",
          phone: resp.phone || "",
          images: resp.images || [],
        });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Unable to load user information",
        });
      });

    context.setEnableFilterTab(false);
  }, []);

  // Handle profile input change
  const handleProfileInput = (e) => {
    setProfileFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle file selection & upload
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types
    for (let file of files) {
      if (
        !(
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.type === "image/png" ||
          file.type === "image/webp"
        )
      ) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Only JPEG/PNG/WebP images are accepted.",
        });
        return;
      }
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    try {
      setIsUploading(true);
      // Call upload API
      const result = await postData2("/api/user/upload", formData);
      console.log("Upload result:", result);
      // result = { status:"SUCCESS", images:[ "https://…", … ] }
      if (result.data.status !== "SUCCESS") {
        throw new Error(result.msg || "Upload failed");
      }
      const newImages = result.data.images;

      // Update previews & profileFields
      setProfilePreviews(newImages);
      setProfileFields((prev) => ({
        ...prev,
        images: newImages,
      }));

      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image uploaded successfully!",
      });
    } catch (err) {
      console.error("Upload error:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg: err.message || "An error occurred during image upload",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (
      !profileFields.name.trim() ||
      !profileFields.email.trim() ||
      !profileFields.phone.trim()
    ) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill out all profile fields.",
      });
      return;
    }

    setIsLoadingProfile(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const payload = {
        name: profileFields.name,
        email: profileFields.email,
        phone: profileFields.phone,
        images: profileFields.images,
        isAdmin: false,
      };
      const res = await editData2(`/api/user/${storedUser.userId}`, payload);
      if (res.status === "SUCCESS") {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Update User Successfully!",
        });
        // Optionally refresh userData
        const updatedUser = { ...userData, ...payload };
        setUserData(updatedUser);
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg || "Profile update failed",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "An error occurred while updating the profile",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle password input change
  const handlePasswordInput = (e) => {
    setPasswordFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setTabValue(1); // ensure on password tab

    const { oldPassword, newPassword, confirmPassword } = passwordFields;
    if (!oldPassword || !newPassword || !confirmPassword) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill out all password fields.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "New password and confirmation password do not match.",
      });
      return;
    }
    if (newPassword.length < 6) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "New password must be at least 6 characters long.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const payload = {
        email: userData.email,
        password: oldPassword,
        newPass: newPassword,
      };
      const res = await editData2(
        `/api/user/changePassword/${storedUser.userId}`,
        payload
      );
      if (res.status === "SUCCESS") {
        context.setAlertBox({
          open: true,
          error: false,
          msg: res.msg || "Password changed successfully.",
        });
        // Clear password fields
        setPasswordFields({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: res.msg || "Password change failed",
        });
      }
    } catch (err) {
      console.error("Error changing password:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "An error occurred while changing password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <section className="section myAccountPage">
      <div className="container">
        <h2 className="hd">My Account</h2>

        <Box sx={{ width: "100%" }} className="myAccBox card border-0">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="My Account Tabs"
            >
              <Tab label="Edit Profile" {...a11yProps(0)} />
              <Tab label="Change Password" {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* ── Tab Panel: Edit Profile ───────────────────────────── */}
          <CustomTabPanel value={tabValue} index={0}>
            <form onSubmit={handleProfileSave}>
              <div className="row">
                <div className="col-md-4">
                  <div className="userImage d-flex align-items-center justify-content-center position-relative">
                    {isUploading ? (
                      <CircularProgress />
                    ) : (
                      <>
                        {profilePreviews && profilePreviews.length > 0 ? (
                          profilePreviews.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`avatar-${idx}`}
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ))
                        ) : (
                          <img
                            src={NoUserImg}
                            alt="No avatar"
                            style={{
                              width: 150,
                              height: 150,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div
                          className="overlay d-flex align-items-center justify-content-center"
                          style={{
                            position: "absolute",
                            width: 150,
                            height: 150,
                            cursor: "pointer",
                            top: 0,
                            left: 0,
                          }}
                        >
                          <IoMdCloudUpload size={24} color="#fff" />
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            name="images"
                            style={{
                              opacity: 0,
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="row mb-3">
                    <div className="col-md-6 mb-3">
                      <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        name="name"
                        onChange={handleProfileInput}
                        value={profileFields.name}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        disabled
                        name="email"
                        value={profileFields.email}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <TextField
                        label="Phone"
                        variant="outlined"
                        fullWidth
                        name="phone"
                        onChange={handleProfileInput}
                        value={profileFields.phone}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoadingProfile}
                  >
                    {isLoadingProfile ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CustomTabPanel>

          {/* ── Tab Panel: Change Password ────────────────────────── */}
          <CustomTabPanel value={tabValue} index={1}>
            <form onSubmit={handleChangePassword}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <TextField
                    label="Old Password"
                    variant="outlined"
                    fullWidth
                    type="password"
                    name="oldPassword"
                    onChange={handlePasswordInput}
                    value={passwordFields.oldPassword}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <TextField
                    label="New Password"
                    variant="outlined"
                    fullWidth
                    type="password"
                    name="newPassword"
                    onChange={handlePasswordInput}
                    value={passwordFields.newPassword}
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <TextField
                    label="Confirm Password"
                    variant="outlined"
                    fullWidth
                    type="password"
                    name="confirmPassword"
                    onChange={handlePasswordInput}
                    value={passwordFields.confirmPassword}
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <CircularProgress size={20} />
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          </CustomTabPanel>
        </Box>
      </div>
    </section>
  );
};

export default MyAccount;
