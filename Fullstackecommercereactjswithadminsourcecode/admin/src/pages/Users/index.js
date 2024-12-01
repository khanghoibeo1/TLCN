import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { Button, FormControl, Select, MenuItem } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { MdDelete } from "react-icons/md";
import DashboardBox from "../Dashboard/components/dashboardBox";
import SearchBox from "../../components/SearchPostBox";
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
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const context = useContext(MyContext);

  useEffect(() => {
    loadUsers(page, perPage);
  }, [page, perPage]);

  const loadUsers = (currentPage, itemsPerPage) => {
    context.setProgress(40);
    fetchDataFromApi(`/api/user?page=${currentPage}&perPage=${itemsPerPage}`)
      .then((res) => {
        setUsers(res.data);
        setTotalUsers(res.totalUsers);
        context.setProgress(100);
      })
      .catch(() => context.setProgress(100));
  };

  const deleteUser = (id) => {
    deleteData(`/api/user/${id}`).then(() => {
      context.setAlertBox({
        open: true,
        error: false,
        msg: "User Deleted!",
      });
      loadUsers(page, perPage);
    });
  };

  const handleChange = (event, value) => {
    setPage(value);
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
              <DashboardBox color={["#1da256", "#48d483"]} title="Total Users" count={totalUsers} />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <div className="table-responsive mt-3">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 &&
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="actions d-flex align-items-center">
                          <Button className="error" onClick={() => deleteUser(user.id)}>
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {totalUsers > perPage && (
              <div className="d-flex tableFooter">
                <Pagination
                  count={Math.ceil(totalUsers / perPage)}
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
