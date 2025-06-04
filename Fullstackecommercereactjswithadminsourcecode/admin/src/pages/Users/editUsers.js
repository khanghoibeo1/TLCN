import { Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { MyContext } from "../../App";
import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { useContext, useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaRegImages } from "react-icons/fa";
import { useParams } from "react-router-dom";

import { IoCloseSharp } from "react-icons/io5";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const EditUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    phone: "",
    email: "",
    status: "",
    images: [],

  });
  const [previews, setPreviews] = useState([]);
  const context = useContext(MyContext);
  let { id } = useParams();
  const formdata = new FormData();
  const history = useNavigate();

  // Fetch blog data on component mount
  useEffect(() => {
    context.setProgress(20);
    fetchDataFromApi("/api/imageUpload").then((res) => {
      res?.map((item) => {
        item?.images?.map((img) => {
          deleteImages(`/api/category/deleteImage?img=${img}`).then((res) => {
            deleteData("/api/imageUpload/deleteAllImages");
          });
        });
      });
    });

    fetchDataFromApi(`/api/user/${id}`)
      .then((res) => {
        setPreviews(res?.data?.images)
        setFormFields({
          name: res?.name,
          phone: res?.phone,
          email: res?.email,
          images: res?.images,
          status: res?.status,
        });
      })
      
  }, [id]);

  const handleChange = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  let img_arr = [];
  let uniqueArray = [];

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = e.target.files;

      setUploading(true);

      //const fd = new FormData();
      for (var i = 0; i < files.length; i++) {
        // Validate file type
        if (
          files[i] &&
          (files[i].type === "image/jpeg" ||
            files[i].type === "image/jpg" ||
            files[i].type === "image/png")
        ) {
          const file = files[i];

          formdata.append(`images`, file);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please select a valid JPG or PNG image file.",
          });

          return false;
        }
      }
    } catch (error) {
      console.log(error);
    }

    uploadImage(apiEndPoint, formdata).then((res) => {
      fetchDataFromApi("/api/imageUpload").then((response) => {
        if (
          response !== undefined &&
          response !== null &&
          response !== "" &&
          response.length !== 0
        ) {
          response.length !== 0 &&
            response.map((item) => {
              item?.images.length !== 0 &&
                item?.images?.map((img) => {
                  img_arr.push(img);
                  //console.log(img)
                });
            });

          uniqueArray = img_arr.filter(
            (item, index) => img_arr.indexOf(item) === index
          );

          // const appendedArray = [...previews, ...uniqueArray];

          //   console.log(appendedArray)

          setPreviews(uniqueArray);
          setTimeout(() => {
            setUploading(false);
            img_arr = [];
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Images Uploaded!",
            });
          }, 500);
        }
      });
    });
  };

  const removeImg = async (index, imgUrl) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin@admin.com") {
      const imgIndex = previews.indexOf(imgUrl);

      deleteImages(`/api/category/deleteImage?img=${imgUrl}`).then((res) => {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Image Deleted!",
        });
      });

      if (imgIndex > -1) {
        // only splice array when item is found
        previews.splice(index, 1); // 2nd parameter means remove one item only
      }
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Only Admin can delete Image",
      });
    }
  };

  const editUser = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const appendedArray = [...previews, ...uniqueArray];
    console.log(appendedArray);

    img_arr = [];
    formFields.images = appendedArray;
    if (
      formFields.name !== "" 
    ) {
      setIsLoading(true);

      editData(`/api/user/${id}`, formFields).then((res) => {
        // console.log(res);
        setIsLoading(false);
        context.fetchCategory();

        deleteData("/api/imageUpload/deleteAllImages");

        history("/users");
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill all the details",
      });
      return false;
    }
  };

  return (
  <div className="right-content w-100">
    <div className="card shadow border-0 w-100 flex-row p-4">
      <h5 className="mb-0">User Edit</h5>
      <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
        <span>Dashboard</span>
        <span>Users</span>
        <span>Edit User</span>
      </Breadcrumbs>
    </div>

    <form className="form" onSubmit={editUser}>
      <div className="card p-4">
        <h5 className="mb-4">Basic Information</h5>

        <div className="form-group">
          <h6>Name</h6>
          <input readOnly type="text" name="name" value={formFields.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Phone</h6>
          <textarea readOnly rows={5} name="phone" value={formFields.phone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Email</h6>
          <input readOnly type="text" name="email" value={formFields.email} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <h6>Status</h6>
            <Select
                value={formFields.status}
                onChange={handleChange}
                inputProps={{ "aria-label": "Without label" }}
                className="w-100"
                name="status"
                >
                <MenuItem value="banned">Banned</MenuItem>
                <MenuItem value="active">Active</MenuItem>
            </Select>
        </div>
      </div>

      <div className="card p-4 mt-4">
        <h5>Media and Publication</h5>
        <div className="imgUploadBox d-flex align-items-center">
          {previews?.map((img, index) => (
            <div className="uploadBox" key={index}>
              <span className="remove" onClick={() => removeImg(index, img)}>
                <IoCloseSharp />
              </span>
              <LazyLoadImage alt="Preview" effect="blur" className="w-100" src={img} />
            </div>
          ))}
          <div className="uploadBox">
            <input type="file" multiple onChange={(e) => onChangeFile(e, "/api/user/upload")} />
            <div className="info">
              <FaCloudUploadAlt />
              <h5>Upload Images</h5>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="btn-blue btn-lg w-100 mt-4"
      >
        <FaCloudUploadAlt /> &nbsp;
        {isLoading ? <CircularProgress color="inherit" className="loader" /> : "PUBLISH USER"}
      </Button>
    </form>
  </div>
);
};

export default EditUser;
