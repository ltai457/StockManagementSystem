import type { ReactNode } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  type TableProps,
} from "@mui/material";

interface AppTableProps extends TableProps {
  children: ReactNode;
  minWidth?: number;
}

export function AppTable({ children, minWidth = 720, ...props }: AppTableProps) {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table {...props} sx={{ minWidth, ...props.sx }}>
        {children}
      </Table>
    </TableContainer>
  );
}

export { TableBody, TableCell, TableHead, TableRow };
