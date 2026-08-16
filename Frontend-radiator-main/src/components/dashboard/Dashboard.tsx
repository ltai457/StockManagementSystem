// @ts-nocheck
import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Box as BoxIcon,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  TrendingUp,
  UserCog,
  Warehouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { isAdminUser } from "../../utils/roles";
import RadiatorList from "../inventory/RadiatorList";
import ActivityPage from "../stock/ActivityPage";
import StockManagement from "../stock/StockManagementPage";
import UserManagement from "../users/UserManagement";
import WarehouseManagement from "../warehouse/WarehouseManagement";
import DashboardOverview from "./DashboardOverview";

const TESTING_MODE = false;
const SIDEBAR_WIDTH = 256;

const navConfig = [
  { id: "overview", label: "Overview", shortLabel: "Home", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", shortLabel: "Inventory", icon: Package },
  { id: "stock", label: "Stock Management", shortLabel: "Stock", icon: BoxIcon },
  { id: "activity", label: "Activity Log", shortLabel: "Activity", icon: ClipboardList },
  { id: "warehouses", label: "Warehouses", shortLabel: "Warehouse", icon: Warehouse },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const isAdmin = isAdminUser(user);
  const navItems = [
    ...navConfig,
    ...(isAdmin ? [{ id: "users", label: "User Management", shortLabel: "Users", icon: UserCog }] : []),
  ];

  const handleLogout = () => {
    if (TESTING_MODE && !window.confirm("In testing mode. Go to the login page?")) return;
    if (!TESTING_MODE) logout();
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inventory": return <RadiatorList onNavigate={setActiveTab} />;
      case "warehouses": return <WarehouseManagement />;
      case "stock": return <StockManagement />;
      case "activity": return <ActivityPage />;
      case "users": return <UserManagement />;
      default: return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  const initials = user?.username
    ? user.username.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2)
    : "U";
  const activeLabel = navItems.find((item) => item.id === activeTab)?.label || "Overview";

  return (
    <Box bgcolor="background.default" display="flex" height="100vh" overflow="hidden">
      <Paper
        component="aside"
        elevation={0}
        square
        sx={{ borderRight: 1, borderColor: "divider", display: { xs: "none", lg: "flex" }, flexDirection: "column", width: SIDEBAR_WIDTH }}
      >
        <Stack alignItems="center" direction="row" height={64} px={2} spacing={1.25}>
          <Avatar variant="rounded" sx={{ bgcolor: "primary.main", height: 36, width: 36 }}><TrendingUp size={20} /></Avatar>
          <Typography fontWeight={800}>Chan Mary 333</Typography>
        </Stack>
        <Divider />

        <Stack component="nav" flex={1} spacing={0.5} sx={{ overflowY: "auto", p: 1.5 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <ButtonBase
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{ bgcolor: active ? "action.selected" : "transparent", borderLeft: 4, borderColor: active ? "primary.main" : "transparent", borderRadius: 2, color: active ? "primary.main" : "text.secondary", justifyContent: "flex-start", minHeight: 46, px: 1.5, py: 1, textAlign: "left", "&:hover": { bgcolor: "action.hover", color: "primary.main" } }}
              >
                <Icon size={20} />
                <Typography flex={1} fontWeight={active ? 700 : 500} ml={1.5} variant="body2">{item.label}</Typography>
              </ButtonBase>
            );
          })}
        </Stack>

        <Divider />
        <Box p={1.5}>
          <Stack alignItems="center" direction="row" p={1} spacing={1.25}>
            <Avatar>{initials}</Avatar>
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={600} noWrap variant="body2">{user?.username || "User"}</Typography>
              <Typography color="text.secondary" variant="caption">{isAdmin ? "Admin" : (user?.role || "User")}</Typography>
            </Box>
          </Stack>
          <Button color="error" fullWidth onClick={handleLogout} startIcon={<LogOut size={18} />}>Logout</Button>
        </Box>
      </Paper>

      <Box component="main" flex={1} minWidth={0} overflow="auto" pb={{ xs: 8, lg: 0 }}>
        <Paper component="header" elevation={0} square sx={{ alignItems: "center", borderBottom: 1, borderColor: "divider", display: "flex", minHeight: 64, px: { xs: 2, md: 3 }, py: 1.25 }}>
          <Box flex={1} minWidth={0}>
            <Typography noWrap variant="h2">{activeLabel}</Typography>
            <Typography color="text.secondary" display={{ xs: "none", sm: "block" }} variant="body2">Manage your radiator inventory and stock</Typography>
          </Box>
          <Chip color="success" label="System Online" size="small" />
          <Button color="error" onClick={handleLogout} sx={{ display: { lg: "none" }, minWidth: 44, ml: 1 }}><LogOut size={20} /></Button>
        </Paper>

        <Box p={{ xs: 1.5, sm: 2, md: 3 }}>
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, p: { xs: 1.5, sm: 2, md: 3, lg: 4 } }}>
            {renderContent()}
          </Paper>
        </Box>
      </Box>

      <Paper component="nav" elevation={8} square sx={{ bottom: 0, display: { xs: "flex", lg: "none" }, left: 0, position: "fixed", right: 0, zIndex: 1200 }}>
        {navItems.filter((item) => item.id !== "users").map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <ButtonBase key={item.id} onClick={() => setActiveTab(item.id)} sx={{ color: active ? "primary.main" : "text.disabled", flex: 1, flexDirection: "column", minHeight: 64, py: 0.75 }}>
              <Icon size={active ? 22 : 20} />
              <Typography fontWeight={active ? 700 : 500} mt={0.25} variant="caption">{item.shortLabel}</Typography>
            </ButtonBase>
          );
        })}
      </Paper>

      {TESTING_MODE && <Alert severity="warning" sx={{ bottom: { xs: 76, lg: 16 }, maxWidth: 360, position: "fixed", right: 16, zIndex: 1300 }}>Testing mode is active.</Alert>}
    </Box>
  );
}
