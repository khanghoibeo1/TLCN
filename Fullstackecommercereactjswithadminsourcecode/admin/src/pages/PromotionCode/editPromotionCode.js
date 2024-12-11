import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  Breadcrumbs,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from "../../App";
import { fetchDataFromApi, editData } from "../../utils/api";

const EditPromotionCode = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    code: "",
    description: "",
    discountPercent: "",
    maxUsage: "",
    status: "active", // Default is active
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const updatePromotion = async (e) => {
    e.preventDefault();

    if (!formFields.code || !formFields.discountPercent || !formFields.maxUsage) {
      context.setAlertBox({
        open: true,
        msg: "Please fill all required fields.",
        error: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await editData(`/api/promotionCode/${id}`, formFields);
      context.setAlertBox({
        open: true,
        msg: "Promotion code updated successfully!",
        error: false,
      });
      navigate("/promotionCode");
    } catch (error) {
      context.setAlertBox({
        open: true,
        msg: "Error updating promotion code.",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Edit Promotion Code</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
          <span>Dashboard</span>
          <span>Promotions</span>
          <span>Edit Promotion</span>
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={updatePromotion}>
        <div className="card p-4">
          <h5 className="mb-4">Promotion Information</h5>

          <div className="form-group">
            <h6>Promotion Code</h6>
            <input
              type="text"
              name="code"
              value={formFields.code}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <h6>Description</h6>
            <textarea
              name="description"
              value={formFields.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <h6>Discount Percent (%)</h6>
            <input
              type="number"
              name="discountPercent"
              value={formFields.discountPercent}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <h6>Max Usage</h6>
            <input
              type="number"
              name="maxUsage"
              value={formFields.maxUsage}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <h6>Status</h6>
            <Select name="status" value={formFields.status} onChange={handleChange}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="hide">Hide</MenuItem>
            </Select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="btn-blue btn-lg w-100 mt-4"
        >
          <FaCloudUploadAlt /> &nbsp;
          {isLoading ? <CircularProgress color="inherit" className="loader" /> : "UPDATE PROMOTION CODE"}
        </Button>
      </form>
    </div>
  );
};

export default EditPromotionCode;