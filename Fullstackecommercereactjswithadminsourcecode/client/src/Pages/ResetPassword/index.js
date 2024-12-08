import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { Link, useNavigate, useParams } from "react-router-dom";
import { postData } from "../../utils/api";
import { TextField, Button, CircularProgress } from "@mui/material";
import Logo from "../../assets/images/logo.jpg";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const ResetPassword = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const context = useContext(MyContext);
    const history = useNavigate();
    const { token } = useParams()

    useEffect(() => {
        context.setisHeaderFooterShow(false);
        context.setEnableFilterTab(false);
    }, [])

    const [formfields, setFormfields] = useState({
        password: "",
        confirmPassword: "",
    });

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    const toggleConfirmPasswordVisibility = () =>
        setShowConfirmPassword((prev) => !prev);

    const onchangeInput = (e) => {
        setFormfields(() => ({
            ...formfields,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        setIsLoading(true);

        const {password, confirmPassword} = formfields;
        
        if (password.length < 6) {
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Password must be at least 6 characters!",
            });
            setIsLoading(false);
            return;
          }
        if (password !== confirmPassword){
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Password and confirm password not match",
            });
            setIsLoading(false);
            return;
        }

        try{
            const response = await postData(`/api/user/reset-password/${token}`, { password });
            if(response.success){
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: response.msg || "Reset password successfully!",
                });

                setTimeout(() => {
                    history("/signIn")
                }, 2000)
            } else{
                context.setAlertBox({
                    open: true,
                    error: true,
                    msg: "Error resetting password!"
                })
            }
        } catch(error){
            context.setAlertBox({
                open: true,
                error: true,
                msg: "An unexpected error occurred.",
            });  
        } finally{
            setIsLoading(false);
        }
    }

    return(
        <section className="section signInPage resetPasswordPage">
            <div className="shape-bottom">
                <svg
                fill="#fff"
                id="Layer_1"
                x="0px"
                y="0px"
                viewBox="0 0 1921 819.8"
                style={{ enableBackground: "new 0 0 1921 819.8" }}
                >
                <path
                    className="st0"
                    d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 
                    c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
                ></path>
                </svg>
            </div>

            <div className="container">
                <div className="box card p-3 shadow border-0">
                    <div className="text-center">
                        <img src={Logo} alt="Logo" />
                    </div>

                    <form className="mt-2" onSubmit={handleSubmit}>
                        <h2 className="mb-3">Reset Password</h2>

                        <div className="form-group password-input-container">
                            <TextField
                                id="password"
                                label="New Password"
                                type={showPassword ? "text" : "password"} // Conditional type
                                required
                                variant="standard"
                                className="w-100"
                                name="password"
                                value={formfields.password}
                                onChange={onchangeInput}
                            />
                            <span
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                            </span>
                            </div>

                            <div className="form-group password-input-container">
                            <TextField
                                id="confirmPassword"
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"} // Conditional type
                                required
                                variant="standard"
                                className="w-100"
                                name="confirmPassword"
                                value={formfields.confirmPassword}
                                onChange={onchangeInput}
                            />
                            <span
                                className="password-toggle"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                            </span>
                            </div>

                        <div className="d-flex align-items-center mt-3 mb-3">
                            <Button
                                type="submit"
                                className="btn-blue w-100 btn-lg btn-big"
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={24} /> : "Set New Password"}
                            </Button>
                        </div>

                        <p className="txt text-center">
                            <Link to="/signIn" className="border-effect">
                                Back To Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </section>

    )
};

export default ResetPassword;