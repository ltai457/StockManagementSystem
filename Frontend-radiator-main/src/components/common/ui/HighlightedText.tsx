// @ts-nocheck
import React from "react";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HighlightedText = ({ text, query, className }) => {
  const content = text ?? "";
  const searchTerm = query?.trim();

  if (!searchTerm) {
    return <span className={className}>{content}</span>;
  }

  const parts = String(content).split(new RegExp(`(${escapeRegExp(searchTerm)})`, "ig"));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark
            key={`${part}-${index}`}
            style={{
              backgroundColor: "#FEF08A",
              color: "inherit",
              padding: "0 2px",
              borderRadius: "2px",
            }}
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

export default HighlightedText;
