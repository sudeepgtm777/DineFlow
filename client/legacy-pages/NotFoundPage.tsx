// @ts-nocheck
import React from "react";
import { useNavigate } from "@/lib/router";
import Logo from "@/components/brand/Logo";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Function to handle going back to the previous page
  const goBack = () => {
    navigate(-1); // This takes the user to the previous page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo href="/" size="lg" />
        </div>
        <h4 className="text-3xl font-bold text-gray-800 mb-4">
          404: Page Not Found
        </h4>
        <p className="text-gray-600 mb-6">
          Sorry, the page you are looking for does not exist.
        </p>
        <div className="flex space-x-4">
          {/* Button to go back to previous page */}
          <button
            onClick={goBack}
            className="inline-flex items-center px-4 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md transition"
          >
            <i className="fa fa-arrow-left mr-2"></i> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
