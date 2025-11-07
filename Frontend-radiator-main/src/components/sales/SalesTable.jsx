// src/components/inventory/SalesTable.jsx
import React from "react";
import { Eye, FileText, Copy } from "lucide-react";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../common/ui/Table";
import { Button } from "../common/ui/Button";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const SalesTable = ({ sales, onViewDetails, onViewReceipt }) => {
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {sales.map((sale) => (
          <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium text-gray-900 truncate">
                  {sale.saleNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDateTime(sale.saleDate)}
                </div>
              </div>
              <button
                onClick={() => copy(sale.saleNumber)}
                className="p-2 rounded hover:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Copy sale number"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium text-gray-900">
                  {sale.customer
                    ? `${sale.customer.firstName} ${sale.customer.lastName}`
                    : sale.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="text-gray-900">{sale.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600 font-medium">Total:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                icon={Eye}
                onClick={() => onViewDetails(sale)}
              >
                Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                icon={FileText}
                onClick={() => onViewReceipt(sale)}
              >
                Receipt
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block relative overflow-x-auto">
        <Table className="w-full">
          <TableHeader className="sticky top-0 z-10 bg-gray-50">
            <TableRow>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Sale #
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Date
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Customer
              </TableHead>
              <TableHead className="text-xs tracking-wider uppercase text-gray-500">
                Payment
              </TableHead>
              <TableHead className="text-right text-xs tracking-wider uppercase text-gray-500">
                Total
              </TableHead>
              <TableHead className="w-48 text-center text-xs tracking-wider uppercase text-gray-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sales.map((sale) => (
              <TableRow
                key={sale.id}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Sale # with copy-on-hover */}
                <TableCell className="font-mono">
                  <div className="group inline-flex items-center gap-2">
                    <span className="truncate max-w-[180px] md:max-w-none">
                      {sale.saleNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(sale.saleNumber)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200"
                      title="Copy sale number"
                      aria-label="Copy sale number"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </TableCell>

                <TableCell>{formatDateTime(sale.saleDate)}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {sale.customer
                    ? `${sale.customer.firstName} ${sale.customer.lastName}`
                    : sale.customerName}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {sale.paymentMethod}
                </TableCell>

                <TableCell className="text-right font-semibold">
                  {formatCurrency(sale.totalAmount)}
                </TableCell>

                {/* Centered action group; fixed width to match header */}
                <TableCell className="w-48">
                  <div className="flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm overflow-hidden border border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-none px-2 md:px-3"
                        icon={Eye}
                        onClick={() => onViewDetails(sale)}
                        title="View details"
                      >
                        <span className="hidden md:inline">View</span>
                      </Button>
                      <div className="w-px bg-gray-200" aria-hidden />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-none px-2 md:px-3"
                        icon={FileText}
                        onClick={() => onViewReceipt(sale)}
                        title="Open receipt"
                      >
                        <span className="hidden md:inline">Receipt</span>
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SalesTable;
