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
import JoditEditor from "jodit-react";
import { useRef } from "react";
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
import { Autocomplete, TextField } from "@mui/material";


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

const EditBlog = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productData, setProductData] = useState([]);
  const editor = useRef(null);
  const [formFields, setFormFields] = useState({
    title: "",
    ytbLink: "",
    content: "",
    author: "",
    tags: [],
    category: "",
    catId: null,
    images: [],
    status: "draft",
    commentsCount: 0,
    note: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

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
    //Lấy hết sản phẩm
    fetchDataFromApi("/api/products/getAll").then((res) => {
      setProductData(res || []);
    });

    fetchDataFromApi(`/api/posts/${id}`)
      .then((res) => {
        setPreviews(res?.data?.images)
        setFormFields({
          title: res?.data?.title,
          ytbLink: res?.data?.ytbLink,
          content: res?.data?.content,
          author: res?.data?.author,
          tags: res?.data?.tags,
          category: res?.data?.category,
          catId: res?.data?.catId,
          images: res?.data?.images,
          status: res?.data?.status,
          note: res?.data?.note,
        });
      })
      
  }, [id]);

  const handleChange = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  // const handleChangeCategory = (event) => {
  //   setcategoryVal(event.target.value);
  //   setFormFields(() => ({
  //     ...formFields,
  //     category: event.target.value,
  //   }));
  // };
  const selectPostType = (cat, id) => {
    formFields.category = cat;
    formFields.catId = id;
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
    if (userInfo?.role !== "mainAdmin") {
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

  const editBlog = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const appendedArray = [...previews, ...uniqueArray];
    console.log(appendedArray);

    img_arr = [];
    formFields.images = appendedArray;
    if (formFields.title !== "" && formFields.content !== "" && formFields.author !== "" && formFields.category !== "" && formFields.images !== "" ) {
      setIsLoading(true);

      editData(`/api/posts/${id}`, formFields).then((res) => {
        // console.log(res);
        setIsLoading(false);
        context.fetchCategory();

        deleteData("/api/imageUpload/deleteAllImages");

        history("/blogs");
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
      <h5 className="mb-0">Blog Edit</h5>
      <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
        <span>Dashboard</span>
        <span>Blogs</span>
        <span>Edit Blog</span>
      </Breadcrumbs>
    </div>

    <form className="form" onSubmit={editBlog}>
      <div className="card p-4">
        <h5 className="mb-4">Basic Information</h5>

        <div className="form-group">
          <h6>Title</h6>
          <input type="text" name="title" value={formFields.title} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Youtube ID &#40;Ex: "JDYFOSwh-g0" in "https://www.youtube.com/watch?v=JDYFOSwh-g0"&#41;</h6>
          <input type="text" name="ytbLink" value={formFields.ytbLink} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Content</h6>
          {/* <textarea rows={5} name="content" value={formFields.content} onChange={handleChange} /> */}
          <JoditEditor
              ref={editor}
              value={formFields.content}
              config={{
                uploader: {
                  insertImageAsBase64URI: false,
                  url: `${process.env.REACT_APP_BASE_URL}/api/posts/richtext/upload`,
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                  format: "json",
                  method: "POST",
                  process: (resp) => {
                    console.log("Server response:", resp);
                    if (resp.success === 1) {
                      console.log('aaaaaaaa')
                      const imageUrl = resp.file.url;
                      const editorElement = document.querySelector(".jodit-wysiwyg");
                      if (editorElement) {
                        editorElement.innerHTML += `<img src="${imageUrl}" alt="uploaded image"/>`;
                      }
                    }
                    return resp; // JSON server đã trả đúng format
                  },
                  error: (error) => console.error("Upload Error:", error),
                },
                height: 1000,
                buttons: "bold,italic,underline,|,ul,ol,|,image",
              }}
              onBlur={(newContent) => {
                console.log("Nội dung Jodit sau khi upload ảnh:", newContent);
                setFormFields((prev) => ({ ...prev, content: newContent }));
              }}
            />
        </div>

        <div className="form-group">
          <h6>Author</h6>
          <input type="text" name="author" value={formFields.author} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Note</h6>
          <input type="text" name="note" value={formFields.note} onChange={handleChange} />
        </div>

        <div className="form-group">
          <h6>Type</h6>
          {formFields.category !== "" && (
          <Select
            value={formFields.category}
            onChange={handleChange}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
            className="w-100"
          >
            {context.postTypeData?.length !== 0 &&
              context.postTypeData
              .filter((typ) => typ.name !== "All")
              .map((typ, index) => {
                return (
                  <MenuItem
                    className="text-capitalize"
                    value={typ.name}
                    key={index}
                    onClick={() => selectPostType(typ.name, typ._id)}
                  >
                    {typ.name}
                  </MenuItem>
                );
              })}
          </Select>
        )}
        </div>

        <div className="form-group">
          <h6>Status</h6>
          <Select name="status" value={formFields.status} onChange={handleChange}>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </div>
        
        <div className="form-group">
          <h6>Related Products</h6>
          <Autocomplete
            multiple
            id="tags-autocomplete"
            options={productData}
            getOptionLabel={(option) => option.name}
            value={formFields.tags}
            onChange={(event, newValue) => {
              setFormFields((prev) => ({
                ...prev,
                tags: newValue,
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Products" placeholder="Products" />
            )}
          />
        </div>
      </div>

      <div className="card p-4 mt-4">
        <h5>Thumbnail Image</h5>
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
              <h5>Upload Thumbnail Image</h5>
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

export default EditBlog;
