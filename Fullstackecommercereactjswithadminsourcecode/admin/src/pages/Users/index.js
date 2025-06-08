import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { Button, FormControl, Select, MenuItem } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { MdDelete } from "react-icons/md";
import DashboardBox from "../Dashboard/components/dashboardBox";
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import SearchBox from "../../components/SearchBox";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const Users = () => {
  const [userLists, setUserLists] = useState([]);
  const [showBy, setShowBy] = useState(10); 
  const [rankFind, setRankFind] = useState('');
  const [querySearch, setQuerySearch] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    context.setProgress(40);
    fetchDataFromApi(`/api/user?q=${querySearch}&rank=${rankFind}&page=1&perPage=10`)
      .then((res) => {
        setUserLists(res);
        setTotalUsers(res.totalUsers);
        context.setProgress(100);
      })
      .catch(() => context.setProgress(100));
  }, []);

  const deleteUser = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.role === "mainAdmin") {
      deleteData(`/api/user/${id}`).then(() => {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "User Deleted!",
        });
        fetchDataFromApi(`/api/user?q=${querySearch}&rank=${rankFind}&page=1&perPage=10`)
        .then((res) => {
          setUserLists(res);
          context.setProgress(100);
        })
        .catch(() => context.setProgress(100));
      });
    } else {
        context.setAlertBox({
            open: true,
            error: true,
            msg: "Only Admin can delete ",
        });
    }
  };

  const handleChange = (event, value) => {
    context.setProgress(40);
    fetchDataFromApi(`/api/user?q=${querySearch}&rank=${rankFind}&page=${value}&perPage=10`).then((res) => {
        setUserLists(res);
        context.setProgress(100);
    }); 
  };

  const showByRank = (e) => {
    setRankFind(e.target.value);
    fetchDataFromApi(`/api/user?q=${querySearch}&rank=${e.target.value}&page=1&perPage=10`).then((res) => {
      setUserLists(res);
      context.setProgress(100);
    });
  };

  const onSearch = (keyword) => {
    setQuerySearch(keyword)
    fetchDataFromApi(`/api/user?q=${keyword}&rank=${rankFind}&page=1&perPage=10`).then((res) => {
      setUserLists(res);
    });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">User List</h5>
          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyledBreadcrumb label="Users" deleteIcon={<ExpandMoreIcon />} />
            </Breadcrumbs>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow pt-0">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox color={["#1da256", "#48d483"]} title="Total Users" 
                onClick={() => history('/users')} count={totalUsers} />
            </div>
          </div>
        </div>

        

        <div className="card shadow border-0 p-3 mt-4">
          <h3 className="hd">Recent Users</h3>
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
                <h4>SHOW BY RANK</h4>
                <FormControl size="small" className="w-100">
                  <Select value={rankFind} onChange={showByRank} displayEmpty className="w-100">
                    <MenuItem value=''>All</MenuItem>
                    <MenuItem value='bronze'>Bronze</MenuItem>
                    <MenuItem value='silver'>Silver</MenuItem>
                    <MenuItem value='gold'>Gold</MenuItem>
                    <MenuItem value='platinum'>Platinum</MenuItem>
                  </Select>
                </FormControl>
              </div>
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
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>PHONE</th>
                  <th>STATUS</th>
                  <th>TOTAL SPENT</th>
                  <th>RANK</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {userLists?.data?.length > 0 &&
                  userLists?.data?.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.status}</td>
                      <td>{user.totalSpent}</td>
                      <td>{user.rank.charAt(0).toUpperCase() + user.rank.slice(1)}</td>
                      <td>
                        <div className="actions d-flex align-items-center">
                        <Link to={`/user/edit/${user.id}`}>
                          <Button className="success">
                            <FaPencilAlt />
                          </Button>
                        </Link>
                          <Button className="error" onClick={() => deleteUser(user.id)}>
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {userLists.totalPages >= 1 && (
              <div className="d-flex tableFooter">
                <Pagination
                  count={userLists?.totalPages}
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
      </div>
    </>
  );
};

export default Users;
