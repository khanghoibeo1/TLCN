import React, { useState, useContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Select,
  MenuItem,
  Breadcrumbs,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { MyContext } from "../../App";
import { postData, uploadImage, fetchDataFromApi, deleteImages, deleteData } from "../../utils/api";

const AddBlog = () => {
  
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [uploading, setUploading] = useState(false);
  const formdata = new FormData();
  const [formFields, setFormFields] = useState({
    title: "",
    content: "",
    author: "",
    images: [],
    category: "",
    status: "draft",
    tags: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDataFromApi("/api/imageUpload").then((res) => {
      res?.map((item) => {
        item?.images?.map((img) => {
          deleteImages(`/api/category/deleteImage?img=${img}`).then((res) => {
            deleteData("/api/imageUpload/deleteAllImages");
          });
        });
      });
    });
  }, []);

  // Xử lý thay đổi trường nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  // Xử lý chọn file ảnh
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
      return file;
    });
    setImageFiles([...imageFiles, ...filePreviews]);
  };


  let img_arr = [];
  let uniqueArray = [];
  let selectedImages = [];

  const removeImg = async (index, imgUrl) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin9643@gmail.com") {
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



  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = e.target.files;

      console.log(files);
      setUploading(true);

      //const fd = new FormData();
      for (var i = 0; i < files.length; i++) {
        // Validate file type
        if (
          files[i] &&
          (files[i].type === "image/jpeg" ||
            files[i].type === "image/jpg" ||
            files[i].type === "image/png" ||
            files[i].type === "image/webp")
        ) {
          const file = files[i];
          selectedImages.push(file);
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

      formFields.images = selectedImages;
    } catch (error) {
      console.log(error);
    }

    uploadImage(apiEndPoint, formdata).then((res) => {
      console.log(selectedImages);
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

          //  const appendedArray = [...previews, ...uniqueArray];

          setPreviews(uniqueArray);
          setTimeout(() => {
            setUploading(false);
            img_arr = [];
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Images Uploaded!",
            });
          }, 200);
        }
      });
    });
  };

  // Gửi dữ liệu bài blog
  const addBlog = async (e) => {
    e.preventDefault();

    const appendedArray = [...previews, ...uniqueArray];
    img_arr = [];
    formFields.images = appendedArray;
    console.log(appendedArray);


    if (!formFields.title || !formFields.content || !formFields.author || !formFields.category || !formFields.images || previews.length === 0) {
      context.setAlertBox({
        open: true,
        msg: "Please fill all required fields and upload images",
        error: true,
      });
      return;
    }

    setIsLoading(true);


    try {
      await postData("/api/posts/create", formFields);
      context.setAlertBox({
        open: true,
        msg: "Blog post created successfully!",
        error: false,
      });

      deleteData("/api/imageUpload/deleteAllImages");

      navigate("/blogs");
    } catch (error) {
      context.setAlertBox({
        open: true,
        msg: "Error creating blog post.",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Blog Upload</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
          <span>Dashboard</span>
          <span>Blogs</span>
          <span>Add Blog</span>
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={addBlog}>
        <div className="card p-4">
          <h5 className="mb-4">Basic Information</h5>

          <div className="form-group">
            <h6>Title</h6>
            <input type="text" name="title" value={formFields.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <h6>Content</h6>
            <textarea rows={5} name="content" value={formFields.content} onChange={handleChange} />
          </div>

          <div className="form-group">
            <h6>Author</h6>
            <input type="text" name="author" value={formFields.author} onChange={handleChange} />
          </div>

          <div className="form-group">
            <h6>Category</h6>
            <input type="text" name="category" value={formFields.category} onChange={handleChange} />
          </div>

          <div className="form-group">
            <h6>Status</h6>
            <Select name="status" value={formFields.status} onChange={handleChange}>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </Select>
          </div>

          <div className="form-group">
            <h6>Tags</h6>
            <input
              type="text"
              name="tags"
              value={formFields.tags.join(", ")}
              onChange={(e) =>
                setFormFields({ ...formFields, tags: e.target.value.split(",").map((tag) => tag.trim()) })
              }
            />
          </div>
        </div>

        <div className="card p-4 mt-4">
          <h5>Media and Publication</h5>
          <div className="imgUploadBox d-flex align-items-center">
            {previews.map((img, index) => (
              <div className="uploadBox" key={index}>
                <span className="remove" onClick={() => removeImg(index, img)}>
                  <IoCloseSharp />
                </span>
                <LazyLoadImage alt="Preview" effect="blur" className="w-100" src={img} />
              </div>
            ))}
            <div className="uploadBox">
              <input type="file" multiple onChange={(e) => onChangeFile(e, "/api/posts/upload")} />
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
          {isLoading ? <CircularProgress color="inherit" className="loader" /> : "PUBLISH BLOG"}
        </Button>
      </form>
    </div>
  );
};

export default AddBlog;
