import React, { useContext, useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchBox from "../../components/SearchBox";
import { deleteData, fetchDataFromApi, postData, updateData } from "../../utils/api";

const RequestBatchCode = () => {
    const [batchCodes, setBatchCodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(MyContext);
    const user = context.user;
    console.log(user)

    useEffect(() => {
        context.setProgress(20);
        fetchDataFromApi(`/api/batchCodes/locationBatchCode?locationId=${user.locationId}&&locationName=${user.locationName}`).then((res) => {
            setBatchCodes(res);
            console.log(res)
            context.setProgress(100);
        });
    }, []);

    const deleteBatchCode = (id) => {
        setIsLoading(true);
        context.setProgress(30);
        deleteData(`/api/batchCodes/${id}`).then(() => {
            setBatchCodes(batchCodes.filter(batch => batch._id !== id));
            context.setProgress(100);
            setIsLoading(false);
        });
    };

    const handleChangeStatus = (e, id) => {
        const newStatus = e.target.value;
        postData(`/api/batchCodes/${id}/status`, { status: newStatus }).then(() => {
            setBatchCodes(batchCodes.map(batch => batch._id === id ? { ...batch, status: newStatus } : batch));
        });
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                <h5 className="mb-0">Batch Codes</h5>
                <div className="ml-auto d-flex align-items-center">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Chip component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
                        <Chip label="Batch Codes" deleteIcon={<ExpandMoreIcon />} />
                    </Breadcrumbs>
                    {user.locationId !== null && <Link to="/batchCode/add"><Button className="btn-blue ml-3 pl-3 pr-3">Add Batch Code</Button></Link>}
                </div>
            </div>
            <div className="card shadow border-0 p-3 mt-4">
                <SearchBox onSearch={(keyword) => {
                    fetchDataFromApi(`/api/search/batchCode?q=${keyword}`).then((res) => {
                        setBatchCodes(res.data);
                    });
                }} />
                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped v-align">
                        <thead className="thead-dark">
                            <tr>
                                <th>Batch Name</th>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Amount</th>
                                <th>Import Date</th>
                                <th>Expired Date</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchCodes?.map((batch) => (
                                <tr key={batch._id}>
                                    <td>{batch.batchName}</td>
                                    <td>{batch.productId}</td>
                                    <td>{batch.productName}</td>
                                    <td>{batch.amount}</td>
                                    <td>{batch.importDate ? new Date(batch.importDate).toLocaleDateString() : ""}</td>
                                    <td>{batch.importDate ? new Date(batch.expiredDate).toLocaleDateString() : ""}</td>
                                    <td>{batch.price}</td>
                                    <td>
                                        { (
                                            <Select
                                                disabled={isLoading}
                                                value={batch.status}
                                                onChange={(e) => handleChangeStatus(e, batch._id)}
                                                displayEmpty
                                                size="small"
                                            >
                                                {batch.status === "pending" && <MenuItem value="pending">Pending</MenuItem>}
                                                {(user.role === "mainAdmin" || batch.status === "delivered") && (
                                                    <MenuItem value="delivered">Delivered</MenuItem>
                                                )}
                                            </Select>
                                        ) }
                                    </td>
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
            </div>
        </div>
    );
};

export default RequestBatchCode;
