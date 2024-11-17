import React, { useState, useEffect, useContext } from "react";
import { Button, Select, MenuItem, CircularProgress } from "@mui/material";
import { useHistory, useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { MyContext } from "../../App";

const EditBlog = ({ blogId }) => {
  const [blogFields, setBlogFields] = useState({
    title: "",
    content: "",
    author: "",
    slug: "",
    tags: [],
    category: "",
    images: [],
    status: "",
  });
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  // Fetch blog data on component mount
  useEffect(() => {
    fetch(`/api/posts/${blogId}`)
      .then((res) => res.json())
      .then((data) => {
        setBlogFields(data);
        setPreviews(data.images);
      });
  }, [blogId]);

  const inputChange = (e) => {
    setBlogFields({ ...blogFields, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e) => {
    setBlogFields({ ...blogFields, tags: e.target.value });
  };

  const removeImg = (index, imgUrl) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin9643@gmail.com") {
      fetch(`/api/posts/deleteImage?img=${imgUrl}`, { method: "DELETE" })
        .then(() => {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Image Deleted!",
          });
          const newPreviews = previews.filter((_, i) => i !== index);
          setPreviews(newPreviews);
        })
        .catch(() => {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to delete image.",
          });
        });
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

    fetch(`/api/posts/${blogId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blogFields),
    })
      .then(() => {
        context.setAlertBox({
          open: true,
          msg: "Blog updated successfully!",
          error: false,
        });
        history.push("/posts");
      })
      .catch(() => {
        context.setAlertBox({
          open: true,
          msg: "Failed to update blog.",
          error: true,
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="edit-blog-container">
      <form onSubmit={editBlog}>
        <h3>Edit Blog</h3>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={blogFields.title}
            onChange={inputChange}
          />
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            rows="5"
            name="content"
            value={blogFields.content}
            onChange={inputChange}
          />
        </div>

        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            name="author"
            value={blogFields.author}
            onChange={inputChange}
          />
        </div>

        <div className="form-group">
          <label>Slug</label>
          <input
            type="text"
            name="slug"
            value={blogFields.slug}
            onChange={inputChange}
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <Select
            multiple
            value={blogFields.tags}
            onChange={handleTagChange}
            className="w-100"
          >
            {context.tagsData?.map((tag, index) => (
              <MenuItem key={index} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="form-group">
          <label>Category</label>
          <Select
            value={blogFields.category}
            onChange={(e) => setBlogFields({ ...blogFields, category: e.target.value })}
            className="w-100"
          >
            {context.categories?.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <Select
            value={blogFields.status}
            onChange={(e) => setBlogFields({ ...blogFields, status: e.target.value })}
            className="w-100"
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </Select>
        </div>

        <div className="image-upload-section">
          <h5>Images</h5>
          <div className="image-preview-container">
            {previews.map((img, index) => (
              <div key={index} className="image-preview">
                <IoCloseSharp onClick={() => removeImg(index, img)} />
                <LazyLoadImage src={img} alt="Blog image" />
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files).map((file) =>
                URL.createObjectURL(file)
              );
              setPreviews([...previews, ...files]);
              setBlogFields({ ...blogFields, images: [...blogFields.images, ...files] });
            }}
          />
        </div>

        <Button type="submit" className="submit-btn">
          {isLoading ? <CircularProgress /> : "Update Blog"}
        </Button>
      </form>
    </div>
  );
};

export default EditBlog;
