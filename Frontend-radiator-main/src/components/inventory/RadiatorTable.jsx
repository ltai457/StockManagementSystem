import React from "react";
import { Edit, Package, Trash2 } from "lucide-react";
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
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import HighlightedText from "../common/ui/HighlightedText";

const RadiatorTable = ({ radiators, warehouses, onEdit, onDelete, onEditStock, isAdmin, searchTerm }) => {
  const getTotalStock = (stock) => {
    if (!stock) return 0;
    return Object.values(stock).reduce((total, qty) => total + (qty || 0), 0);
  };

  const getStockChipColor = (totalStock) => {
    if (totalStock === 0) return "error";
    if (totalStock <= LOW_STOCK_THRESHOLD) return "warning";
    return "success";
  };

  const userIsAdmin = !!isAdmin;
  const orderedWarehouses = Array.isArray(warehouses) ? warehouses : [];

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "auto" }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1080 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Product</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Brand</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Type</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Dimension</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Total</TableCell>
            <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Stock by Warehouse</TableCell>
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
                    <HighlightedText text={radiator.model} query={searchTerm} />
                  </Typography>
                  {radiator.notes && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: "block" }}>
                      <HighlightedText text={radiator.notes} query={searchTerm} />
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    <HighlightedText text={radiator.brand} query={searchTerm} />
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    <HighlightedText text={radiator.code} query={searchTerm} />
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2">
                    {radiator.type ? <HighlightedText text={radiator.type} query={searchTerm} /> : "\u2014"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {radiator.dimension || radiator.coreDimension ? (
                      <HighlightedText
                        text={radiator.dimension || radiator.coreDimension}
                        query={searchTerm}
                      />
                    ) : (
                      <span style={{ color: "#9e9e9e" }}>{"\u2014"}</span>
                    )}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={`${totalStock} units`}
                    size="small"
                    color={getStockChipColor(totalStock)}
                    variant="filled"
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {orderedWarehouses.map((warehouse) => {
                      const quantity = radiator.stock?.[warehouse.code] || 0;
                      return (
                        <Chip
                          key={warehouse.id}
                          size="small"
                          label={`${warehouse.code}: ${quantity}`}
                          color={getStockChipColor(quantity)}
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="Edit Stock">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditStock?.(radiator)}
                      >
                        <Package size={18} />
                      </IconButton>
                    </Tooltip>
                    {userIsAdmin && (
                      <>
                        <Tooltip title="Edit Product">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onEdit(radiator)}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Product">
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
