// @ts-nocheck
import React from "react";
import { AlertCircle } from "lucide-react";

const PageErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
}) => (
  <div className="space-y-6">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div>
          <h3 className="font-medium text-red-800">{title}</h3>
          {message && <p className="text-sm text-red-700 mt-1">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="px-3 py-1 text-sm border rounded-md"
          >
            {retryLabel}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default PageErrorState;
