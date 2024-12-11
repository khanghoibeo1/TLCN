import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MyContext } from "../../App";
import { postData } from "../../utils/api";

const EmailVerification = () => {

    const context = useContext(MyContext)
	const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([])
    const history = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
	

	useEffect(() => {
		context.setisHeaderFooterShow(false);
		
		context.setEnableFilterTab(false);
	  }, []);
    
    const handleChange = (index, value) => {
        const newCode = [...code]

        if(value.length > 1){
            const pastedCode = value.slice(0, 6).split("");
            for(let i=0; i<6; i++){
                newCode[i] = pastedCode[i] || ""
            }
            setCode(newCode);

            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "")
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5
            inputRefs.current[focusIndex].focus();
        }else {
            newCode[index] = value;
            setCode(newCode);

            if(value && index < 5){
                inputRefs.current[index + 1].focus()

            }
        }
    }

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

    const handleSubmit = async (e) => {
        e.preventDefault();
		setIsLoading(true)
		
		const verificationCode = code.join("")
		if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
			context.setAlertBox({
				open: true,
				error: true,
				msg: "Please enter a valid 6-digit code.",
			});
			setIsLoading(false);
			return;
		}
		try {
			const response = await postData("/api/user/verify-email", { code: verificationCode });
			if (response.success) {
				context.setAlertBox({
					open: true,
					error: false,
					msg: "Verification successful!",
				});
				history("/signIn");
			} else {
				context.setAlertBox({
					open: true,
					error: true,
					msg: response.msg || "Verification failed.",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			context.setAlertBox({
				open: true,
				error: true,
				msg: "An unexpected error occurred.",
			});
		} finally {
			setIsLoading(false);
		}
    } 

    useEffect(() => {
        if (code.every((digit) => digit !== "") && code.length === 6) {
			console.log("Code is ready for submission:", code.join(""));
		}
    }, [code])

    return(
        <section className="section signInPage">
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
                    <h2 className="mb-3 text-center">Verify Your Email</h2>
                    <p className="text-center text-muted mb-4">
                        Enter the 6-digit code sent to your email address.
                    </p>

                    <form className="mt-2" onSubmit={handleSubmit}>
                        <div className="form-group text-center">
                            <div className="d-flex justify-content-center gap-2">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="6"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="code-input"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="d-flex align-items-center mt-3 mb-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-blue w-100 btn-lg btn-big"
                            >
                                {isLoading ? "Verifying..." : "Verify Email"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    )
}

export default EmailVerification;