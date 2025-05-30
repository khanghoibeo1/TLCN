import React, { useContext, useEffect, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { MyContext } from "../../App";
import { fetchDataFromApi, editData } from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { MenuItem, TextField, Autocomplete } from "@mui/material";
import SearchBox from "../../components/SearchBox";

// Breadcrumb style
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

const EditBatchCode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationStore, setLocationStore] = useState([]);
  const [productData, setProductData] = useState([]);
  const [maxAmount, setMaxAmount] = useState(null);
  const [formFields, setFormFields] = useState({
    batchName: "",
    productId: "",
    productName: "",
    amount: null,
    importDate: "",
    expiredDate: "",
    price: null,
    oldPrice: null,
    discount: null,
    locationName: "",
    locationId: "",
    note: "",
  });

  const history = useNavigate();
  const context = useContext(MyContext);
  const { id } = useParams();

  // Fetch danh sách location từ API
  useEffect(() => {
    fetchDataFromApi("/api/storeLocations").then((res) => {
      setLocationStore(res?.data || []);
    });
    fetchDataFromApi("/api/products/getAll").then((res) => {
      setProductData(res || []);
    });
  }, []);

  useEffect(() => {
    context.setProgress(20);
    fetchDataFromApi(`/api/batchCodes/${id}`).then((res) => {
      setFormFields({
        batchName: res?.batchName || "",
        productId: res?.productId || "",
        productName: res?.productName || "",
        amount: res?.amount || "",
        importDate: res.importDate ? res.importDate.split("T")[0] : "",
        expiredDate: res.expiredDate ? res.expiredDate.split("T")[0] : "",
        price: res?.price || "",
        oldPrice: res?.oldPrice || "",
        discount: res?.discount || "",
        locationName: res?.locationName || "",
        locationId: res?.locationId || "",
        note: res?.note || "",
      });
      context.setProgress(100);
    });
  }, [id]);

  
  // Chọn location
  const selectLocation = (location) => {
    setFormFields({
      ...formFields,
      locationName: location.location,
      locationId: location.id,
    });
  };

  // Chọn product
  const handleSelectProduct = (product) => {
    if (!product) return;
    setFormFields({
      ...formFields,
      productName: product.name,
      productId: product.id,
    });
    // Gọi API để lấy tổng amountRemain
      fetchDataFromApi(`/api/batchCodes/amountRemainTotal/getSum?productId=${product.id}`).then((res) => {
      setMaxAmount(res.total || 0);  // Giả sử API trả về { total: 150 }
    });
  };
  

  const changeInput = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };
  //COUNT FOR PRICE BY OLD PRICE AND DISCOUNT
  useEffect(() => {
    if(formFields.oldPrice === '' || formFields.discount === ''){
      setFormFields((prevFields) => ({
        ...prevFields,
        price: '',
      }));
    }
    if (formFields.oldPrice && formFields.discount) {
      const discountedPrice = formFields.oldPrice - (formFields.oldPrice * (formFields.discount / 100));
      setFormFields((prevFields) => ({
        ...prevFields,
        price: discountedPrice.toFixed(0),
      }));
    }
  }, [formFields.oldPrice, formFields.discount]); 

  const editBatch = (e) => {
    e.preventDefault();

    if (
      formFields.batchName &&
      formFields.productId &&
      formFields.amount &&
      formFields.importDate &&
      formFields.expiredDate &&
      formFields.price 
    ) {
      setIsLoading(true);

      editData(`/api/batchCodes/${id}`, formFields).then(() => {
        setIsLoading(false);
        history("/batchCodes");
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill all the details",
      });
    }
  };
  
    const onSearch = (keyword) => {
        if(keyword!==""){
          fetchDataFromApi(`/api/search/product?q=${keyword}&page=1&perPage=${10000}`).then((res) => {
            setProductData(res.products);
          })
        }else{
          fetchDataFromApi(`/api/products/getAll`).then((res) => {
            setProductData(res);
          })
        } 
    }

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 mt-2">
        <h5 className="mb-0">Edit Batch Code</h5>
        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
          <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
          <StyledBreadcrumb component="a" label="Batch Codes" href="#" deleteIcon={<ExpandMoreIcon />} />
          <StyledBreadcrumb label="Edit Batch Code" deleteIcon={<ExpandMoreIcon />} />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={editBatch}>
        <div className="row">
          <div className="col-sm-9">
            <div className="card p-4 mt-0">
              <div className="form-group">
                <h6>Batch Name</h6>
                <input type="text" name="batchId" value={formFields.batchName} onChange={changeInput} />
              </div>

              {/* <div className="form-group">
                <h6>Product ID</h6>
                <input type="text" name="productId" value={formFields.productId} onChange={changeInput} />
              </div>

              <div className="form-group">
                <h6>Product Name</h6>
                <input type="text" name="productName" value={formFields.productName} onChange={changeInput} />
              </div> */}

              {/* <div className="mb-3">
                <h6 style={{fontSize: "13px"}}>Search Product</h6>
                <SearchBox onSearch={onSearch} />
              </div>

              <div className="form-group">
                <h6>Product List</h6>
                <div  
                  style={{ 
                    maxHeight: "200px", 
                    overflowY: "auto", 
                    border: "1px solid rgb(144, 144, 144)", 
                    borderRadius: "8px", 
                    padding: "10px",
                  }}>
                  {productData.length > 0 ? (
                  productData.map((product) => (
                    <MenuItem key={product.id} onClick={() => handleSelectProduct(product)}>
                      {product.name}
                    </MenuItem>
                  ))
                ) : (
                  <p>No products found</p>
                )}
                </div>
                
              </div> */}
              <div className="form-group">
                <h6>Choose Product</h6>
                <Autocomplete
                  options={productData}
                  getOptionLabel={(option) => option.name || ""}
                  onChange={(event, newValue) => handleSelectProduct(newValue)}
                  value={productData.find((p) => p.id === formFields.productId) || null}
                  renderInput={(params) => <TextField {...params} label="Select Product" />}
                />
              </div>

              <div className="form-group">
                <h6>Selected Product</h6>
                <input value={formFields.productName} disabled />
              </div>

              <div className="form-group">
                <h6>Amount</h6>
                <input
                  type="number"
                  name="amount"
                  value={formFields.amount}
                  max={maxAmount !== null ? maxAmount : undefined}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (maxAmount !== null && value > maxAmount) {
                      context.setAlertBox({
                        open: true,
                        error: true,
                        msg: `Amount cannot exceed available amount: ${maxAmount}`,
                      });
                      return;
                    }
                    changeInput(e);
                  }}
                />
                {maxAmount !== null && (
                  <small style={{ color: "gray" }}>
                    Maximum available: {maxAmount}
                  </small>
                )}
              </div>

              <div className="form-group">
                <h6>Import Date</h6>
                <input type="date" name="importDate" value={formFields.importDate} onChange={changeInput} />
              </div>

              <div className="form-group">
                <h6>Expired Date</h6>
                <input type="date" name="expiredDate" value={formFields.expiredDate} onChange={changeInput} />
              </div>
  
              <div className="form-group">
                <h6>Old Price</h6>
                <input type="number" name="oldPrice" value={formFields.oldPrice} onChange={changeInput} />
              </div>
   
              <div className="form-group">
                <h6>Discount</h6>
                <input type="number" name="discount" value={formFields.discount} onChange={changeInput} />
              </div>

              <div className="form-group">
                <h6>Price</h6>
                <input type="number" name="price" value={formFields.price} onChange={changeInput} />
              </div>
              
              {/* <div className="form-group">
                <h6>Location Name</h6>
                <input type="text" name="locationName" value={formFields.locationName} onChange={changeInput} />
              </div> */}
              
              {/* <div className="form-group">
                <h6>Location Name</h6>
                <Select value={formFields.locationId} onChange={(e) => selectLocation(locationStore.find(loc => loc.id === e.target.value))} displayEmpty>
                  <MenuItem value='' disabled>Choose Location</MenuItem>
                  {locationStore.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.location}
                    </MenuItem>
                  ))}
                </Select>
              </div> */}

              <div className="form-group">
                <h6>Note</h6>
                <input type="text" name="note" value={formFields.note} onChange={changeInput} />
              </div>

              <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                <FaCloudUploadAlt /> &nbsp; {isLoading ? <CircularProgress color="inherit" className="loader" /> : "UPDATE AND VIEW"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBatchCode;
