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
	const [error, setError] = useState(null)
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
		setError(null)
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
        
        // alert(`Verification code submitted: ${verificationCode}`)
    } 

    useEffect(() => {
        if (code.every((digit) => digit !== "") && code.length === 6) {
			console.log("Code is ready for submission:", code.join(""));
		}
    }, [code])

    return(
        <div className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'>
			<motion.div
				initial={{ opacity: 0, y: -50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md'
			>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Verify Your Email
				</h2>
				<p className='text-center text-gray-300 mb-6'>Enter the 6-digit code sent to your email address.</p>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='flex justify-between'>
						{code.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type='text'
								maxLength='6'
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className='w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none'
							/>
						))}
					</div>
					{error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type='submit'
						disabled={isLoading || code.some((digit) => !digit)}
						className={`w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg ${
							isLoading || code.some((digit) => !digit) ? "opacity-50 cursor-not-allowed" : "hover:from-green-600 hover:to-emerald-700"
						}`}

					>
						{isLoading ? "Verifying..." : "Verify Email"}
					</motion.button>
				</form>
			</motion.div>
		</div>
    )
}

export default EmailVerification;