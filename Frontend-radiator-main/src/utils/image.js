// Resolves a stored radiator image_url into a URL the browser can load.
//
// Background: the API used to persist absolute URLs built from Request.Scheme/Host,
// which broke behind the DigitalOcean reverse proxy (mixed-content / wrong host).
// New uploads are stored as relative paths like "/uploads/radiators/abc.jpg".
// This helper prepends the API origin for relative paths and passes absolute
// URLs (and data: URLs) through unchanged so legacy rows still render.

import { API_ORIGIN } from "../config/api";

export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (/^(https?:)?\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("data:")) return imageUrl;
  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${API_ORIGIN}${path}`;
};
