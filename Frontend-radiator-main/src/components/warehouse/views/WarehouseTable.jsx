import React from "react";
import { Warehouse, Phone, Mail, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../../common/ui/Button";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";

export default function WarehouseTable({
  items,
  sortBy,
  sortOrder,
  onSort,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}) {
  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {items.map((warehouse) => (
          <div key={warehouse.id}>
            <div className="md:hidden p-4 hover:bg-gray-50 transition-colors space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Warehouse className="h-8 w-8 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {warehouse.name}
                    </div>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {warehouse.code}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Location:</span>
                  <div className="text-gray-900">{warehouse.location || "Not specified"}</div>
                  {warehouse.address && (
                    <div className="text-xs text-gray-500">{warehouse.address}</div>
                  )}
                </div>

                {(warehouse.phone || warehouse.email) && (
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <div className="space-y-1 mt-1">
                      {warehouse.phone && (
                        <div className="flex items-center gap-1 text-gray-900">
                          <Phone className="w-3 h-3" />
                          <span>{warehouse.phone}</span>
                        </div>
                      )}
                      {warehouse.email && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span>{warehouse.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-600">Updated:</span>
                  <div className="text-gray-900">
                    {formatDate(warehouse.updatedAt || warehouse.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(warehouse)}
                  className="p-2 hover:bg-gray-100 min-w-[44px] min-h-[44px]"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(warehouse)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 min-w-[44px] min-h-[44px]"
                      title="Edit Warehouse"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(warehouse)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 min-w-[44px] min-h-[44px]"
                      title="Delete Warehouse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <TableContainer component={Paper} className="hidden md:block" sx={{ boxShadow: "none", borderTop: "1px solid", borderColor: "divider" }}>
        <Table sx={{ minWidth: 980 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? sortOrder : "asc"}
                  onClick={() => onSort("name")}
                >
                  Warehouse
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                <TableSortLabel
                  active={sortBy === "code"}
                  direction={sortBy === "code" ? sortOrder : "asc"}
                  onClick={() => onSort("code")}
                >
                  Code
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                <TableSortLabel
                  active={sortBy === "location"}
                  direction={sortBy === "location" ? sortOrder : "asc"}
                  onClick={() => onSort("location")}
                >
                  Location
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                <TableSortLabel
                  active={sortBy === "updatedAt"}
                  direction={sortBy === "updatedAt" ? sortOrder : "asc"}
                  onClick={() => onSort("updatedAt")}
                >
                  Last Updated
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((warehouse) => (
              <TableRow key={warehouse.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Warehouse size={28} color="#9ca3af" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {warehouse.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {warehouse.id?.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={warehouse.code} color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{warehouse.location || "Not specified"}</Typography>
                  {warehouse.address && (
                    <Typography variant="caption" color="text.secondary">
                      {warehouse.address}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {warehouse.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Phone size={14} />
                      <Typography variant="body2">{warehouse.phone}</Typography>
                    </Box>
                  )}
                  {warehouse.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                      <Mail size={14} />
                      <Typography variant="caption" color="text.secondary">{warehouse.email}</Typography>
                    </Box>
                  )}
                  {!warehouse.phone && !warehouse.email && (
                    <Typography variant="body2" color="text.secondary">No contact info</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(warehouse.updatedAt || warehouse.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onView(warehouse)}>
                      <Eye size={18} />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <>
                      <Tooltip title="Edit Warehouse">
                        <IconButton size="small" color="warning" onClick={() => onEdit(warehouse)}>
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Warehouse">
                        <IconButton size="small" color="error" onClick={() => onDelete(warehouse)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {items.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Warehouse className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No warehouses found</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
