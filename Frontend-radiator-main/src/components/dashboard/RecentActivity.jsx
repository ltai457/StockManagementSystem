import React from 'react';

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

      const movementId =
        movement?.id ??
        movement?.referenceId ??
        movement?.transactionId ??
        movement?.stockMovementId ??
        Math.random().toString(36).slice(2);

      return {
        id: `movement-${movementId}`,
        type: isIncoming ? 'incoming' : 'outgoing',
        message: isIncoming ? 'Stock received' : 'Stock dispatched',
        details: `${movement.productName ||
          movement.productCode ||
          movement.radiatorName ||
          movement.radiatorCode ||
          'Stock item'} · ${getMovementQuantity(movement)} units · ${movement.warehouseName ||
          movement.warehouseCode ||
          'Unknown warehouse'}`,
        time: resolveMovementTime(movement),
        color: isIncoming ? 'green' : 'red'
      };
    });
  };

  const activities = generateActivities();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'incoming':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M9 21V3m7 4l4 4-4 4" />
            </svg>
          </div>
        );
      case 'outgoing':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 14H10m6-11v18m-7-4l-4-4 4-4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as you use the system</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-500">{activity.details}</p>
              </div>
              <div className="text-xs text-gray-400 whitespace-nowrap">
                {formatTimeAgo(activity.time)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
