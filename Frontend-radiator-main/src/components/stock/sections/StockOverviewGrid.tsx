// @ts-nocheck
import React from "react";
import { Package, Warehouse } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../../../utils/stock";
import { Avatar, Box, Card, Stack, Typography } from "@mui/material";

export default function StockOverviewGrid({
  warehouses,
  radiators,
  selectedWarehouse,
  setSelectedWarehouse,
}) {
  // Always calculate total across ALL warehouses (fixed number)
  const totalAcrossAll = (radiators || []).reduce((t, r) => {
    if (!r.stock) return t;
    return t + Object.values(r.stock).reduce((sum, qty) => sum + (qty || 0), 0);
  }, 0);

  return (
    <>
      <Box sx={{ display: { xs: "block", md: "none" }, mx: -1.5, overflowX: "auto", px: 1.5, pb: 0.5 }}>
          <Stack direction="row" spacing={1.5}>
            <OverviewCard
              compact
              active={selectedWarehouse === "all"}
              onClick={() => setSelectedWarehouse("all")}
              icon={<Package size={20} />}
              color="secondary.main"
              title="All Warehouses"
              subtitle="Combined view"
              stats={[{ label: "Stock", value: totalAcrossAll }]}
            />

            {(warehouses || []).map((w) => {
              const warehouseStock = (radiators || []).reduce(
                (t, r) => t + (r.stock?.[w.code] || 0),
                0
              );
              const lowStockItems = (radiators || []).filter((r) => {
                const s = r.stock?.[w.code] || 0;
                return s > 0 && s <= LOW_STOCK_THRESHOLD;
              }).length;
              const outOfStockItems = (radiators || []).filter(
                (r) => (r.stock?.[w.code] || 0) === 0
              ).length;

              return (
                <OverviewCard
                  compact
                  key={w.id}
                  active={selectedWarehouse === w.code}
                  onClick={() => setSelectedWarehouse(w.code)}
                  icon={<Warehouse size={20} />}
                  color="primary.main"
                  title={w.name}
                  subtitle={w.code}
                  location={w.location}
                  stats={[
                    { label: "Stock", value: warehouseStock },
                    {
                      label: "Low",
                      value: lowStockItems,
                      emphasize: lowStockItems > 0,
                      color: "warning.main",
                    },
                    {
                      label: "Out",
                      value: outOfStockItems,
                      emphasize: outOfStockItems > 0,
                      color: "error.main",
                    },
                  ]}
                />
              );
            })}
          </Stack>
      </Box>

      <Box sx={{ display: { xs: "none", md: "grid" }, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 2 }}>
        <OverviewCard
          active={selectedWarehouse === "all"}
          onClick={() => setSelectedWarehouse("all")}
          icon={<Package size={24} />}
          color="secondary.main"
          title="All Warehouses"
          subtitle="Combined View"
          stats={[{ label: "Total Stock", value: totalAcrossAll }]}
        />

        {(warehouses || []).map((w) => {
          const warehouseStock = (radiators || []).reduce(
            (t, r) => t + (r.stock?.[w.code] || 0),
            0
          );
          const lowStockItems = (radiators || []).filter((r) => {
            const s = r.stock?.[w.code] || 0;
            return s > 0 && s <= LOW_STOCK_THRESHOLD;
          }).length;
          const outOfStockItems = (radiators || []).filter(
            (r) => (r.stock?.[w.code] || 0) === 0
          ).length;

          return (
            <OverviewCard
              key={w.id}
              active={selectedWarehouse === w.code}
              onClick={() => setSelectedWarehouse(w.code)}
              icon={<Warehouse size={24} />}
              color="primary.main"
              title={w.name}
              subtitle={w.code}
              location={w.location}
              stats={[
                { label: "Total Stock", value: warehouseStock },
                {
                  label: "Low Stock",
                  value: lowStockItems,
                  emphasize: lowStockItems > 0,
                  color: "warning.main",
                },
                {
                  label: "Out of Stock",
                  value: outOfStockItems,
                  emphasize: outOfStockItems > 0,
                  color: "error.main",
                },
              ]}
            />
          );
        })}
      </Box>
    </>
  );
}

function OverviewCard({
  active,
  onClick,
  icon,
  color,
  title,
  subtitle,
  location,
  stats,
  compact = false,
}) {
  return (
    <Card
      onClick={onClick}
      variant="outlined"
      sx={{ cursor: "pointer", minWidth: compact ? 220 : 0, p: compact ? 1.5 : 2.5, borderColor: active ? "primary.main" : "divider", bgcolor: active ? "action.selected" : "background.paper", boxShadow: compact ? 1 : 2, transition: "box-shadow .2s", "&:hover": { boxShadow: 4 } }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} mb={compact ? 1 : 1.5}>
        <Avatar variant="rounded" sx={{ width: compact ? 40 : 48, height: compact ? 40 : 48, bgcolor: "action.hover", color }}>
          {icon}
        </Avatar>
        <Box minWidth={0}>
          <Typography variant={compact ? "body2" : "h6"} fontWeight={600} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant={compact ? "caption" : "body2"} color="text.secondary">{subtitle}</Typography>
          )}
        </Box>
      </Stack>

      <Stack spacing={compact ? 0.75 : 1}>
        {stats.map(({ label, value, emphasize, color: statColor }) => (
          <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant={compact ? "caption" : "body2"} color="text.secondary">{label}</Typography>
            <Typography variant={compact ? "caption" : "body2"} fontWeight={600} color={emphasize ? statColor : "text.primary"}>
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {location && (
        <Box mt={compact ? 1 : 1.5} pt={compact ? 1 : 1.5} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary" noWrap display="block">{location}</Typography>
        </Box>
      )}
    </Card>
  );
}
