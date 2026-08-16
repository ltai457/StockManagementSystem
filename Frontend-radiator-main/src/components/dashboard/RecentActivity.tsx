// @ts-nocheck
import React from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { CallReceived, CallMade, InfoOutlined } from '@mui/icons-material';
import { AppCard } from '../common/ui';

const RecentActivity = ({ stockMovements = [] }) => {
  const getMovementQuantity = (movement) => {
    const quantityCandidates = [
      movement?.quantity,
      movement?.quantityChange,
      movement?.quantityIn,
      movement?.quantityOut
    ];

    for (const candidate of quantityCandidates) {
      if (candidate === null || candidate === undefined) continue;
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric)) return numeric;
    }

    return 0;
  };

  const resolveMovementType = (movement) => {
    const rawType = movement?.movementType || movement?.type || movement?.direction;
    if (typeof rawType === 'string') {
      const normalized = rawType.trim().toUpperCase();
      if (normalized.endsWith('_STOCK')) {
        return normalized.includes('IN') ? 'INCOMING' : 'OUTGOING';
      }
      return normalized;
    }
    return '';
  };

  const resolveMovementTime = (movement) => {
    const candidates = [
      movement?.movementDate,
      movement?.createdAt,
      movement?.updatedAt,
      movement?.timestamp,
      movement?.date
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    return new Date();
  };

  const generateActivities = () => {
    const recentMovements = [...stockMovements]
      .sort((a, b) => new Date(b.movementDate || b.createdAt || 0) - new Date(a.movementDate || a.createdAt || 0))
      .slice(0, 6);

    return recentMovements.map(movement => {
      const type = resolveMovementType(movement);
      const isIncoming = type === 'INCOMING';
      const changeType = String(movement?.changeType || '').trim();
      const normalizedChangeType = changeType.toUpperCase();

      let message = isIncoming ? 'Stock received' : 'Stock dispatched';
      if (normalizedChangeType === 'SALE') {
        message = 'Sale completed';
      } else if (normalizedChangeType === 'STOCK IN') {
        message = 'Stock received';
      } else if (normalizedChangeType === 'STOCK MOVEMENT IN') {
        message = 'Stock moved in';
      } else if (normalizedChangeType === 'STOCK MOVEMENT OUT') {
        message = 'Stock moved out';
      } else if (normalizedChangeType === 'MANUAL ADJUSTMENT' || normalizedChangeType === 'MANUAL UPDATE') {
        message = 'Manual adjustment';
      }

      const movementId =
        movement?.id ??
        movement?.referenceId ??
        movement?.transactionId ??
        movement?.stockMovementId ??
        Math.random().toString(36).slice(2);

      return {
        id: `movement-${movementId}`,
        type: isIncoming ? 'incoming' : 'outgoing',
        message,
        details: `${movement.productName ||
          movement.productCode ||
          movement.radiatorName ||
          movement.radiatorCode ||
          'Stock item'} · ${getMovementQuantity(movement)} units · ${movement.warehouseName ||
          movement.warehouseCode ||
          'Unknown warehouse'}${changeType ? ` · ${changeType}` : ''}`,
        time: resolveMovementTime(movement),
        color: isIncoming ? 'green' : 'red'
      };
    });
  };

  const activities = generateActivities();

  const getActivityIcon = (type) => {
    const incoming = type === 'incoming';
    const outgoing = type === 'outgoing';
    return (
      <Avatar sx={{ width: 32, height: 32, bgcolor: incoming ? 'success.light' : outgoing ? 'error.light' : 'grey.200', color: incoming ? 'success.dark' : outgoing ? 'error.dark' : 'text.secondary' }}>
        {incoming ? <CallReceived fontSize="small" /> : outgoing ? <CallMade fontSize="small" /> : <InfoOutlined fontSize="small" />}
      </Avatar>
    );
  };

  const formatTimeAgo = (time) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <AppCard title="Recent Activity">
      <Stack spacing={2}>
        {activities.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary">No recent activity</Typography>
            <Typography variant="body2" color="text.secondary">Activity will appear here as you use the system</Typography>
          </Box>
        ) : (
          activities.map((activity) => (
            <Stack key={activity.id} direction="row" alignItems="flex-start" spacing={1.5}>
              {getActivityIcon(activity.type)}
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={600}>{activity.message}</Typography>
                <Typography variant="body2" color="text.secondary">{activity.details}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">
                {formatTimeAgo(activity.time)}
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    </AppCard>
  );
};

export default RecentActivity;
