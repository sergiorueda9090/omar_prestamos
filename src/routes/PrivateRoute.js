// components/PrivateRoute.js
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isLogin } = useSelector((state) => state.authStore);
  return isLogin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;