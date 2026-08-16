import type { ReactNode } from "react";
import { Card, CardActions, CardContent, CardHeader, type CardProps } from "@mui/material";

export type AppCardProps = Omit<CardProps, "title"> & {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
};

export function AppCard({ title, subtitle, actions, footer, children, ...props }: AppCardProps) {
  return (
    <Card {...props}>
      {(title || subtitle || actions) && (
        <CardHeader title={title} subheader={subtitle} action={actions} />
      )}
      <CardContent>{children}</CardContent>
      {footer && <CardActions>{footer}</CardActions>}
    </Card>
  );
}
