import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Chip,
  MenuItem,
  Select,
} from "@mui/material";
import { emphasize, styled } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";
import { MyContext } from "../../App";

// Breadcrumb styled
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: emphasize(
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[800],
      0.06
    ),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(
      theme.palette.mode === "light"
        ? theme.palette.grey[100]
        : theme.palette.grey[800],
      0.12
    ),
  },
}));

const AddBanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [categoryVal, setCategoryVal] = useState("");
  const [subCatVal, setSubCatVal] = useState("");
  const [subCatData, setSubCatData] = useState([]);

  const [formFields, setFormFields] = useState({
    images: [],
    catName: null,
    catId: null,
    subCat: null,
    subCatId: null,
    subCatName: null,
    link: "",
    note: "",
  });

  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDataFromApi("/api/imageUpload").then((res) => {
      res?.forEach((item) =>
        item?.images?.forEach((img) =>
          deleteImages(`/api/homeBanner/deleteImage?img=${img}`).then(() =>
            deleteData("/api/imageUpload/deleteAllImages")
          )
        )
      );
    });
  }, []);

  useEffect(() => {
    const subCategories =
      context.catData?.categoryList?.flatMap((cat) => cat.children || []) || [];
    setSubCatData(subCategories);
  }, [context.catData]);

  const onChangeFile = async (e, apiEndPoint) => {
    const files = Array.from(e.target.files || []);
    const formData = new FormData();

    try {
      setUploading(true);

      for (const file of files) {
        if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
          formData.append("images", file);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please select a valid JPG, JPEG, PNG or WEBP image.",
          });
          return;
        }
      }

      await uploadImage(apiEndPoint, formData);
      const response = await fetchDataFromApi("/api/imageUpload");

      const allImages = response?.flatMap((item) => item?.images || []) || [];
      const uniqueImages = [...new Set(allImages)];

      setPreviews((prev) => [...prev, ...uniqueImages]);
      setFormFields((prev) => ({ ...prev, images: [...prev.images, ...files] }));

      context.setAlertBox({
        open: true,
        error: false,
        msg: "Images Uploaded!",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImg = async (imgUrl) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email !== "admin@admin.com") {
      return context.setAlertBox({
        open: true,
        error: true,
        msg: "Only Admin can delete Image",
      });
    }

    await deleteImages(`/api/banners/deleteImage?img=${imgUrl}`);
    setPreviews((prev) => prev.filter((img) => img !== imgUrl));

    context.setAlertBox({
      open: true,
      error: false,
      msg: "Image Deleted!",
    });
  };

  const handleChangeCategory = (e) => {
    const selectedId = e.target.value;
    const selectedCat = context.catData?.categoryList?.find((cat) => cat._id === selectedId);

    setCategoryVal(selectedId);
    setFormFields((prev) => ({
      ...prev,
      catId: selectedId,
      catName: selectedCat?.name || null,
    }));
  };

  const handleChangeSubCategory = (e) => {
    const selectedId = e.target.value;
    const selectedSubCat = subCatData.find((sub) => sub._id === selectedId);

    setSubCatVal(selectedId);
    setFormFields((prev) => ({
      ...prev,
      subCatId: selectedId,
      subCatName: selectedSubCat?.name || null,
      subCat: selectedSubCat?.name || null,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const addHomeBanner = async (e) => {
    e.preventDefault();

    if (previews.length === 0 || !formFields.link) {
      return context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill all the details",
      });
    }

    setIsLoading(true);
    try {
      await postData("/api/banners/create", { ...formFields, images: previews });
      await deleteData("/api/imageUpload/deleteAllImages");
      context.fetchCategory();
      navigate("/banners");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Add Home Banner</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component="a" label="Home Banners" href="#" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Add Home Banner" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={addHomeBanner}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="row">
                {/* CATEGORY */}
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>CATEGORY</h6>
                    <Select
                      value={categoryVal}
                      onChange={handleChangeCategory}
                      displayEmpty
                      className="w-100"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {context.catData?.categoryList?.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id} className="text-capitalize">
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* SUB CATEGORY */}
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>SUB CATEGORY</h6>
                    <Select
                      value={subCatVal}
                      onChange={handleChangeSubCategory}
                      displayEmpty
                      className="w-100"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {subCatData.map((sub) => (
                        <MenuItem key={sub._id} value={sub._id} className="text-capitalize">
                          {sub.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* LINK & NOTE */}
              <div className="form-group">
                <h6>Link</h6>
                <input type="text" name="link" value={formFields.link} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <h6>Note</h6>
                <input type="text" name="note" value={formFields.note} onChange={handleChange} className="form-control" />
              </div>

              {/* IMAGES */}
              <div className="imagesUploadSec">
                <h5 className="mb-4">Media And Published</h5>

                <div className="imgUploadBox d-flex align-items-center">
                  {previews.map((img, index) => (
                    <div className="uploadBox" key={index}>
                      <span className="remove" onClick={() => removeImg(img)}><IoCloseSharp /></span>
                      <div className="box">
                        <LazyLoadImage alt="Uploaded" src={img} effect="blur" className="w-100" />
                      </div>
                    </div>
                  ))}

                  <div className="uploadBox">
                    {uploading ? (
                      <div className="progressBar d-flex align-items-center justify-content-center flex-column">
                        <CircularProgress />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <input type="file" multiple onChange={(e) => onChangeFile(e, "/api/banners/upload")} />
                        <div className="info">
                          <FaRegImages />
                          <h5>Upload Images</h5>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <br />
                <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                  <FaCloudUploadAlt /> &nbsp;
                  {isLoading ? <CircularProgress size={20} /> : "PUBLISH AND VIEW"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBanner;
