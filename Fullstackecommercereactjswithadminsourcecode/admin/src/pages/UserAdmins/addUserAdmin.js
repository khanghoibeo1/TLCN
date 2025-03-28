import React, { useState, useContext, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import { fetchDataFromApi, postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { MenuItem, Select } from "@mui/material";

// Breadcrumb
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

// Danh sách các role có thể chọn
const roles = [
  { name: "Main Admin", value: "mainAdmin" },
  { name: "Store Admin", value: "storeAdmin" },
  { name: "Staff", value: "staff" },
];

const AddUserAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationStore, setLocationStore] = useState([]); // Danh sách location từ API
  const [formFields, setFormFields] = useState({
    name: "",
    phone: "",
    email: "",
    status: "active",
    images: [],
    locationManageName: "",
    locationManageId: "",
    role: "",
    password: "",
  });

  const navigate = useNavigate();
  const context = useContext(MyContext);

  // Fetch danh sách location từ API
  useEffect(() => {
    fetchDataFromApi("/api/storeLocations").then((res) => {
      setLocationStore(res?.data || []);
    });
  }, []);

  // Xử lý thay đổi input
  const changeInput = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  // Chọn role
  const selectRole = (role) => {
    setFormFields({ ...formFields, role });
  };

  // Chọn location
  const selectLocation = (location) => {
    setFormFields({
      ...formFields,
      locationManageName: location.location,
      locationManageId: location.id,
    });
  };

  // Gửi dữ liệu tạo user
  const addUserAdmin = async (e) => {
    e.preventDefault();
    if (formFields.name !== "" && formFields.email !== "" && formFields.role !== "" && formFields.locationManageId !== "") {
      setIsLoading(true);
      try {
        await postData(`/api/user/userAdmin/create`, formFields);
        setIsLoading(false);
        navigate("/userAdmins");
      } catch (error) {
        setIsLoading(false);
        context.setAlertBox({ open: true, error: true, msg: "Error creating user" });
      }
    } else {
      context.setAlertBox({ open: true, error: true, msg: "Please fill all required fields" });
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Add User Admin</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component="a" label="User Admin" href="#" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Add User Admin" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={addUserAdmin}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="form-group">
                <h6>Name</h6>
                <input type="text" name="name" value={formFields.name} onChange={changeInput} />
              </div>

              <div className="form-group">
                <h6>Phone</h6>
                <input type="text" name="phone" value={formFields.phone} onChange={changeInput} />
              </div>

              <div className="form-group">
                <h6>Email</h6>
                <input type="email" name="email" value={formFields.email} onChange={changeInput} />
              </div>

              {/* Dropdown chọn Location */}
              <div className="form-group">
                <h6>Location</h6>
                <Select value={formFields.locationManageId} onChange={(e) => selectLocation(locationStore.find(loc => loc.id === e.target.value))} displayEmpty>
                  <MenuItem value="" disabled>Choose Location</MenuItem>
                  {locationStore.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.location}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              {/* Dropdown chọn Role */}
              <div className="form-group">
                <h6>Role</h6>
                <Select value={formFields.role} onChange={(e) => selectRole(e.target.value)} displayEmpty>
                  <MenuItem value="" disabled>Choose Role</MenuItem>
                  {roles.map((role, index) => (
                    <MenuItem key={index} value={role.value}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              <div className="form-group">
                <h6>Password</h6>
                <input type="password" name="password" value={formFields.password} onChange={changeInput} />
              </div>

              <Button type="submit" className="btn-blue btn-lg btn-big w-100 mt-4">
                <FaCloudUploadAlt /> &nbsp;
                {isLoading ? <CircularProgress color="inherit" className="loader" /> : "CREATE USER"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserAdmin;
