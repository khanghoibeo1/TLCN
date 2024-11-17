import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Button, CircularProgress, Select, MenuItem, Breadcrumbs } from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import {
    deleteData,
    deleteImages,
    fetchDataFromApi,
    postData,
    uploadImage,
  } from "../../utils/api";
const AddBlog = () => {
  const history = useNavigate();
  const context = useContext(MyContext);
  const [formFields, setFormFields] = useState({
    title: "",
    content: "",
    author: "",
    slug: "",
    category: "",
    status: "draft",
    tags: [],
    commentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const addBlog = (e) => {
    e.preventDefault();

    const formData = new FormData();
    const appendedImages = [...previews];
    formData.append("title", formFields.title);
    formData.append("content", formFields.content);
    formData.append("author", formFields.author);
    formData.append("slug", formFields.slug);
    formData.append("category", formFields.category);
    formData.append("status", formFields.status);
    formData.append("tags", JSON.stringify(formFields.tags));
    formData.append("images", JSON.stringify(appendedImages));
    formData.append("commentsCount", formFields.commentsCount);
    formData.append("createdAt", formFields.createdAt);
    formData.append("updatedAt", formFields.updatedAt);

    // Validation
    if (!formFields.title || !formFields.content || !formFields.author || !formFields.category || previews.length === 0) {
      context.setAlertBox({
        open: true,
        msg: "Please fill all required fields and upload images",
        error: true,
      });
      return;
    }

    setIsLoading(true);

    postData("/api/posts/create", formData).then((res) => {
      context.setAlertBox({
        open: true,
        msg: "Blog post created successfully!",
        error: false,
      });
      setIsLoading(false);
      history.push("/posts");
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...imagePreviews]);
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Add Blog</h5>
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
            <h6>Slug</h6>
            <input type="text" name="slug" value={formFields.slug} onChange={handleChange} />
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
                <span className="remove" onClick={() => setPreviews(previews.filter((_, i) => i !== index))}>
                  <IoCloseSharp />
                </span>
                <LazyLoadImage alt="Preview" effect="blur" className="w-100" src={img} />
              </div>
            ))}
            <div className="uploadBox">
              <input type="file" multiple onChange={handleFileChange} />
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
