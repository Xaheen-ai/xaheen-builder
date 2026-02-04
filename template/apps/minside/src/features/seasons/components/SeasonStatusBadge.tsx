import { Badge } from '@xaheen/ds';
import type { SeasonStatus } from '@xaheen/sdk/types';
import { SEASON_STATUS_CONFIG } from '../constants';

/**
 * Season Status Badge Component
 *
 * Displays a colored badge for season status.
 */

interface SeasonStatusBadgeProps {
  status: SeasonStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function SeasonStatusBadge({ status, size = 'md' }: SeasonStatusBadgeProps) {
  const config = SEASON_STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <Badge
      data-size={size}
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: 'none',
        fontWeight: 'var(--ds-font-weight-medium)',
      }}
    >
      {config.label}
    </Badge>
  );
}
