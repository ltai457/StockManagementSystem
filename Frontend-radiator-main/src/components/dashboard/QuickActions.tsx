// @ts-nocheck
import { Stack } from "@mui/material";
import { Package, Search, Warehouse } from "lucide-react";
import { AppCard, Button } from "../common/ui";

export default function QuickActions({ onNavigate }) {
  const actions = [
    { label: "Manage Stock", icon: Package, tab: "stock" },
    { label: "Search Inventory", icon: Search, tab: "inventory" },
    { label: "Manage Warehouses", icon: Warehouse, tab: "warehouses" },
  ];

  return (
    <AppCard title="Quick Actions">
      <Stack spacing={1}>
        {actions.map((action) => (
          <Button key={action.tab} variant="ghost" onClick={() => onNavigate(action.tab)} icon={action.icon} sx={{ justifyContent: "flex-start" }}>
            {action.label}
          </Button>
        ))}
      </Stack>
    </AppCard>
  );
}
