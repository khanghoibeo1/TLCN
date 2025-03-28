import React, { useContext, useEffect, useState } from "react";
import Button from '@mui/material/Button';

import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Pagination from '@mui/material/Pagination';
import { MyContext } from "../../App";

import { Link } from "react-router-dom";

import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { deleteData, editData, fetchDataFromApi } from "../../utils/api";

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

//breadcrumb code
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


const StoreLocation = () => {

    const [storeLocationData, setStoreLocationData] = useState([]);
    const [isLoadingBar, setIsLoadingBar] = useState(false);
    const context = useContext(MyContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setProgress(20)
        fetchDataFromApi('/api/storeLocations').then((res) => {
            setStoreLocationData(res);
            context.setProgress(100);
        })

    }, []);

    const deleteStoreLocation = (id) => {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if(userInfo?.email==="admin@admin.com"){
       
            setIsLoadingBar(true);
            context.setProgress(30);
            deleteData(`/api/storeLocations/${id}`).then(res => {
                context.setProgress(100);
                fetchDataFromApi('/api/storeLocations').then((res) => {
                    setStoreLocationData(res);
                    context.setProgress(100);
                    context.setProgress({
                        open: true,
                        error: false,
                        msg: "Store Location Deleted!"
                    })
                    setIsLoadingBar(false);
                })
            })
        }

        else{
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Only Admin can delete locations",
            });
           }
    }



    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">Store Locations</h5>

                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />

                            <StyledBreadcrumb
                                label="Store Location"
                                deleteIcon={<ExpandMoreIcon />}

                            />
                        </Breadcrumbs>

                        <Link to="/storeLocations/add"><Button className="btn-blue  ml-3 pl-3 pr-3">Add Store Locations</Button></Link>


                    </div>
                </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered table-striped v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>STORE LOCATIONS</th>
                                    <th>DETAIL ADDRESS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    storeLocationData?.data?.length !== 0 && storeLocationData?.data?.slice(0)
                                    .reverse().map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{item.location}	</td>
                                                <td>{item.detailAddress}</td>
                                                <td>
                                                    <div className="actions d-flex align-items-center">
                                                        <Link to={`/storeLocations/edit/${item.id}`}> <Button className="success" color="success"><FaPencilAlt /></Button>
                                                        </Link>

                                                        <Button className="error" color="error" onClick={() => deleteStoreLocation(item.id)}
                                                        disabled={isLoadingBar===true ? true : false}><MdDelete /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }



                            </tbody>

                        </table>

                    </div>


                </div>
            </div>


        </>
    )
}

export default StoreLocation;