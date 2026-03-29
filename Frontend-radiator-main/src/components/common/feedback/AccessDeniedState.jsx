import React from "react";
import { Shield } from "lucide-react";

const AccessDeniedState = ({
  title = "Access Denied",
  message = "You don't have permission to access this section.",
}) => (
  <div className="text-center py-12">
    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{message}</p>
  </div>
);

export default AccessDeniedState;
