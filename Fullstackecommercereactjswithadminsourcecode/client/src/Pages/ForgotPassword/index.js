import { useContext, useEffect, useState } from "react";
import { MyContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Logo from "../../assets/images/logo2.png";

const ForgotPassword = () => {

    const context = useContext(MyContext);
    const history = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        context.setisHeaderFooterShow(false);
        context.setEnableFilterTab(false);
    }, []);

    const [formfields, setFormfields] = useState({
        email: ""
    })

    const onchangeInput = (e) => {
        setFormfields(() => ({
            ...formfields,
            [e.target.name]: e.target.value,
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        if(formfields.email === ""){
            context.setAlertBox({
                open: true,
                error: true,
                msg: "Email can not be blank or invalid "
            })
            setIsLoading(false);
			return;
        }

        try{
            const response = await postData("/api/user/forgot-password", formfields)
            if(response.success) {
                context.setAlertBox({
                    open: true,
                    error: false,
                    msg: response.msg || "Reset link sent successfully!",
                })
                setIsSubmitted(true);
            } else{
                context.setAlertBox({
                    open: true,
                    error: true,
                    msg: "Email not found!"
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
        <section className="section forgotPasswordPage">
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
                    d="M1921,413.1v406.7H0V0.5h0.4l228.1,598.3c30,74.4,80.8,130.6,152.5,168.6c107.6,57,212.1,40.7,245.7,34.4 c22.4-4.2,54.9-13.1,97.5-26.6L1921,400.5V413.1z"
                ></path>
                </svg>
            </div>

            <div className="container">
                <div className="box card p-3 shadow border-0">
                <div className="text-center">
                    <img src={Logo} alt="Logo" />
                </div>

                {!isSubmitted ? (
                    <form className="mt-2" onSubmit={handleSubmit}>
                        <h2 className="mb-3">Forgot Password</h2>
                        <div className="form-group">
                            <TextField
                            label="Email Address"
                            name="email"
                            onChange={onchangeInput}
                            type="email"
                            variant="standard"
                            className="w-100"
                            required
                            />
                        </div>
                        <div className="d-flex align-items-center mt-3 mb-3">
                            <Button
                            type="submit"
                            disabled={isLoading}
                            className="btn-blue w-100 btn-lg btn-big"
                            >
                            {isLoading ? <CircularProgress size={24} /> : "Send Reset Link"}
                            </Button>
                        </div>
                        <p className="txt text-center">
                            Remembered your password?{" "}
                            <Link to="/signIn" className="border-effect">
                                Sign In
                            </Link>
                        </p>
                    </form>
                ) : (
                    <div className="text-center">
                        <h3 className="mb-3">Check Your Email</h3>
                        <p>A password reset link has been sent to your account {formfields.email}.</p>
                        c
                    </div>
                )}
                </div>
            </div>

        </section>
    )
};

export default ForgotPassword;