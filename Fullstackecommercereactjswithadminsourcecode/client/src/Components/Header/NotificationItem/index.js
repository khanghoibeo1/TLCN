import React, { useState, useContext, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationBox from "../NotificationBox";
import { editData } from "../../../utils/api";
import { MyContext } from "../../../App";

const NotificationItem = ({ notifications }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [localNotifications, setLocalNotifications] = useState([]);
  const context = useContext(MyContext);
  const userContext = context.user;
  const open = Boolean(anchorEl);

  // Đồng bộ khi prop thay đổi
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotiClick = (noti) => {
    setSelectedNoti(noti);

    // cập nhật trạng thái đã đọc ngay trong local state
    setLocalNotifications((prev) =>
      prev.map((n) =>
        n.id === noti.id
          ? {
              ...n,
              recipients: n.recipients.map((r) =>
                r.userId === userContext.userId ? { ...r, isRead: true } : r
              ),
            }
          : n
      )
    );

    // gọi API
    editData(`/api/notifications/${noti.id}/read?userId=${userContext.userId}`)
      .then(() => {
        setAnchorEl(null);
      })
      .catch((e) => console.error(e));
  };

  const handleCloseBox = () => {
    setSelectedNoti(null);
  };

  return (
    <div style={{ marginRight: 20 }}>
      <IconButton color="inherit" onClick={handleClick}>
      <Badge badgeContent={
        notifications.reduce((count, noti) => 
          count + noti.recipients.filter(rec => rec.userId === userContext.userId && !rec.isRead).length
        , 0)
      } 
        color="error"
      >
        <NotificationsNoneIcon sx={{ fontSize: 28, color: "#333" }} />
    </Badge>

      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { maxHeight: 350, width: 320 } }}
      >
        <Typography variant="h6" sx={{ px: 2, pt: 1 }}>
          Notifications
        </Typography>
        <Divider />

        {localNotifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          localNotifications.map((noti) => {
            const isUnread = noti.recipients?.some(
              (r) => r.userId === userContext.userId && !r.isRead
            );

            return (
              <MenuItem
                key={noti.id}
                onClick={() => handleNotiClick(noti)}
                sx={{
                  backgroundColor: isUnread ? "#f9f3e9" : "inherit",
                  "&:hover": {
                    backgroundColor: isUnread ? "#f1e8da" : "#f5f5f5",
                  },
                }}
              >
                <Stack spacing={0.5}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={isUnread ? "bold" : "normal"}
                  >
                    {noti.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(noti.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
              </MenuItem>
            );
          })
        )}
      </Menu>

      {selectedNoti && (
        <NotificationBox
          open={Boolean(selectedNoti)}
          onClose={handleCloseBox}
          title={selectedNoti.title}
          message={selectedNoti.message}
        />
      )}
    </div>
  );
};

export default NotificationItem;
