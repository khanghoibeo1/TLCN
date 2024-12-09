import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import { postData } from "../../utils/api";

const AddPromotionCode = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    code: "",
    description: "",
    discountPercent: "",
    maxUsage: "",
    status: "active", // Mặc định là active
  });

  // Xử lý thay đổi trường nhập
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({ ...formFields, [name]: value });
  };

  const addPromotion = async (e) => {
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
      await postData("/api/promotionCode/create", formFields);
      context.setAlertBox({
        open: true,
        msg: "Promotion code created successfully!",
        error: false,
      });
      navigate("/promotionCode");
    } catch (error) {
      context.setAlertBox({
        open: true,
        msg: "Error creating promotion code.",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Add Promotion Code</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
          <span>Dashboard</span>
          <span>Promotions</span>
          <span>Add Promotion</span>
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={addPromotion}>
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
          {isLoading ? (
            <CircularProgress color="inherit" className="loader" />
          ) : (
            "CREATE PROMOTION"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AddPromotionCode;
