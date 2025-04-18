import React, { useContext, useEffect, useState } from "react";
import Button from '@mui/material/Button';
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchBox from "../../components/SearchBox";
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
    const context = useContext(MyContext);
    const user = context.user;
    console.log(user)

    useEffect(() => {
        context.setProgress(20);
        fetchDataFromApi(`/api/batchCodes?locationId=${user.locationId}&&locationName=${user.locationName}`).then((res) => {
            setBatchCodes(res);
            context.setProgress(100);
        });
    }, []);

    const deleteBatchCode = (id) => {
        setIsLoading(true);
        context.setProgress(30);
        deleteData(`/api/batchCodes/${id}`).then(() => {
            setBatchCodes(batchCodes.filter(batch => batch._id !== id));
            context.setProgress(100);
            context.setAlertBox({
                open: true,
                error: false,
                msg: "Batch Code Deleted!"
            });
            setIsLoading(false);
        });
    };

    const onSearch = (keyword) => {
        if(keyword!==""){
          fetchDataFromApi(`/api/search/batchCode?q=${keyword}`).then((res) => {
            setBatchCodes(res.data);
          })
        }else{
          fetchDataFromApi(`/api/batchCodes?location=${user.locationId}`).then((res) => {
            setBatchCodes(res);
          })
        }} 

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
            <div className="card shadow border-0 p-3 mt-4">
                <div className="col-md-6 d-flex justify-content-end">
                    <div className="searchWrap d-flex">
                    <SearchBox onSearch={onSearch}/>
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
                            {batchCodes.length > 0 && batchCodes?.map((batch, index) => (
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
            </div>
        </div>
    );
};

export default BatchCodeList;
