import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from "@mui/material";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from "../../App";
import { fetchDataFromApi, editData } from "../../utils/api";
import { Autocomplete } from "@mui/material";

const rolesList = ["bronze","silver", "gold", "platium"];

const EditPromotionCode = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [formFields, setFormFields] = useState({
    code: "",
    description: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    maxUsage: "",
    usedCount: 0,
    startDate: "",
    endDate: "",
    status: "active",
    canCombine: false,
    note: "",
    type: 'product',
    applicableRoles: [],
    applicableCategoryIds: [],
  });

   useEffect(() => {
      //Lấy hết sản phẩm
      fetchDataFromApi("/api/products/getAll").then((res) => {
        setProductData(res || []);
      });
      //Lấy hết người dùng
      fetchDataFromApi("/api/category").then((res) => {
        setCategoryData(res?.categoryList || []);
      });
      //Lấy hết phân loại
      fetchDataFromApi("/api/user").then((res) => {
        setUserData(res?.data || []);
      });
    }, []);

  useEffect(() => {
    context.setProgress(20);
    fetchDataFromApi(`/api/promotionCode/${id}`).then((res) => {
      const data = res?.data;
      setFormFields({
        code: data?.code || "",
        description: data?.description || "",
        discountType: data?.discountType || "percent",
        discountValue: data?.discountValue || "",
        minOrderValue: data?.minOrderValue || "",
        maxUsage: data?.maxUsage || "",
        usedCount: data?.usedCount || 0,
        startDate: data?.startDate?.slice(0, 10) || "",
        endDate: data?.endDate?.slice(0, 10) || "",
        status: data?.status || "active",
        canCombine: data?.canCombine || false,
        note: data?.note || "",
        applicableRoles: data?.applicableRoles || [],
        type: data?.type,
        applicableCategoryIds: data?.applicableCategoryIds
      });
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormFields({
      ...formFields,
      [name]: type === "checkbox" ? checked : value,
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

  const updatePromotion = async (e) => {
    e.preventDefault();

    const requiredFields = ["code", "discountValue", "maxUsage"];
    for (let field of requiredFields) {
      if (!formFields[field]) {
        context.setAlertBox({
          open: true,
          msg: "Please fill all required fields.",
          error: true,
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // const payload = {
      //   ...formFields,
      //   applicableUsers: formFields.applicableUsers
      //     ? formFields.applicableUsers.split(",").map((u) => u.trim())
      //     : [],
      //   applicableProductIds: formFields.applicableProductIds
      //     ? formFields.applicableProductIds.split(",").map((id) => id.trim())
      //     : [],
      //   applicableCategoryIds: formFields.applicableCategoryIds
      //     ? formFields.applicableCategoryIds.split(",").map((id) => id.trim())
      //     : [],
      // };
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

          <TextField label="Promotion Code" name="code" value={formFields.code} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Description" name="description" value={formFields.description} onChange={handleChange} fullWidth multiline rows={3} margin="normal" />

          <FormControl fullWidth margin="normal">
            <InputLabel>Discount Type</InputLabel>
            <Select name="discountType" value={formFields.discountType} onChange={handleChange}>
              <MenuItem value="percent">Percent</MenuItem>
              <MenuItem value="amount">Fixed Amount</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Apply Type</InputLabel>
            <Select name="type" value={formFields.type} onChange={handleChange}>
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="shipping">Shipping</MenuItem>
            </Select>
          </FormControl>

          <TextField label="Discount Value" type="number" name="discountValue" value={formFields.discountValue} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Minimum Order Value" type="number" name="minOrderValue" value={formFields.minOrderValue} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Max Usage" type="number" name="maxUsage" value={formFields.maxUsage} onChange={handleChange} fullWidth margin="normal" />

          <TextField label="Start Date" type="date" name="startDate" value={formFields.startDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" type="date" name="endDate" value={formFields.endDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />

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

          
          {/* <div className="form-group">
            <h6>Applicable Products</h6>
            <Autocomplete
              multiple
              id="products-autocomplete"
              options={productData}
              getOptionLabel={(option) => option.name}
              value={formFields.applicableProductIds}
              onChange={(event, newValue) => {
                setFormFields((prev) => ({
                  ...prev,
                  applicableProductIds: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Products" placeholder="Products" />
              )}
            />
          </div> */}
          <div className="form-group">
            <h6>Applicable Categories</h6>
            <Autocomplete
              multiple
              id="categories-autocomplete"
              options={categoryData}
              getOptionLabel={(option) => option.name}
              value={formFields.applicableCategoryIds}
              onChange={(event, newValue) => {
                setFormFields((prev) => ({
                  ...prev,
                  applicableCategoryIds: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Categories" placeholder="Categories" />
              )}
            />
          </div>
          
          <TextField label="Note" name="note" value={formFields.note} onChange={handleChange} fullWidth multiline rows={2} margin="normal" />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={formFields.status} onChange={handleChange}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="hide">Hide</MenuItem>
            </Select>
          </FormControl>

          <div className="form-group mt-2">
            <label>
              <Checkbox checked={formFields.canCombine} onChange={handleChange} name="canCombine" />
              Can be combined with other codes
            </label>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="btn-blue btn-lg w-100 mt-4">
          <FaCloudUploadAlt /> &nbsp;
          {isLoading ? <CircularProgress color="inherit" size={24} /> : "UPDATE PROMOTION CODE"}
        </Button>
      </form>
    </div>
  );
};

export default EditPromotionCode;

// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   Button,
//   CircularProgress,
//   Select,
//   MenuItem,
//   TextField,
//   Breadcrumbs,
// } from "@mui/material";
// import { FaCloudUploadAlt } from "react-icons/fa";
// import { MyContext } from "../../App";
// import { fetchDataFromApi, editData } from "../../utils/api";

// const EditPromotionCode = () => {
//   const navigate = useNavigate();
//   const context = useContext(MyContext);
//   const { id } = useParams();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formFields, setFormFields] = useState({
//     code: "",
//     description: "",
//     discountPercent: "",
//     maxUsage: "",
//     status: "active", // Default is active
//   });

//   // Fetch blog data on component mount
//   useEffect(() => {
//     context.setProgress(20);
//     fetchDataFromApi(`/api/promotionCode/${id}`)
//       .then((res) => {
//         setFormFields({
//           code: res?.data?.code,
//           description: res?.data?.description,
//           discountPercent: res?.data?.discountPercent,
//           maxUsage: res?.data?.maxUsage,
//           status: res?.data?.status,
//         });
//       })
      
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormFields({ ...formFields, [name]: value });
//   };

//   const updatePromotion = async (e) => {
//     e.preventDefault();

//     if (!formFields.code || !formFields.discountPercent || !formFields.maxUsage) {
//       context.setAlertBox({
//         open: true,
//         msg: "Please fill all required fields.",
//         error: true,
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       await editData(`/api/promotionCode/${id}`, formFields);
//       context.setAlertBox({
//         open: true,
//         msg: "Promotion code updated successfully!",
//         error: false,
//       });
//       navigate("/promotionCode");
//     } catch (error) {
//       context.setAlertBox({
//         open: true,
//         msg: "Error updating promotion code.",
//         error: true,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="right-content w-100">
//       <div className="card shadow border-0 w-100 flex-row p-4">
//         <h5 className="mb-0">Edit Promotion Code</h5>
//         <Breadcrumbs aria-label="breadcrumb" className="ml-auto">
//           <span>Dashboard</span>
//           <span>Promotions</span>
//           <span>Edit Promotion</span>
//         </Breadcrumbs>
//       </div>

//       <form className="form" onSubmit={updatePromotion}>
//         <div className="card p-4">
//           <h5 className="mb-4">Promotion Information</h5>

//           <div className="form-group">
//             <h6>Promotion Code</h6>
//             <input
//               type="text"
//               name="code"
//               value={formFields.code}
//               onChange={handleChange}
//             />
//           </div>
//           <div className="form-group">
//             <h6>Description</h6>
//             <textarea
//               name="description"
//               value={formFields.description}
//               onChange={handleChange}
//               rows={3}
//             />
//           </div>

//           <div className="form-group">
//             <h6>Discount Percent (%)</h6>
//             <input
//               type="number"
//               name="discountPercent"
//               value={formFields.discountPercent}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <h6>Max Usage</h6>
//             <input
//               type="number"
//               name="maxUsage"
//               value={formFields.maxUsage}
//               onChange={handleChange}
//             />
//           </div>

//           <div className="form-group">
//             <h6>Status</h6>
//             <Select name="status" value={formFields.status} onChange={handleChange}>
//               <MenuItem value="active">Active</MenuItem>
//               <MenuItem value="hide">Hide</MenuItem>
//             </Select>
//           </div>
//         </div>

//         <Button
//           type="submit"
//           disabled={isLoading}
//           className="btn-blue btn-lg w-100 mt-4"
//         >
//           <FaCloudUploadAlt /> &nbsp;
//           {isLoading ? <CircularProgress color="inherit" className="loader" /> : "UPDATE PROMOTION CODE"}
//         </Button>
//       </form>
//     </div>
//   );
// };

// export default EditPromotionCode;