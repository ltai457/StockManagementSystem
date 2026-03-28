import React from "react";
import { Edit, Trash2, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";

const fmtMoney = (n) =>
  n != null
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: "NZD" }).format(n)
    : "\u2014";

const RadiatorTable = ({ radiators, onEdit, onDelete, onEditStock, isAdmin }) => {
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  const getStockChipColor = (totalStock) => {
    if (totalStock === 0) return "error";
    if (totalStock <= 5) return "warning";
    return "success";
  };

  const userIsAdmin = !!isAdmin;

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "auto" }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1100 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Brand</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Year</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Type</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Dimensions</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="right">Retail</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="right">Trade</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Stock</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {radiators.map((radiator) => {
            const totalStock = getTotalStock(radiator.stock);

            return (
              <TableRow
                key={radiator.id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {radiator.name}
                  </Typography>
                  {radiator.notes && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: "block" }}>
                      {radiator.notes}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{radiator.brand}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {radiator.code}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">{radiator.year}</Typography>
                </TableCell>

                <TableCell align="center">
                  {radiator.productType ? (
                    <Chip
                      label={radiator.productType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">{"\u2014"}</Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {radiator.dimensions || <span style={{ color: "#9e9e9e" }}>{"\u2014"}</span>}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">{fmtMoney(radiator.retailPrice)}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="body2">{fmtMoney(radiator.tradePrice)}</Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={`${totalStock} units`}
                    size="small"
                    color={getStockChipColor(totalStock)}
                    variant="filled"
                  />
                  {radiator.stock && (
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {Object.entries(radiator.stock)
                          .map(([wh, qty]) => `${wh}: ${qty}`)
                          .join(" | ")}
                      </Typography>
                    </Box>
                  )}
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="Edit Stock">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditStock(radiator)}
                      >
                        <Package size={18} />
                      </IconButton>
                    </Tooltip>

                    {userIsAdmin && (
                      <>
                        <Tooltip title="Edit Radiator">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onEdit(radiator)}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Radiator">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(radiator)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RadiatorTable;
