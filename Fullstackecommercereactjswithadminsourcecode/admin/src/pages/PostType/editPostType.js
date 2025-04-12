import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { useContext, useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
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
import { MyContext } from "../../App";
import { useParams } from "react-router-dom";

import CircularProgress from "@mui/material/CircularProgress";
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

const EditPostTypes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: [],
    note: "",
  });


  const [category, setcategory] = useState([]);
  const [postType, setPostType] = useState([]);

  let { id } = useParams();


  const history = useNavigate();

  const context = useContext(MyContext);

  useEffect(() => {
    context.setProgress(20);
    fetchDataFromApi(`/api/postTypes/${id}`).then((res) => {
      setPostType(res);
      setFormFields({
        name: res?.name,
        note: res?.note,
      });
      context.setProgress(100);
    });
  }, []);

  const changeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };


  const editPostType = (e) => {
    e.preventDefault();
    
    console.log(formFields);
    if (
      formFields.name !== "" 
    ) {
      setIsLoading(true);

      editData(`/api/postTypes/${id}`, formFields).then((res) => {
        // console.log(res);
        setIsLoading(false);
        context.fetchPostType();
        history("/postTypes");
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
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
          <h5 className="mb-0">Edit Blog Type</h5>
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component="a"
              label="BlogType"
              href="#"
              deleteIcon={<ExpandMoreIcon />}
            />
            <StyledBreadcrumb
              label="Edit BlogType"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>

        <form className="form" onSubmit={editPostType}>
          <div className="row">
            <div className="col-sm-9">
              <div className="card p-4 mt-0">
                <div className="form-group">
                  <h6>Blog Type Name</h6>
                  <input
                    type="text"
                    name="name"
                    value={formFields.name}
                    onChange={changeInput}
                  />
                </div>

                <div className="form-group">
                  <h6>Note</h6>
                  <input
                    type="text"
                    name="note"
                    value={formFields.note}
                    onChange={changeInput}
                  />
                </div>

                <Button
                type="submit"
                className="btn-blue btn-lg btn-big w-100"
                >
                <FaCloudUploadAlt /> &nbsp;{" "}
                {isLoading === true ? (
                    <CircularProgress color="inherit" className="loader" />
                ) : (
                    "PUBLISH AND VIEW"
                )}{" "}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditPostTypes;
