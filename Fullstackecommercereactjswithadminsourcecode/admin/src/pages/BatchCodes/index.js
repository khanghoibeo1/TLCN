import React, { useContext, useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import { emphasize, styled } from '@mui/material/styles';
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchBox from "../../components/SearchBox";
import Pagination from "@mui/material/Pagination";
import DashboardBox from "../Dashboard/components/dashboardBox";
import { MdShoppingBag } from "react-icons/md";
import { deleteData, fetchDataFromApi } from "../../utils/api";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const BatchCodeList = () => {
    const [batchCodes, setBatchCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [showBy, setshowBy] = useState(10);
    const [percentRemain, setPercentRemain] = useState("");
    const [dayRemain, setDayRemain] = useState("");
    const [querySearch, setQuerySearch] = useState('');

    const context = useContext(MyContext);
    const user = context.user;
    console.log(user)

    useEffect(() => {
        context.setProgress(20);
        fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${querySearch}&page=1&perPage=${perPage}`).then((res) => {
            setBatchCodes(res);
            context.setProgress(100);
        });
    }, [percentRemain, dayRemain, perPage, user]);

    const deleteBatchCode = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete?");
        if (!confirmDelete) return;
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if (userInfo?.role === "mainAdmin") {
            setIsLoading(true);
            context.setProgress(30);
            deleteData(`/api/batchCodes/${id}`).then(() => {
                context.setProgress(100);
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: "Batch Code Deleted!"
                });
                setIsLoading(false);
                fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${querySearch}&page=1&perPage=${perPage}`).then((res) => {
                    setBatchCodes(res);
                    context.setProgress(100);
                });
            });
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Only Admin can delete ",
            });
        }
    };

    const onSearch = (keyword) => {
        setQuerySearch(keyword)
        if(keyword!==""){
          fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${keyword}&page=1&perPage=${perPage}`).then((res) => {
            setBatchCodes(res);
          })
        }else{
          fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${keyword}&page=1&perPage=${perPage}`).then((res) => {
            setBatchCodes(res);
          })
        }} 

    const showPerPage = (e) => {
        setshowBy(e.target.value);
        fetchDataFromApi(
          `/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${querySearch}&page=1&perPage=${e.target.value}`
        ).then((res) => {
          setBatchCodes(res);
          context.setProgress(100);
        });
      };
    const handleChange = (event, value) => {
        context.setProgress(40);
        fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&locationName=${user.locationName}&percentage=${percentRemain}&expiredDay=${dayRemain}&q=${querySearch}&page=${value}&perPage=${perPage}`).then((res) => {
            setBatchCodes(res);
            context.setProgress(100);
        }); 
    };
    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Batch Codes</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
                        <StyledBreadcrumb label="Batch Codes" deleteIcon={<ExpandMoreIcon />} />
                    </Breadcrumbs>
                    {user.locationId === null && <Link to="/batchCode/add"><Button className="btn-blue ml-3 pl-3 pr-3">Add Batch Code</Button></Link>}
                </div>
            </div>
            <div className="row dashboardBoxWrapperRow dashboardBoxWrapperRowV2 pt-0">
                <div className="col-md-12">
                    <div className="dashboardBoxWrapper d-flex">
                        <DashboardBox
                        color={["#1da256", "#48d483"]}
                        icon={<MdShoppingBag />}
                        title="Total Batch Codes"
                        count={batchCodes?.totalBatches}
                        grow={true}
                        />
                    </div>
                </div>
            </div>
            <div className="card shadow border-0 p-3 mt-4">
                <div className="row cardFilters mt-3">
                    <div className="col-md-3">
                        <h4>SHOW BY</h4>
                        <FormControl size="small" className="w-100">
                        <Select
                            value={showBy}
                            onChange={showPerPage}
                            displayEmpty
                            inputProps={{ "aria-label": "Without label" }}
                            className="w-100"
                        >
                            {[10, 20, 30, 40, 50, 60, 70].map(value => (
                            <MenuItem key={value} value={value}>{value}</MenuItem>
                            ))}
                        </Select>
                        </FormControl>
                    </div>

                    <div className="col-md-3">
                        <h4>Percent Remain</h4>
                        <input
                        type="number"
                        className="form-control"
                        placeholder="Percentage amountRemain"
                        value={percentRemain}
                        onChange={(e) => setPercentRemain(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3">
                        <h4>Day Remain</h4>
                        <input
                        type="number"
                        className="form-control"
                        placeholder="Days to expired day"
                        value={dayRemain}
                        onChange={(e) => setDayRemain(e.target.value)}
                        />
                    </div>

                    <div className="col-md-3 mt-3 d-flex justify-content-end align-items-end">
                        <div className="searchWrap d-flex">
                        <SearchBox onSearch={onSearch} />
                        </div>
                    </div>
                </div>

                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped v-align">
                        <thead className="thead-dark">
                            <tr>
                                <th>BatchName</th>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Amount</th>
                                <th>Remain</th>
                                <th>Import Date</th>
                                <th>Expired Date</th>
                                <th>Price</th>
                                <th>LocationName</th>
                                <th>Note</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchCodes?.batches?.length > 0 && batchCodes?.batches.map((batch, index) => (
                                <tr key={index}>
                                    <td>{batch.batchName}</td>
                                    <td>{batch.productId}</td>
                                    <td>{batch.productName}</td>
                                    <td>{batch.amount}</td>
                                    <td>{batch.amountRemain}</td>
                                    <td>{new Date(batch.importDate).toLocaleDateString()}</td>
                                    <td>{new Date(batch.expiredDate).toLocaleDateString()}</td>
                                    <td>{batch.price}</td>
                                    {batch.locationName ? <td>{batch.locationName}</td> : <td>Main Store</td>}
                                    <td>{batch.note}</td>
                                    <td>
                                        <div className="actions d-flex align-items-center">
                                            <Link to={`/batchCode/edit/${batch._id}`}>
                                                <Button className="success" color="success"><FaPencilAlt /></Button>
                                            </Link>
                                            <Button className="error" color="error" onClick={() => deleteBatchCode(batch._id)} disabled={isLoading}>
                                                <MdDelete />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {batchCodes?.totalPages >= 1 && (
                    <div className="d-flex tableFooter">
                    <Pagination
                        count={batchCodes?.totalPages}
                        color="primary"
                        className="pagination"
                        showFirstButton
                        showLastButton
                        onChange={handleChange}
                    />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BatchCodeList;
