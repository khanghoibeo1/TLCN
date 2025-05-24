import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  ListItemText,
  InputLabel,
  FormControl,
  OutlinedInput,
  Breadcrumbs,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { Autocomplete } from "@mui/material";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData } from "../../utils/api";

const typesList = ["info", "warning", "success", "error", "import", "export"];
const rolesList = ["bronze","silver", "gold", "platium"];

const AddNotification = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const {id} = useParams()

  const [formFields, setFormFields] = useState({
    title: "",
    message: "",
    type: "info",
    recipients: [],
    applicableRoles: [],
  });

  useEffect(() => {
    fetchDataFromApi("/api/user").then((res) => {
      setUserData(res?.data || []);
    });
  }, []);

  useEffect(() => {
    context.setProgress(20);
    fetchDataFromApi(`/api/notifications/${id}`).then((res) => {
    setFormFields({
        title: res?.title ,
        message: res?.message,
        type: res?.type,
        recipients: res?.recipients,
        applicableRoles: res?.applicableRoles || [],
    });
    });
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields({
      ...formFields,
      [name]: value,
    });
  };

  const handleRolesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormFields({
      ...formFields,
      applicableRoles: typeof value === "string" ? value.split(",") : value,
    });
  };

  const addNotification = async (e) => {
    e.preventDefault();

    if (!formFields.title || !formFields.message) {
      context.setAlertBox({
        open: true,
        msg: "Please fill all required fields.",
        error: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await postData("/api/notifications/create", formFields);
      context.setAlertBox({
        open: true,
        msg: "Notification created successfully!",
        error: false,
      });
      navigate("/notifications");
    } catch (error) {
      context.setAlertBox({
        open: true,
        msg: "Error creating notification.",
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const allOption = { _id: 'all', name: 'All Users' };
  const usersWithAll = [allOption, ...userData];

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4">
        <h5 className="mb-0">Edit Notification</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
          <span>Dashboard</span>
          <span>Notification</span>
          <span>Edit Notification</span>
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={addNotification}>
        <div className="card p-4">
          <h5 className="mb-4">Notification Information</h5>

          <TextField label="Title" name="title" value={formFields.title} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Message" name="message" value={formFields.message} onChange={handleChange} fullWidth multiline rows={4} margin="normal" />

          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formFields.type}
              onChange={handleChange} // Sửa lại dùng handleChange thay vì handleRolesChange
              input={<OutlinedInput label="Type" />}
            >
              {typesList.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="form-group">
            <h6>Target Users</h6>
            <Autocomplete
              multiple
              id="users-autocomplete"
              options={usersWithAll}
              getOptionLabel={(option) => option.name || option.email || option._id}
              value={formFields.recipients}
              onChange={(event, newValue) => {
                // Nếu "All" được chọn
                if (newValue.some((item) => item._id === 'all')) {
                  // Nếu đã chọn All, bỏ tất cả trừ All
                  setFormFields((prev) => ({
                    ...prev,
                    recipients: userData,
                  }));
                } else {
                  // Nếu không có All thì set bình thường
                  setFormFields((prev) => ({
                    ...prev,
                    recipients: newValue,
                  }));
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Users" placeholder="Users" />
              )}
            />
          </div>
          <FormControl fullWidth margin="normal">
            <InputLabel>Applicable Roles</InputLabel>
            <Select
              multiple
              name="applicableRoles"
              value={formFields.applicableRoles}
              onChange={handleRolesChange}
              input={<OutlinedInput label="Applicable Roles" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {rolesList.map((role) => (
                <MenuItem key={role} value={role}>
                  <Checkbox checked={formFields.applicableRoles.indexOf(role) > -1} />
                  <ListItemText primary={role} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Button type="submit" disabled={isLoading} className="btn-blue btn-lg w-100 mt-4">
          <FaCloudUploadAlt /> &nbsp;
          {isLoading ? <CircularProgress color="inherit" size={24} /> : "CREATE NOTIFICATION"}
        </Button>
      </form>
    </div>
  );
};

export default AddNotification;
