import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { Breadcrumbs, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { emphasize, styled } from '@mui/material/styles';
import SearchBox from '../../components/SearchBox';

// Styled Breadcrumb
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

const PromotionCodeDetail = () => {
    const { id } = useParams();
    const [promotionData, setPromotionData] = useState(null); // Store promotion code data
    const [usersList, setUsersList] = useState([]); // Store users list
    const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered users based on search

    useEffect(() => {
        window.scrollTo(0, 0);

        // Fetch promotion code details including users
        fetchDataFromApi(`/api/promotionCode/${id}`).then((res) => {
            setPromotionData(res.data); // Assuming the response contains the promotion code data
            setUsersList(res.data.users); // Store users in the list
            setFilteredUsers(res.data.users); // Initially show all users
        });
    }, []);
    const onSearch = (keyword) => {
        if (keyword !== "") {
            // Filter users based on the search keyword (case insensitive)
            const filtered = usersList.filter(user => 
                user.username.toLowerCase().includes(keyword.toLowerCase()) ||
                user.userId.toString().includes(keyword) // You can search by userId as well
            );
            setFilteredUsers(filtered); // Set filtered users
        } else {
            // If search keyword is empty, show all users
            setFilteredUsers(usersList);
        }
    };

    if (!promotionData) {
        return <p>Loading...</p>;
    }
    return (
        <div className="promotionCodeDetails right-content w-100">
            <div className="card shadow border-0 w-100 p-4 flex-row ">
                <h5 className="mb-0">Promotion Code Details</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="/"
                        label="Home"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Promotion Codes"
                        component="a"
                        href="/promotion-codes"
                    />
                    <StyledBreadcrumb
                        label={`Promo Code: ${promotionData.code}`}
                    />
                </Breadcrumbs>
            </div>

            {/* Promotion Code Details Section */}
            <div className="card shadow border-0 w-100 p-4 mt-4">
                <p><strong>Code:</strong> {promotionData.code}</p>
                <p><strong>Description:</strong> {promotionData.description || "No description available"}</p>
                <p><strong>Discount Percentage:</strong> {promotionData.discountPercent}%</p>
                <p><strong>Max Usage:</strong> {promotionData.maxUsage}</p>
                <p><strong>Used Count:</strong> {promotionData.usedCount}</p>
                <p><strong>Status:</strong> {promotionData.status}</p>
            </div>

            {/* Users Linked to the Promotion Code */}
            <div className="col-md-6 d-flex justify-content-end">
            <div className="searchWrap d-flex">
                <SearchBox onSearch={onSearch} />
            </div>
            </div>
            {promotionData?.users?.length > 0 && (
            <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped v-align">
                    <thead className="thead-dark">
                        <tr>
                            <th>User ID</th>
                            <th>Username</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user, index) => (
                            <tr key={index}>
                                <td>{user.userId}</td>
                                <td>{user.username}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}

        </div>
    );
};

export default PromotionCodeDetail;