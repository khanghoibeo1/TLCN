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
    const [promotionData, setPromotionData] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetchDataFromApi(`/api/promotionCode/${id}`).then((res) => {
            setPromotionData(res.data);
            setUsersList(res.data.users || []);
            setFilteredUsers(res.data.users || []);
        });
    }, []);

    const onSearch = (keyword) => {
        if (keyword !== "") {
            const filtered = usersList.filter(user =>
                user.username.toLowerCase().includes(keyword.toLowerCase()) ||
                user.userId?.toString().includes(keyword)
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(usersList);
        }
    };

    if (!promotionData) return <p>Loading...</p>;

    return (
        <div className="promotionCodeDetails right-content w-100">
            <div className="card shadow border-0 w-100 p-4 flex-row">
                <h5 className="mb-0">Promotion Code Details</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb component="a" href="/" label="Home" icon={<HomeIcon fontSize="small" />} />
                    <StyledBreadcrumb label="Promotion Codes" component="a" href="/promotion-codes" />
                    <StyledBreadcrumb label={`Promo Code: ${promotionData.code}`} />
                </Breadcrumbs>
            </div>

            <div className="card shadow border-0 w-100 p-4 mt-4">
                <p><strong>Code:</strong> {promotionData.code}</p>
                <p><strong>Description:</strong> {promotionData.description || "No description available"}</p>
                <p><strong>Discount:</strong> {promotionData.discountValue} {promotionData.discountType === 'percent' ? '%' : 'currency'}</p>
                <p><strong>Min Order Value:</strong> {promotionData.minOrderValue}</p>
                <p><strong>Start Date:</strong> {new Date(promotionData.startDate).toLocaleString()}</p>
                <p><strong>End Date:</strong> {new Date(promotionData.endDate).toLocaleString()}</p>
                <p><strong>Max Usage:</strong> {promotionData.maxUsage}</p>
                <p><strong>Used Count:</strong> {promotionData.usedCount}</p>
                <p><strong>Status:</strong> {promotionData.status}</p>
                <p><strong>Can Combine:</strong> {promotionData.canCombine ? 'Yes' : 'No'}</p>
                <p><strong>Note:</strong> {promotionData.note}</p>

                <p><strong>Applicable Roles:</strong> {promotionData.applicableRoles.join(", ") || 'All'}</p>

                <p><strong>Applicable Products:</strong></p>
                <ul>
                {promotionData.applicableProductIds?.length > 0 ? (
                    promotionData.applicableProductIds.map(product => (
                    <li key={product.id}>{product.name} (ID: {product.id})</li>
                    ))
                ) : (
                    <li>All products</li>
                )}
                </ul>


                <p><strong>Applicable Categories:</strong></p>
                <ul>
                {promotionData.applicableCategoryIds?.length > 0 ? (
                    promotionData.applicableCategoryIds.map(category => (
                    <li key={category.id}>{category.name} (ID: {category.id})</li>
                    ))
                ) : (
                    <li>All categories</li>
                )}
                </ul>

            </div>

            <div className="col-md-6 d-flex justify-content-end">
                <div className="searchWrap d-flex">
                    <SearchBox onSearch={onSearch} />
                </div>
            </div>

            {filteredUsers.length > 0 && (
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
