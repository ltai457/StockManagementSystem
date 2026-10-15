// @ts-nocheck
// Resolves a stored radiator image_url into a URL the browser can load.
// Upload paths are relative to the API origin; existing absolute and data URLs
// pass through unchanged.

import { API_ORIGIN } from "../config/api";

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^(https?:)?\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("data:")) return imageUrl;
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_ORIGIN}${path}`;
};
