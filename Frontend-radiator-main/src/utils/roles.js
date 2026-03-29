export const normalizeRole = (role) => String(role ?? "").toLowerCase();

export const isAdminRole = (role) => {
  if (Array.isArray(role)) {
    return role.some(isAdminRole);
  }

  const normalized = normalizeRole(role);
  return normalized === "admin" || normalized === "1";
};

export const isStaffRole = (role) => {
  if (Array.isArray(role)) {
    return role.some(isStaffRole);
  }

  const normalized = normalizeRole(role);
  return normalized === "staff" || normalized === "2";
};

export const isAdminUser = (user) => isAdminRole(user?.role);
