import { useContext } from "react";
import { MyContext } from "../../App";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isLogin, user } = useContext(MyContext);

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Không có quyền, hiển thị thông báo hoặc null (tùy ý)
    return ;
  }

  return children;
};

export default ProtectedRoute;
