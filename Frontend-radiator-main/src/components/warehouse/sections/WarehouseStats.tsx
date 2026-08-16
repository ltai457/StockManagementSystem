// @ts-nocheck
import React from "react";
import { Warehouse } from "lucide-react";
import { Avatar, Box, Card, Stack, Typography } from "@mui/material";

export default function WarehouseStats({ stats }) {
  const cards = [
    {
      label: "Total Warehouses",
      value: stats.total,
      Icon: Warehouse,
      color: "primary.main",
    },
    
   
  ];

  return (
    <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={2}>
      {cards.map((card) => (
        <Card key={card.label} variant="outlined" sx={{ p: 3, bgcolor: "action.hover" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography variant="body2" color="text.secondary">{card.label}</Typography><Typography variant="h4" mt={0.5}>{card.value}</Typography></Box><Avatar variant="rounded" sx={{ bgcolor: "background.paper", color: card.color }}><card.Icon size={24} /></Avatar></Stack>
        </Card>
      ))}
    </Box>
  );
}
