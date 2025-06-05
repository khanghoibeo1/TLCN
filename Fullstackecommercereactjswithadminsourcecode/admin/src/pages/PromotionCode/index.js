import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { Button } from '@mui/material';
import SearchBox from '../../components/SearchBox';
import { FaPencilAlt, FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DashboardBox from '../Dashboard/components/dashboardBox'; // Import DashboardBox

const PromotionCodeList = () => {
  const [promotionList, setPromotionList] = useState([]);
  const [totalPromotion, setTotalPromotion] = useState(0);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(40);
    fetchDataFromApi(`/api/promotionCode`).then((res) => {
      setPromotionList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/promotionCode/get/count").then((res) => {
      setTotalPromotion(res.promotionCodeCount);
    });
  }, []);

  const deletePromotion = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.role !== "mainAdmin") {
      context.setProgress(40);
      deleteData(`/api/promotionCode/${id}`).then(() => {
        context.setProgress(100);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Promotion Code Deleted!",
        });

        // Fetch updated list
        fetchDataFromApi(`/api/promotionCode`).then((res) => {
          setPromotionList(res);
        });
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Only Admin can delete Promotion Codes",
      });
    }
  };
  const onSearch = (keyword) => {
    if (keyword !== "") {
      fetchDataFromApi(`/api/search/promotionCode?q=${keyword}`).then((res) => {
        setPromotionList(res);
      });
    } else {
      fetchDataFromApi(`/api/promotionCode`).then((res) => {
        setPromotionList(res);
      });
    }
  };
  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Promotion Code List</h5>
          <div className="ml-auto">
            <Link to="/promotionCode/add">
              <Button className="btn-blue ml-3 pl-3 pr-3">Add Promotion Code</Button>
            </Link>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow pt-0">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                title="Total Promotion Codes"
                count={totalPromotion}
                onClick={() => history('/promotionCode')}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
            <h3 className="hd">Promotion Codes</h3>
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
                    <th>CODE</th>
                    <th>DISCOUNT</th>
                    <th>MAX USAGE</th>
                    <th>USED</th>
                    <th>MIN ORDER</th>
                    <th>VALID FROM</th>
                    <th>VALID TO</th>
                    <th>ROLES</th>
                    <th>USERS</th>
                    <th>CAN COMBINE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {promotionList?.data?.length > 0 &&
                    promotionList.data.map((promotion, index) => (
                      <tr key={index}>
                        <td>{promotion?.code}</td>
                        <td>
                          {promotion.discountType === 'percent'
                            ? `${promotion.discountValue}%`
                            : `-$${promotion.discountValue}`}
                        </td>
                        <td>{promotion?.maxUsage}</td>
                        <td>{promotion?.usedCount}</td>
                        <td>${promotion?.minOrderValue}</td>
                        <td>{promotion?.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{promotion?.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td>{promotion?.applicableRoles?.join(', ') || 'All'}</td>
                        <td>{promotion?.applicableUsers?.length || 0}</td>
                        <td>{promotion?.canCombine ? 'Yes' : 'No'}</td>
                        <td>{promotion?.status}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Link to={`/promotionCode/details/${promotion?._id}`}>
                              <Button className="secondary">
                                <FaEye />
                              </Button>
                            </Link>

                            <Link to={`/promotionCode/edit/${promotion._id}`}>
                              <Button className="success">
                                <FaPencilAlt />
                              </Button>
                            </Link>

                            <Button className="error" onClick={() => deletePromotion(promotion._id)}>
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>

                {/* <thead className="thead-dark">
                    <tr>
                    <th>PROMOTION CODE</th>
                    <th>DISCOUNT</th>
                    <th>MAX USAGE</th>
                    <th>USED COUNT</th>
                    <th>DESCRIPTION</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
        {promotionList?.data?.length !== 0 &&
          promotionList?.data?.map((promotion, index) => (
            <tr key={index}>
              <td>{promotion?.code}</td>
              <td>{promotion?.discountPercent}%</td>
              <td>{promotion?.maxUsage}</td>
              <td>{promotion?.usedCount}</td>
              <td>{promotion?.description}</td>
              <td>{promotion?.status}</td>
              <td>
                <div className="actions d-flex align-items-center">
                  <Link to={`/promotionCode/details/${promotion?.id}`}>
                    <Button className="secondary">
                      <FaEye />
                    </Button>
                  </Link>

                  <Link to={`/promotionCode/edit/${promotion.id}`}>
                    <Button className="success">
                      <FaPencilAlt />
                    </Button>
                  </Link>

                  <Button className="error" onClick={() => deletePromotion(promotion.id)}>
                    <MdDelete />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
      </tbody> */}
    </table>
  </div>
</div>

      </div>
    </>
  );
};

export default PromotionCodeList;