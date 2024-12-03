import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { Button, FormControl, Select, MenuItem } from '@mui/material'; // Add this import
import Pagination from '@mui/material/Pagination';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { MdCategory } from 'react-icons/md';
import { IoShieldCheckmarkSharp } from 'react-icons/io5';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DashboardBox from '../Dashboard/components/dashboardBox';
import SearchBox from '../../components/SearchBox';
import Rating from '@mui/material/Rating';
import { emphasize, styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Styled Component for breadcrumb
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

const PostList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBy, setShowBy] = useState(10);
  const [categoryVal, setCategoryVal] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalCategory, setTotalCategory] = useState();
  const [totalSubCategory, setTotalSubCategory] = useState();
  const [isLoadingBar, setIsLoadingBar] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const open = Boolean(anchorEl);
  
  const context = useContext(MyContext);

  const history = useNavigate();

  const [postList, setPostList] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(40);
    fetchDataFromApi(`/api/posts?page=1&perPage=${perPage}`).then((res) => {
      setPostList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/posts/get/count").then((res) => {
      setTotalPosts(res.postCount);
    });

    fetchDataFromApi("/api/category/get/count").then((res) => {
      setTotalCategory(res.categoryCount);
    });

    fetchDataFromApi("/api/category/subCat/get/count").then((res) => {
      setTotalSubCategory(res.categoryCount);
    });
  }, []);

  const deletePost = (id) => {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin9643@gmail.com") {
      context.setProgress(40);
      setIsLoadingBar(true);
      deleteData(`/api/posts/${id}`).then((res) => {
        context.setProgress(100);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Post Deleted!",
        });

        fetchDataFromApi(
          `/api/posts?page=${page}&perPage=${perPage}`
        ).then((res) => {
          setPostList(res);
        });
        setIsLoadingBar(false);
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Only Admin can delete Posts",
      });
    }
  };

  const handleChange = (event, value) => {
    context.setProgress(40);
    if (categoryVal !== "all") {
      fetchDataFromApi(`/api/posts/catId?catId=${categoryVal}&page=${value}&perPage=${perPage}`).then(
        (res) => {
          setPostList(res);
          context.setProgress(100);
        }
      );
    } else {
      fetchDataFromApi(`/api/posts?page=${value}&perPage=${perPage}`).then((res) => {
        setPostList(res);
        context.setProgress(100);
      });
    }
  };

  const showPerPage = (e) => {
    setShowBy(e.target.value);
    fetchDataFromApi(`/api/posts?page=1&perPage=${e.target.value}`).then((res) => {
      setPostList(res);
      context.setProgress(100);
    });
  };

  const handleChangeCategory = (event) => {
    if (event.target.value !== "all") {
      setCategoryVal(event.target.value);
      fetchDataFromApi(`/api/posts/catId?catId=${event.target.value}&page=1&perPage=${perPage}`).then(
        (res) => {
          setPostList(res);
          context.setProgress(100);
        }
      );
    } else {
      setCategoryVal("all");
      fetchDataFromApi(`/api/posts?page=1&perPage=${perPage}`).then((res) => {
        setPostList(res);
        context.setProgress(100);
      });
    }
  };

  const onSearch = (keyword) => {
    if (keyword !== "") {
      fetchDataFromApi(`/api/search/post?q=${keyword}&page=1&perPage=${10000}`).then((res) => {
        setPostList(res);
      });
    } else {
      fetchDataFromApi(`/api/posts?page=1&perPage=${10}`).then((res) => {
        setPostList(res);
        console.log(postList);
      });
    }
  };
  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Post List</h5>

          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
              <StyledBreadcrumb component="a" href="#" label="Dashboard" icon={<HomeIcon fontSize="small" />} />
              <StyledBreadcrumb label="Posts" deleteIcon={<ExpandMoreIcon />} />
            </Breadcrumbs>

            <Link to="/blog/add">
              <Button className="btn-blue ml-3 pl-3 pr-3">Add Post</Button>
            </Link>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow pt-0">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox color={["#1da256", "#48d483"]} title="Total Posts" 
                onClick={() => history('/blogs')} count={totalPosts} />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <h3 className="hd">Recent Posts</h3>
          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>SHOW BY</h4>
              <FormControl size="small" className="w-100">
                <Select value={showBy} onChange={showPerPage} displayEmpty className="w-100">
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>CATEGORY BY</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={categoryVal}
                  onChange={handleChangeCategory}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
                >
                  <MenuItem value="all" >
                    <em>All</em>
                  </MenuItem>
                  {context.catData?.categoryList?.length !== 0 &&
                    context.catData?.categoryList?.map((cat, index) => {
                      return (
                        <MenuItem
                          className="text-capitalize"
                          value={cat._id}
                          key={index}
                        >
                          {cat.name}
                        </MenuItem>
                      );
                    })}
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
                  <th style={{ width: "300px" }}>POST</th>
                  <th>CATEGORY</th>
                  <th>AUTHOR</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {postList?.data?.length !== 0 &&
                postList?.data?.map((post, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="info pl-3">
                          <h6>{post?.title}</h6>
                          <p>{post?.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td>{post?.category}</td>
                    <td>{post?.author}</td>
                    <td>
                      <div className="actions d-flex align-items-center">
                        <Link to={`/blog/details/${post?.id}`}>
                          <Button className="secondary">
                            <FaEye />
                          </Button>
                        </Link>

                        <Link to={`/blog/edit/${post.id}`}>
                          <Button className="success">
                            <FaPencilAlt />
                          </Button>
                        </Link>

                        <Button className="error" onClick={() => deletePost(post.id)}>
                          <MdDelete />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {postList?.totalPages > 1 && (
              <div className="d-flex tableFooter">
                <Pagination
                  count={postList.totalPages}
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

export default PostList;