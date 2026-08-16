import type { ElementType, ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

type StatColor = "blue" | "green" | "yellow" | "red" | "purple" | "orange" | "indigo";

export interface StatItem {
  title: ReactNode;
  value: ReactNode;
  change?: number;
  icon?: ElementType;
  color?: StatColor;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 5;
}

const accentColors: Record<StatColor, { foreground: string; background: string }> = {
  blue: { foreground: "#2563eb", background: "#dbeafe" },
  green: { foreground: "#16a34a", background: "#dcfce7" },
  yellow: { foreground: "#ca8a04", background: "#fef9c3" },
  red: { foreground: "#dc2626", background: "#fee2e2" },
  purple: { foreground: "#9333ea", background: "#f3e8ff" },
  orange: { foreground: "#ea580c", background: "#ffedd5" },
  indigo: { foreground: "#4f46e5", background: "#e0e7ff" },
};

function StatCard({ title, value, change, icon: Icon, color = "blue" }: StatItem) {
  const accent = accentColors[color];

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box minWidth={0}>
            <Typography variant="h3" color={accent.foreground}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            {change !== undefined && (
              <Typography variant="caption" color={change >= 0 ? "success.main" : "error.main"}>
                {change > 0 ? "+" : ""}{change}%
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              alignItems="center"
              bgcolor={accent.background}
              borderRadius={2.5}
              color={accent.foreground}
              display="flex"
              flex="0 0 auto"
              height={44}
              justifyContent="center"
              width={44}
            >
              <Icon size={22} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <Box
      display="grid"
      gap={2}
      gridTemplateColumns={{
        xs: "repeat(2, minmax(0, 1fr))",
        md: `repeat(${Math.min(columns, 3)}, minmax(0, 1fr))`,
        lg: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      mb={3}
    >
      {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
    </Box>
  );
}
