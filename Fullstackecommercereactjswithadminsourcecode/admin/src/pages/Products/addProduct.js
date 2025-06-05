import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import Rating from "@mui/material/Rating";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import {
  deleteData,
  deleteImages,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { FaRegImages } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import OutlinedInput from "@mui/material/OutlinedInput";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import axios from "axios";
import CountryDropdown from "../../components/CountryDropdown";
import Select2 from "react-select";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ProductUpload = () => {
  const [categoryVal, setCategoryVal] = useState("");
  const [subCatVal, setSubCatVal] = useState("");
  const [isFeaturedValue, setIsFeaturedValue] = useState("");
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);


  const [selectedLocation, setSelectedLocation] = useState([]);


  const history = useNavigate();

  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    catId: "",
    catName: "",
    subCat: "",
    subCatId: "",
    subCatName: "",
    isFeatured: null,
    season: [],
    note: "",
  });

  
  const fileInputRef = useRef();

  const context = useContext(MyContext);


  useEffect(() => {
    setCatData(context.catData?.categoryList || []);
  }, [context.catData]);
  useEffect(() => {
    const subs = catData.flatMap(cat => cat.children || []);
    setSubCatData(subs);
  }, [catData]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeCategory = event => {
    const catId = event.target.value;
    const cat = catData.find(c => c._id === catId);
    setCategoryVal(catId);
    setFormFields(prev => ({ ...prev, category: catId, catId, catName: cat?.name || '' }));
  };

  const handleChangeSubCategory = event => {
    const subId = event.target.value;
    const sub = subCatData.find(s => s._id === subId);
    setSubCatVal(subId);
    setFormFields(prev => ({ ...prev, subCatId: subId, subCat: sub?.name || '', subCatName: sub?.name || '' }));
  };

  const handleSeasonChange = options => {
    setFormFields(prev => ({ ...prev, season: options ? options.map(o => o.value) : [] }));
  };

  const handleChangeisFeaturedValue = event => {
    const value = event.target.value;
    setIsFeaturedValue(value);
    setFormFields(prev => ({ ...prev, isFeatured: value }));
  };
  const onChangeFile = async (e, endpoint) => {
    setUploading(true);
    const files = e.target.files;
    const formdata = new FormData();
    Array.from(files).forEach(f => formdata.append('images', f));
    try {
      await uploadImage(endpoint, formdata);
      const res = await fetchDataFromApi('/api/imageUpload');
      setPreviews(Array.from(new Set(res.flatMap(item => item.images))));
      context.setAlertBox({ open: true, error: false, msg: 'Images Uploaded!' });
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const removeImg = async (idx, url) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== "mainAdmin") {
      await deleteImages(`/api/category/deleteImage?img=${url}`);
      setPreviews(prev => prev.filter((_, i) => i !== idx));
      context.setAlertBox({ open: true, error: false, msg: 'Image Deleted!' });
    } else {
      context.setAlertBox({ open: true, error: true, msg: 'Only Admin can delete Image' });
    }
  };

  const addProduct = async e => {
    e.preventDefault();
    if (!formFields.name) return context.setAlertBox({ open: true, error: true, msg: 'Please add product name' });
    if (!formFields.description) return context.setAlertBox({ open: true, error: true, msg: 'Please add description' });
    if (!formFields.brand) return context.setAlertBox({ open: true, error: true, msg: 'Please add brand' });
    if (!formFields.category) return context.setAlertBox({ open: true, error: true, msg: 'Please select a category' });
    if (previews.length === 0) return context.setAlertBox({ open: true, error: true, msg: 'Please select images' });

    setIsLoading(true);
    try {
      await postData('/api/products/create', { ...formFields, images: previews });
      context.setAlertBox({ open: true, error: false, msg: 'Product created successfully!' });
      await deleteData('/api/imageUpload/deleteAllImages');
      history('/products');
    } catch (err) {
      console.error(err);
      context.setAlertBox({ open: true, error: true, msg: 'Error creating product' });
    }
    setIsLoading(false);
  };

 

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Product Upload</h5>
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component={Link}
              to="/"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component={Link}
              to="/products"
              label="Products"
              deleteIcon={<ExpandMoreIcon />}
            />
            <StyledBreadcrumb
              label="Add Product"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>

        <form className="form" onSubmit={addProduct}>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Basic Information</h5>

                <div className="form-group">
                  <h6>PRODUCT NAME</h6>
                  <input
                    type="text"
                    name="name"
                    value={formFields.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <h6>DESCRIPTION</h6>
                  <textarea
                    rows={5}
                    cols={10}
                    value={formFields.description}
                    name="description"
                    onChange={handleInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>CATEGORY</h6>
                      <Select
                        value={categoryVal}
                        onChange={handleChangeCategory}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        {catData.map(cat => <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>)}
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>SUB CATEGORY</h6>
                      <Select
                        value={subCatVal}
                        onChange={handleChangeSubCategory}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        {subCatData.filter(sub => sub.parentId === categoryVal).map(sub => <MenuItem key={sub._id} value={sub._id}>{sub.name}</MenuItem>)}
                      </Select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>BRAND</h6>
                      <input
                        type="text"
                        name="brand"
                        value={formFields.brand}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  
                  <div className="col">
                    <div className="form-group">
                      <h6 className="text-uppercase">FEATURED </h6>
                      <Select
                        value={isFeaturedValue}
                        onChange={handleChangeisFeaturedValue}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        <MenuItem value={true}>True</MenuItem>
                        <MenuItem value={false}>False</MenuItem>
                      </Select>
                    </div>
                  </div> 

                  <div className="col">
                    <div className="form-group">
                      <h6 className="text-uppercase">SEASON</h6>
                      <Select2
                          defaultValue={formFields.season}
                          isMulti
                          name="season"
                          options={[
                            { label: "Spring", value: "Spring" },
                            { label: "Fall", value: "Fall" },
                            { label: "Summer", value: "Summer" },
                            { label: "Winter", value: "Winter" }
                          ]}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          onChange={handleSeasonChange}
                        />
                    </div>
                  </div>

                 
                </div>

                {/* <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <h6>LOCATION</h6>

                      <Select2
                        isMulti
                        name="location"
                        options={countryList}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleChangeLocation}
                      />
                    </div>
                  </div>
                </div> */}
                <div className="row">
                  <div className="col-md-12">
                  <div className="form-group">
                      <h6>NOTE </h6>
                      <input
                        type="text"
                        name="note"
                        value={formFields.note}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 mt-0">
            <div className="imagesUploadSec">
              <h5 class="mb-4">Media And Published</h5>

              <div className="imgUploadBox d-flex align-items-center">
                 {previews.map((img, idx) => (
                    <div key={idx} className="uploadBox">
                      <span className="remove" onClick={() => removeImg(idx, img)}><IoCloseSharp /></span>
                      <div className="box"><LazyLoadImage effect="blur" src={img} alt="preview" className="w-100" /></div>
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
                      <input type="file" multiple onChange={e => onChangeFile(e, '/api/products/upload')} ref={fileInputRef} />
                      <div className="info"><FaRegImages /><h5>Upload Images</h5></div>
                    </>
                  )}
                </div>
              </div>

              <br />

              <Button type="submit" disabled={uploading || isLoading} className="btn-blue btn-lg w-100 mt-3">
                <FaCloudUploadAlt />&nbsp;{isLoading ? <CircularProgress color="inherit" size={20} /> : 'PUBLISH'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductUpload;
