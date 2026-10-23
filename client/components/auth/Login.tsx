"use client";

// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router";
import api from "@/lib/axios";
import { endpoints } from "@/lib/api/endpoints";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "@/lib/redux/authSlice";
import { Loader2 } from "lucide-react";
import Logo from "@/components/brand/Logo";

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });

    const { loading, user } = useSelector((store: any) => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Handle input changes
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));

            const res = await api.post(`${endpoints.user}/login`, input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                localStorage.setItem("user", JSON.stringify(res.data.user));

                // Redirect based on user role
                if (res.data.user.role === "admin") {
                    navigate("/admin/dashboard");
                } else if (res.data.user.role === "cook") {
                    navigate("/cook");
                } else {
                    navigate("/");
                }
                
                alert(res.data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert(error.response?.data?.message || "Something went wrong!");
        } finally {
            dispatch(setLoading(false));
        }
    };

    // Redirect to respective dashboard if already logged in
    useEffect(() => {
        console.log("User state:", user); // Debugging
        if (user) {
            if (user.role === "admin") {
                navigate("/admin");
            } else if (user.role === "cook") {
                navigate("/cook");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                <div className="flex justify-center mb-4">
                    <Logo href="/" size="lg" />
                </div>
                <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h1>
                <form onSubmit={submitHandler} className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="Enter your email"
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="Enter your password"
                            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <div>
                        {loading ? (
                            <button
                                type="button"
                                className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg font-semibold"
                                disabled
                            >
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Please wait
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
                            >
                                Login
                            </button>
                        )}
                    </div>
                </form>

                {/* Signup Link */}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Signup
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
