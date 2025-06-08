import React, { useContext, useEffect, useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { Button, FormControl, Select, MenuItem } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { MdDelete } from "react-icons/md";
import DashboardBox from "../Dashboard/components/dashboardBox";
import SearchBox from "../../components/SearchBox";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
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


const UserAdmin = () => {

    const [userAdminData, setUserAdminData] = useState([]);
    const [storeLocationData, setStoreLocationData] = useState([]);
    const [isLoadingBar, setIsLoadingBar] = useState(false);
    const [page, setPage] = useState(1);
    const [showBy, setShowBy] = useState(10);
    const [perPage, setPerPage] = useState(10);
    const [querySearch, setQuerySearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");
    const [totalUserAdmins, setTotalUserAdmins] = useState(0);

    const history = useNavigate();

    const context = useContext(MyContext);
    const userContext = context.user;


    const loadUsers = () => {
      context.setProgress(40);
      fetchDataFromApi(`/api/admin/userAdmin?q=${querySearch}&locationSearch=${locationSearch}&page=1&perPage=10&locationId=${userContext.locationId}`)
        .then((res) => {
          setUserAdminData(res);
          setTotalUserAdmins(res.totalUsers);
          context.setProgress(100);
        })
        .catch(() => context.setProgress(100));
      };

    useEffect(() => {
      loadUsers();
      context.setProgress(40);
      fetchDataFromApi(`/api/storeLocations`)
        .then((res) => {
          setStoreLocationData(res.data);
          context.sestProgress(100);
        })
        .catch(() => context.setProgress(100));
    }, []);

    const deleteUserAdmin = (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete?");
      if (!confirmDelete) return;
      const userInfo = JSON.parse(localStorage.getItem("user"));
        if (userInfo?.role === "mainAdmin") {
          deleteData(`/api/admin/userAdmin/${id}`).then(() => {
            context.setAlertBox({
              open: true,
              error: false,
              msg: "User Admin Deleted!",
            });
            loadUsers(page, perPage);
          });
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Only Admin can delete",
            });
        }
      };
    
    const handleChange = (event, value) => {
      context.setProgress(40);
      fetchDataFromApi(`/api/admin/userAdmin?q=${querySearch}&locationSearch=${locationSearch}&page=${value}&perPage=10&locationId=${userContext.locationId}`).then((res) => {
          setUserAdminData(res);
          context.setProgress(100);
      }); 
    };

    const showByStore = (e) => {
        setLocationSearch(e.target.value);
        fetchDataFromApi(`/api/admin/userAdmin?q=${querySearch}&locationSearch=${e.target.value}&page=1&perPage=10&locationId=${userContext.locationId}`).then((res) => {
          setUserAdminData(res);
          context.setProgress(100);
        });
      };

    const onSearch = (keyword) => {
      setQuerySearch(keyword)
      fetchDataFromApi(`/api/admin/userAdmin?q=${keyword}&locationSearch=${locationSearch}&page=1&perPage=10&locationId=${userContext.locationId}`).then((res) => {
        setUserAdminData(res);
      });
    };


    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
                    <h5 className="mb-0">User Admin</h5>

                    <div className="ml-auto d-flex align-items-center">
                      <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb
                          component="a"
                          href="#"
                          label="Dashboard"
                          icon={<HomeIcon fontSize="small" />}
                        />
                        <StyledBreadcrumb
                          label="User Admin"
                          deleteIcon={<ExpandMoreIcon />}
                        />
                    </Breadcrumbs>
                    <Link to="/userAdmin/add"><Button className="btn-blue  ml-3 pl-3 pr-3">Add User Admin</Button></Link>
                  </div>
                </div>
                  <div className="row dashboardBoxWrapperRow pt-0">
                    <div className="col-md-12">
                      <div className="dashboardBoxWrapper d-flex">
                        <DashboardBox color={["#1da256", "#48d483"]} title="Total Users" 
                          onClick={() => history('/users')} count={totalUserAdmins} />
                      </div>
                    </div>
                  </div>

                <div className="card shadow border-0 p-3 mt-4">
                    <h3 className="hd">Admins</h3>
                    <div className="row cardFilters mt-3">
                      {userContext.locationId === null && <div className="col-md-3">
                          <h4>SHOW BY LOCATION</h4>
                          <FormControl size="small" className="w-100">
                            <Select
                              value={locationSearch}
                              onChange={showByStore}
                              displayEmpty
                              className="w-100"
                            >
                              <MenuItem value="">
                                <em>All Locations</em>
                              </MenuItem>
                              {storeLocationData?.map((loc) => (
                                <MenuItem key={loc.id} value={loc.id}>
                                  {loc.location}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>}
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
                            <th>NAME</th>
                            <th>EMAIL</th>
                            <th>PHONE</th>
                            <th>ROLE</th>
                            <th>LOCATION</th>
                            <th>STATUS</th>
                            <th>ACTION</th>
                          </tr>
                        </thead>

                        <tbody>
                          {
                            userAdminData?.data?.length !== 0 && userAdminData?.data?.slice(0)
                            .reverse().map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td>{item.name}	</td>
                                  <td>{item.email}	</td>
                                  <td>{item.phone}	</td>
                                  <td>
                                    {{
                                      staff: 'Staff',
                                      storeAdmin: 'Store Admin',
                                      mainAdmin: 'Main Admin'
                                    }[item.role] || item.role}
                                  </td>
                                  <td>{item.locationManageName}	</td>
                                  <td>{item.status}	</td>
                                  <td>
                                    <div className="actions d-flex align-items-center">
                                      <Link to={`/userAdmin/edit/${item._id}`}><Button className="success" color="success"><FaPencilAlt /></Button>
                                      </Link>

                                      <Button className="error" color="error" onClick={() => deleteUserAdmin(item._id)}
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
                    {userAdminData?.totalUsers >=1  && (
                      <div className="d-flex tableFooter">
                        <Pagination
                          count={userAdminData?.totalPages}
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
        </>
    )
}

export default UserAdmin;