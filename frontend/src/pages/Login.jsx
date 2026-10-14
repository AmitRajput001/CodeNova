import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser } from "../authSlice";
import { useDispatch,useSelector } from "react-redux";
import { useNavigate } from "react-router";

// Login validation schema
const loginSchema = z.object({
    emailId: z.email("Invalid Email"),

    password: z
        .string()
        .min(8, "Password should contain at least 8 characters"),
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isAuthenticated, user } = useSelector(
        (state) => state.auth
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    useEffect(()=>{
        if(isAuthenticated){
            navigate(user?.role === "admin" ? "/admin" : "/", { replace: true });
        }
    },[isAuthenticated,user?.role,navigate]);

    const submittedData = async (data) => {
        setLoginError("");
        try{
            await dispatch(loginUser(data)).unwrap();
        }
        catch(err){
            setLoginError(
                typeof err === "string"
                    ? err
                    : "Incorrect email or password."
            );
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#0d1117] px-4">

            <form
                onSubmit={handleSubmit(submittedData)}
                className="card bg-[#161b22] border border-gray-700 shadow-2xl p-8 w-96 flex flex-col items-center gap-3"
            >

                {/* CodeNova Heading */}
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-blue-400 text-2xl font-mono">
                        &lt;/&gt;
                    </span>

                    <h1 className="text-3xl font-bold text-white">
                        CodeNova
                    </h1>
                </div>

                <p className="text-gray-400 text-sm mb-2">
                    Login to your developer account
                </p>

                {loginError && (
                    <div
                        role="alert"
                        className="alert alert-error w-80 text-sm"
                    >
                        <span>{loginError}</span>
                    </div>
                )}


                {/* Email */}
                <div className="form-control w-80">

                    <label className="label">
                        <span className="label-text text-gray-300">
                            Email
                        </span>
                    </label>

                    <input
                        {...register("emailId")}
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none ${
                            errors.emailId ? "input-error" : ""
                        }`}
                    />

                    {errors.emailId && (
                        <span className="text-error text-sm mt-1">
                            {errors.emailId.message}
                        </span>
                    )}

                </div>


                {/* Password */}
                <div className="form-control w-80">

                    <label className="label">
                        <span className="label-text text-gray-300">
                            Password
                        </span>
                    </label>

                    <div className="relative">

                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none pr-16 ${
                                errors.password ? "input-error" : ""
                            }`}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm text-gray-400"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>

                    </div>

                    {errors.password && (
                        <span className="text-error text-sm mt-1">
                            {errors.password.message}
                        </span>
                    )}

                </div>


                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-80 mt-3"
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Logging in...
                        </>
                    ) : (
                        "Log In"
                    )}
                </button>


                {/* Signup */}
                <div className="text-sm text-gray-400 mt-3">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        className="link link-primary" 
                        onClick={()=> navigate("/signup")}
                    >
                        Sign Up
                    </button>
                </div>

            </form>

        </div>
    );
}

export default Login;
