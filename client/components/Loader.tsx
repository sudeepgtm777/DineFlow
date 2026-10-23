// @ts-nocheck
import React from "react";
import { LoaderCircle } from "lucide-react";

const Loader = ({ size = 40, className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderCircle className="animate-spin text-blue-500" size={size} />
    </div>
  );
};

export default Loader;
