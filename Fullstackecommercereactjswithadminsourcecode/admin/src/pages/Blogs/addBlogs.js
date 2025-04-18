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
import JoditEditor from "jodit-react";
import { useRef } from "react";
import { Autocomplete, TextField } from "@mui/material";


const AddBlog = () => {
  
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [uploading, setUploading] = useState(false);
  const [categoryVal, setcategoryVal] = useState("all");
  const editor = useRef(null);
  const formdata = new FormData();
  const [formFields, setFormFields] = useState({
    title: "",
    ytbLink: "",
    content: "",
    author: "",
    images: [],
    category: "",
    status: "draft",
    tags: [],
    catId: null,
    commentsCount: 0,
    note: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [previews, setPreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState([]);

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
    //Lấy hết sản phẩm
    fetchDataFromApi("/api/products/getAll").then((res) => {
      setProductData(res || []);
    });
  }, []);

  // Xử lý thay đổi trường nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };


  let img_arr = [];
  let uniqueArray = [];
  let selectedImages = [];

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

  // const handleChangeCategory = (event) => {
  //   setcategoryVal(event.target.value);
    
  // };

  const selectPostType = (cat, id) => {
    formFields.category = cat;
    formFields.catId = id;
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
      console.log(res);
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
    console.log(formFields);


    if (!formFields.title || !formFields.content || !formFields.author || !formFields.category || !formFields.images ) {
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

  
  // Chọn product
  const handleSelectProduct = (product) => {
    if (!product) return;
  
    // Kiểm tra xem đã có trong danh sách chưa
    const isExist = formFields.tags.some(p => p.id === product.id);
    if (!isExist) {
      setFormFields(prev => ({
        ...prev,
        tags: [...prev.tags, product.value],
      }));
    }
  };
  // Chuyển productData thành dạng options cho Select2
  const productOptions = productData.map((product) => ({
    value: product.id,
    label: product.name,
  }));

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
            {/* <input type="text" name="category" value={formFields.category} onChange={handleChange} /> */}
            <Select
              value={formFields.category}
              name="category"
              onChange={handleChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              className="w-100"
            >
              <MenuItem value="">
                <em value={null}>None</em>
              </MenuItem>
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
                console.log(newValue)
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



          {/* <div className="form-group">
            <h6>Relation Products &#40;Use "," to distint&#41;</h6>
            <input
              type="text"
              name="tags"
              value={formFields.tags.join(", ")}
              onChange={(e) =>
                setFormFields({ ...formFields, tags: e.target.value.split(",").map((tag) => tag.trim()) })
              }
            />
          </div> */}
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

export default AddBlog;
