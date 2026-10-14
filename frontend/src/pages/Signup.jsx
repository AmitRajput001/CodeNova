import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch,useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../authSlice"; 
import { useEffect } from "react";

// Signup validation schema
const signupSchema = z
    .object({
        firstName: z
            .string()
            .min(3, "Name should contain at least 3 characters"),

        emailId: z
            .email("Invalid Email"),

        password: z
            .string()
            .min(8, "Password should contain at least 8 characters"),

        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

function Signup() {
    const dispatch  = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {isAuthenticated} = useSelector((state)=>state.auth);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const password = watch("password", "");

    useEffect(()=>{
        if(isAuthenticated){
            navigate('/');
        }
    },[isAuthenticated,navigate]);

    const submittedData = async (data) => {
        try{
            await dispatch(registerUser(data));
        }
        catch(err){
            console.log(err);
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

                {/* First Name */}
                <div className="form-control w-80">
                    <label className="label">
                        <span className="label-text text-gray-300">
                            Name
                        </span>
                    </label>

                    <input
                        {...register("firstName")}
                        placeholder="Enter your name"
                        autoComplete="name"
                        className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none pr-16 ${
                            errors.firstName ? "input-error" : ""
                        }`}
                    />

                    {errors.firstName && (
                        <span className="text-error text-sm mt-1">
                            {errors.firstName.message}
                        </span>
                    )}
                </div>

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
                        placeholder="Enter email"
                        autoComplete="email"
                        className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none pr-16 ${
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
                            autoComplete="new-password"
                            className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none pr-16 ${
                                errors.password ? "input-error" : ""
                            }`}
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm">                        
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {/* Password strength */}
                    {password && (
                        <progress
                            className="progress progress-primary w-full mt-2"
                            value={Math.min(password.length * 10, 100)}
                            max="100"
                        />
                    )}

                    {errors.password && (
                        <span className="text-error text-sm mt-1">
                            {errors.password.message}
                        </span>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="form-control w-80">
                    <label className="label">
                        <span className="label-text text-gray-300">
                            Confirm Password
                        </span>
                    </label>

                    <input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className={`input w-full bg-[#0d1117] text-white placeholder:text-gray-500 border-gray-700 focus:border-blue-500 focus:outline-none pr-16 ${
                            errors.confirmPassword
                                ? "input-error"
                                : ""
                        }`}
                    />

                    {errors.confirmPassword && (
                        <span className="text-error text-sm mt-1">
                            {errors.confirmPassword.message}
                        </span>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary rounded-1xl w-80 mt-3"
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Creating...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>

                {/* Login Section */}
                <div className="text-sm mt-2">
                    Already have an account?{" "}

                    <button
                        type="button"
                        className="link link-primary"
                        onClick={()=> navigate("/login")}
                    >
                        Login
                    </button>
                </div>

            </form>

        </div>
    );
}

export default Signup;