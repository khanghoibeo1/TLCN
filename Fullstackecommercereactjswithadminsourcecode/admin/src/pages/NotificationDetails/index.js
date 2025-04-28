import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import { Breadcrumbs, Chip } from '@mui/material';
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

const NotificationDetails = () => {
    const { id } = useParams();
    const [notificationData, setNotificationData] = useState(null);
    const [recipientsList, setRecipientsList] = useState([]);
    const [filteredRecipients, setFilteredRecipients] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);

        fetchDataFromApi(`/api/notifications/${id}`).then((res) => {
            setNotificationData(res);
            setRecipientsList(res.recipients || []);
            setFilteredRecipients(res.recipients || []);
        });
    }, [id]);

    const onSearch = (keyword) => {
        if (keyword !== "") {
            const filtered = recipientsList.filter(user =>
                user.userName?.toLowerCase().includes(keyword.toLowerCase()) ||
                user.userId?.toLowerCase().includes(keyword.toLowerCase())
            );
            setFilteredRecipients(filtered);
        } else {
            setFilteredRecipients(recipientsList);
        }
    };

    if (!notificationData) return <p>Loading...</p>;

    return (
        <div className="notificationDetails right-content w-100">
            <div className="card shadow border-0 w-100 p-4 flex-row">
                <h5 className="mb-0">Notification Details</h5>
                <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                    <StyledBreadcrumb
                        component="a"
                        href="/"
                        label="Home"
                        icon={<HomeIcon fontSize="small" />}
                    />
                    <StyledBreadcrumb
                        label="Notifications"
                        component="a"
                        href="/notifications"
                    />
                    <StyledBreadcrumb
                        label={`Notification: ${notificationData.title}`}
                    />
                </Breadcrumbs>
            </div>

            {/* Notification Info */}
            <div className="card shadow border-0 w-100 p-4 mt-4">
                <p><strong>Title:</strong> {notificationData.title}</p>
                <p><strong>Message:</strong> {notificationData.message}</p>
                <p><strong>Type:</strong> {notificationData.type}</p>
                <p><strong>Created At:</strong> {new Date(notificationData.createdAt).toLocaleString()}</p>
            </div>

            {/* Search */}
            <div className="col-md-6 d-flex justify-content-end">
                <div className="searchWrap d-flex">
                    <SearchBox onSearch={onSearch} />
                </div>
            </div>

            {/* Recipient List */}
            {filteredRecipients.length > 0 && (
                <div className="table-responsive mt-3">
                    <table className="table table-bordered table-striped v-align">
                        <thead className="thead-dark">
                            <tr>
                                <th>User ID</th>
                                <th>Username</th>
                                <th>Read Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecipients.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.userId}</td>
                                    <td>{user.name || 'Unknown'}</td>
                                    <td>{user.isRead ? 'Read' : 'Unread'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NotificationDetails;
