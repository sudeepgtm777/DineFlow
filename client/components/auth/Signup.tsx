"use client";

import React, { useEffect } from "react";
import { Link, useNavigate } from "@/lib/router";
import { useAppSelector } from "@/lib/redux/hooks";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import useSignup from "@/hooks/auth/useSignup";
import Logo from "@/components/brand/Logo";

const fieldLabels: Record<string, string> = {
  fullname: "Full name",
  email: "Email",
  phoneNumber: "Phone number",
  password: "Password",
};

const Signup = () => {
  const { loading, submitHandler } = useSignup();
  const { user, hydrated } = useAppSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated || !user) return;
    if (user.role === "admin") navigate("/admin/dashboard");
    else if (user.role === "cook") navigate("/cook");
    else if (user.role === "pending") navigate("/pending");
  }, [user, hydrated, navigate]);

  const formik = useFormik({
    initialValues: {
      fullname: "",
      email: "",
      phoneNumber: "",
      password: "",
      image: null,
    },
    validationSchema: Yup.object({
      fullname: Yup.string()
        .min(3, "Too short")
        .max(50, "Too long")
        .required("Full name is required"),
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      phoneNumber: Yup.string()
        .matches(/^9\d{9}$/, "Phone number must be 10 digits and start with 9")
        .required("Phone number is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      image: Yup.mixed().nullable(),
    }),
    onSubmit: submitHandler,
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-center mb-4">
          <Logo href="/" size="lg" />
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-700 mb-2">
          Request cook access
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          An admin must approve your request before you can use the kitchen
          board.
        </p>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {["fullname", "email", "phoneNumber", "password"].map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700"
              >
                {fieldLabels[field]}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                id={field}
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {formik.touched[field] && formik.errors[field] && (
                <p className="mt-1 text-red-500 text-sm">
                  {String(formik.errors[field])}
                </p>
              )}
            </div>
          ))}

          <div>
            <label
              htmlFor="profile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Profile photo
            </label>
            <input
              accept="image/*"
              type="file"
              id="profile"
              name="image"
              onChange={(event) =>
                formik.setFieldValue("image", event.currentTarget.files?.[0])
              }
              className="w-full text-sm text-gray-600"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            disabled={formik.isSubmitting || loading}
          >
            {formik.isSubmitting || loading ? (
              <span className="inline-flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting
              </span>
            ) : (
              "Request to be Cook"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
