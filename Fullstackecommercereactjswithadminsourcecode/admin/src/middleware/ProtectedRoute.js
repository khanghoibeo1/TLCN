// src/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { MyContext } from "../App";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLogin, user } = useContext(MyContext);

  // 1. Nếu chưa login thì chuyển về trang /login
  if (!isLogin || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu login nhưng role không nằm trong allowedRoles thì chuyển về /unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; 
    // hoặc bạn có thể tạo một page Unauthorized và 
    // return <Navigate to="/unauthorized" replace />;
  }

  // 3. Nếu đủ điều kiện, trả về children để render trang đích
  return children;
}

export default ProtectedRoute;
