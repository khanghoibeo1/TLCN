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
import SearchBox from '../../components/SearchBox';
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


const PostType = () => {

    const [postTypeData, setPostTypeData] = useState([]);
    const [isLoadingBar, setIsLoadingBar] = useState(false);
    const context = useContext(MyContext);

    useEffect(() => {
        window.scrollTo(0, 0);
        context.setProgress(20)
        fetchDataFromApi('/api/postTypes').then((res) => {
            setPostTypeData(res);
            context.setProgress(100);
        })

    }, []);

    const deletePostType = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete?");
        if (!confirmDelete) return;
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if(userInfo?.email==="admin@admin.com"){
       
            setIsLoadingBar(true);
            context.setProgress(30);
            deleteData(`/api/postTypes/${id}`).then(res => {
                context.setProgress(100);
                fetchDataFromApi('/api/postTypes').then((res) => {
                    setPostTypeData(res);
                    context.setProgress(100);
                    context.setProgress({
                        open: true,
                        error: false,
                        msg: "Post Type Deleted!"
                    })
                    setIsLoadingBar(false);
                })
            })
        }

        else{
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Only Admin can delete Category",
            });
           }
    }

    const onSearch = (keyword) => {
        if (keyword !== "") {
          fetchDataFromApi(`/api/search/postType?q=${keyword}`).then((res) => {
            setPostTypeData(res.data);
          });
        } else {
          fetchDataFromApi(`/api/postTypes`).then((res) => {
            setPostTypeData(res);
          });
        }
      };


    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">Blog Types</h5>
                    

                    <div className="ml-auto d-flex align-items-center">
                        <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                            <StyledBreadcrumb
                                component="a"
                                href="#"
                                label="Dashboard"
                                icon={<HomeIcon fontSize="small" />}
                            />

                            <StyledBreadcrumb
                                label="Blog Types"
                                deleteIcon={<ExpandMoreIcon />}

                            />
                        </Breadcrumbs>

                        <Link to="/postTypes/add"><Button className="btn-blue  ml-3 pl-3 pr-3">Add Blog Types</Button></Link>


                    </div>
                </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <div className="row cardFilters mt-3">
                        <div className="col-md-6 d-flex justify-content-end">
                            <div className="searchWrap d-flex">
                                <SearchBox onSearch={onSearch} />
                            </div>
                        </div>
                    </div>
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered table-striped v-align">
                            <thead className="thead-dark">
                                <tr>

                                    <th>BLOG TYPES</th>
                                    <th>NOTE</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    postTypeData?.length !== 0 && postTypeData?.slice(0)
                                    .reverse().map((item, index) => {
                                        return (
                                            <tr key={index}>

                                                
                                                <td>{item.name}	</td>
                                                <td>{item.note}	</td>
                                                <td>
                                                    <div className="actions d-flex align-items-center">
                                                        <Link to={`/postTypes/edit/${item._id}`}   >                                         <Button className="success" color="success"><FaPencilAlt /></Button>
                                                        </Link>

                                                        <Button className="error" color="error" onClick={() => deletePostType(item._id)}
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

export default PostType;