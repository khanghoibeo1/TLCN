import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs, Button, Chip, CircularProgress, MenuItem, Select } from "@mui/material";
import { emphasize, styled } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  uploadImage,
} from "../../utils/api";
import { MyContext } from "../../App";

// Breadcrumb style
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor = theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[800];
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

const EditBanner = () => {
  const { id } = useParams();
  const history = useNavigate();
  const context = useContext(MyContext);

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    images: [],
    catName: "",
    catId: "",
    subCat: "",
    subCatId: "",
    subCatName: "",
    link: "",
    note: "",
  });
  const [previews, setPreviews] = useState([]);
  const [categoryVal, setCategoryVal] = useState("");
  const [subCatVal, setSubCatVal] = useState("");
  const [subCatData, setSubCatData] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      context.setProgress(20);

      // Xóa image tạm thời lưu
      const tempImages = await fetchDataFromApi("/api/imageUpload");
      tempImages?.forEach((item) => {
        item?.images?.forEach(async (img) => {
          await deleteImages(`/api/banners/deleteImage?img=${img}`);
        });
      });
      await deleteData("/api/imageUpload/deleteAllImages");

      // Fetch banner detail
      const bannerData = await fetchDataFromApi(`/api/banners/${id}`);
      if (bannerData) {
        setFormFields((prev) => ({
          ...prev,
          link: bannerData.link || "",
          note: bannerData.note || "",
          catId: bannerData.catId || "",
          subCatId: bannerData.subCatId || "",
        }));
        setCategoryVal(bannerData.catId || "");
        setSubCatVal(bannerData.subCatId || "");
        setPreviews(bannerData.images || []);
      }

      context.setProgress(100);
    };

    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (context.catData?.categoryList?.length) {
      const subs = context.catData.categoryList.flatMap((cat) => cat.children || []);
      setSubCatData(subs);
    }
  }, [context.catData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeCategory = (event) => {
    const selectedId = event.target.value;
    const selectedCat = context.catData.categoryList.find((cat) => cat._id === selectedId);
    setCategoryVal(selectedId);
    setFormFields((prev) => ({
      ...prev,
      catId: selectedId,
      catName: selectedCat?.name || "",
    }));
  };

  const handleChangeSubCategory = (event) => {
    const selectedId = event.target.value;
    const selectedSub = subCatData.find((sub) => sub._id === selectedId);
    setSubCatVal(selectedId);
    setFormFields((prev) => ({
      ...prev,
      subCatId: selectedId,
      subCat: selectedSub?.name || "",
      subCatName: selectedSub?.name || "",
    }));
  };

  const onChangeFile = async (e) => {
    const files = e.target.files;
    const formdata = new FormData();

    for (const file of files) {
      if (["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        formdata.append("images", file);
      } else {
        context.setAlertBox({ open: true, error: true, msg: "Please select a valid JPG or PNG image file." });
        return;
      }
    }

    setUploading(true);
    await uploadImage("/api/homeBanner/upload", formdata);

    const response = await fetchDataFromApi("/api/imageUpload");
    if (response?.length) {
      const uploadedImgs = response.flatMap((item) => item.images || []);
      const uniqueImgs = [...new Set([...previews, ...uploadedImgs])];
      setPreviews(uniqueImgs);
    }

    setUploading(false);
    context.setAlertBox({ open: true, error: false, msg: "Images Uploaded!" });
  };

  const removeImg = async (index, imgUrl) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin@admin.com") {
      await deleteImages(`/api/banners/deleteImage?img=${imgUrl}`);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
      context.setAlertBox({ open: true, error: false, msg: "Image Deleted!" });
    } else {
      context.setAlertBox({ open: true, error: true, msg: "Only Admin can delete Image" });
    }
  };

  const editSlide = async (e) => {
    e.preventDefault();
    if (!formFields.link || previews.length === 0) {
      context.setAlertBox({ open: true, error: true, msg: "Please fill all the details" });
      return;
    }

    setIsLoading(true);
    const updatedFields = { ...formFields, images: previews };

    await editData(`/api/banners/${id}`, updatedFields);
    await deleteData("/api/imageUpload/deleteAllImages");
    context.fetchCategory();
    history("/banners");
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Edit Banner</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component="a" label="Edit Banner" href="#" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={editSlide}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="row">
                <div className="col-md-6">
                  <h6>Category</h6>
                  <Select value={categoryVal} onChange={handleChangeCategory} className="w-100" displayEmpty>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {context.catData.categoryList?.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </div>

                <div className="col-md-6">
                  <h6>Sub Category</h6>
                  <Select value={subCatVal} onChange={handleChangeSubCategory} className="w-100" displayEmpty>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {subCatData.map((sub) => (
                      <MenuItem key={sub._id} value={sub._id}>{sub.name}</MenuItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="form-group">
                <h6>Link</h6>
                <input type="text" name="link" value={formFields.link} onChange={handleChange} />
              </div>

              <div className="form-group">
                <h6>Note</h6>
                <input type="text" name="note" value={formFields.note} onChange={handleChange} />
              </div>

              <div className="imagesUploadSec">
                <h5 className="mb-4">Media and Published</h5>
                <div className="imgUploadBox d-flex align-items-center">
                  {previews.map((img, index) => (
                    <div className="uploadBox" key={index}>
                      <span className="remove" onClick={() => removeImg(index, img)}><IoCloseSharp /></span>
                      <div className="box">
                        <LazyLoadImage alt="image" effect="blur" className="w-100" src={img} />
                      </div>
                    </div>
                  ))}

                  <div className="uploadBox">
                    {uploading ? (
                      <div className="progressBar text-center d-flex flex-column">
                        <CircularProgress />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <input type="file" multiple onChange={onChangeFile} />
                        <div className="info">
                          <FaRegImages />
                          <h5>Image Upload</h5>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <br />
                <Button type="submit" className="btn-blue btn-lg w-100">
                  <FaCloudUploadAlt /> &nbsp;
                  {isLoading ? <CircularProgress color="inherit" size={20} /> : "Publish and View"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBanner;
