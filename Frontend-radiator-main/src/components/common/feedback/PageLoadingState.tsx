// @ts-nocheck
import React from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const PageLoadingState = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export default PageLoadingState;
