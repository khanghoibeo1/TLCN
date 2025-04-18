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
import { useParams } from "react-router-dom";
import { FaRegImages } from "react-icons/fa";
import { MyContext } from "../../App";

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

const EditStoreLocation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    iso2: "",
    location: "",
    detailAddress: "",
    lat: "",
    lng: "",
    note: "",
  });

  const history = useNavigate();

  const context = useContext(MyContext);

  const { id } = useParams();

  useEffect(() => {
      context.setProgress(20);
      fetchDataFromApi(`/api/storeLocations/${id}`).then((res) => {
        setFormFields({
          iso2: res?.data.iso2,
          location: res?.data.location,
          detailAddress: res?.data.detailAddress,
          lat: res?.data.lat,
          lng: res?.data.lng,
          note: res?.data.note,
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

  const editStore = (e) => {
    e.preventDefault();

    if (
      formFields.iso2 !== "" &&
      formFields.location !== "" &&
      formFields.detailAddress !== "" 
    ) {
      setIsLoading(true);

      editData(`/api/storeLocations/${id}`, formFields).then((res) => {
        // console.log(res);
        setIsLoading(false);
        history("/storeLocations");
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
          <h5 className="mb-0">Edit Store Location </h5>
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component="a"
              label="StoreLocation"
              href="#"
              deleteIcon={<ExpandMoreIcon />}
            />
            <StyledBreadcrumb
              label="Edit Store Location"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>

        <form className="form" onSubmit={editStore}>
          <div className="row">
            <div className="col-sm-9">
              <div className="card p-4 mt-0">
                <div className="form-group">
                  <h6>ISO2</h6>
                  <input
                    type="text"
                    name="iso2"
                    value={formFields.iso2}
                    onChange={changeInput}
                  />
                </div>
                <div className="form-group">
                  <h6>Location Name</h6>
                  <input
                    type="text"
                    name="location"
                    value={formFields.location}
                    onChange={changeInput}
                  />
                </div>
                <div className="form-group">
                  <h6>Detail Address</h6>
                  <input
                    type="text"
                    name="detailAddress"
                    value={formFields.detailAddress}
                    onChange={changeInput}
                  />
                </div>
                <div className="form-group">
                  <h6>Lat</h6>
                  <input
                    type="number"
                    name="lat"
                    value={formFields.lat}
                    onChange={changeInput}
                  />
                </div>
                <div className="form-group">
                  <h6>Lng</h6>
                  <input
                    type="number"
                    name="lng"
                    value={formFields.lng}
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

export default EditStoreLocation;
