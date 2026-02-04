/**
 * HeatmapChart
 *
 * Grid-based heatmap visualization for displaying patterns across two dimensions.
 * Commonly used for time-based analytics (e.g., day of week vs hour of day).
 * Follows Digdir design tokens for consistent styling.
 */
import * as React from 'react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface HeatmapCell {
  /** Row identifier */
  row: string;
  /** Column identifier */
  col: string;
  /** Numeric value for this cell */
  value: number;
  /** Optional tooltip text */
  tooltip?: string;
}

export interface HeatmapChartProps {
  /** Array of data points */
  data: HeatmapCell[];
  /** Row labels (in display order) */
  rowLabels: string[];
  /** Column labels (in display order) */
  colLabels: string[];
  /** Maximum value for color scaling (defaults to max in data) */
  maxValue?: number;
  /** Minimum value for color scaling (defaults to 0) */
  minValue?: number;
  /** Cell width */
  cellWidth?: string;
  /** Cell height */
  cellHeight?: string;
  /** Gap between cells */
  gap?: string;
  /** Base color for heatmap (will be used with opacity) */
  heatColor?: string;
  /** Show value labels in cells */
  showValues?: boolean;
  /** Format function for values */
  formatValue?: (value: number) => string;
  /** Label width for row headers */
  labelWidth?: string;
  /** Custom class name */
  className?: string;
  /** Callback when cell is clicked */
  onCellClick?: (cell: HeatmapCell) => void;
}

// =============================================================================
// Component
// =============================================================================

export function HeatmapChart({
  data,
  rowLabels,
  colLabels,
  maxValue,
  minValue = 0,
  cellWidth = '48px',
  cellHeight = '48px',
  gap = 'var(--ds-spacing-1)',
  heatColor = 'var(--ds-color-accent-base-default)',
  showValues = false,
  formatValue = (v) => v.toString(),
  labelWidth = '80px',
  className,
  onCellClick,
}: HeatmapChartProps): React.ReactElement {
  // Calculate max value from data if not provided
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const min = minValue;

  // Create lookup map for quick access
  const dataMap = React.useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    data.forEach((cell) => {
      const key = `${cell.row}-${cell.col}`;
      map.set(key, cell);
    });
    return map;
  }, [data]);

  // Calculate opacity for a given value
  const getOpacity = (value: number): number => {
    if (max === min) return 0.5;
    return 0.1 + ((value - min) / (max - min)) * 0.9;
  };

  // Get cell data for a given row/col
  const getCellData = (row: string, col: string): HeatmapCell | undefined => {
    const key = `${row}-${col}`;
    return dataMap.get(key);
  };

  return (
    <div
      className={cn('heatmap-chart', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      {/* Column headers */}
      <div
        style={{
          display: 'flex',
          gap,
          marginLeft: labelWidth,
        }}
      >
        {colLabels.map((col, idx) => (
          <div
            key={idx}
            style={{
              width: cellWidth,
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'center',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Rows with data */}
      {rowLabels.map((row, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap,
          }}
        >
          {/* Row label */}
          <div
            style={{
              width: labelWidth,
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'right',
              flexShrink: 0,
              paddingRight: 'var(--ds-spacing-2)',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {row}
          </div>

          {/* Cells */}
          {colLabels.map((col, colIdx) => {
            const cellData = getCellData(row, col);
            const value = cellData?.value || 0;
            const opacity = getOpacity(value);

            return (
              <div
                key={colIdx}
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  position: 'relative',
                  cursor: onCellClick ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease',
                }}
                onClick={() => cellData && onCellClick?.(cellData)}
                onMouseEnter={(e) => {
                  if (onCellClick) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onCellClick) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
                title={cellData?.tooltip}
              >
                {/* Heat overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: heatColor,
                    opacity,
                    borderRadius: 'var(--ds-border-radius-sm)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Value label */}
                {showValues && value > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color:
                        opacity > 0.5
                          ? 'var(--ds-color-neutral-text-on-inverted)'
                          : 'var(--ds-color-neutral-text-default)',
                      pointerEvents: 'none',
                    }}
                  >
                    {formatValue(value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Compact Heatmap Variant
// =============================================================================

export interface CompactHeatmapProps {
  /** Array of data points */
  data: HeatmapCell[];
  /** Row labels (in display order) */
  rowLabels: string[];
  /** Column labels (in display order) */
  colLabels: string[];
  /** Maximum value for color scaling */
  maxValue?: number;
  /** Minimum value for color scaling */
  minValue?: number;
  /** Cell size (square) */
  cellSize?: string;
  /** Gap between cells */
  gap?: string;
  /** Base color for heatmap */
  heatColor?: string;
  /** Custom class name */
  className?: string;
  /** Callback when cell is clicked */
  onCellClick?: (cell: HeatmapCell) => void;
}

/**
 * Compact variant without labels, useful for sparkline-style visualizations
 */
export function CompactHeatmap({
  data,
  rowLabels,
  colLabels,
  maxValue,
  minValue = 0,
  cellSize = '16px',
  gap = '2px',
  heatColor = 'var(--ds-color-accent-base-default)',
  className,
  onCellClick,
}: CompactHeatmapProps): React.ReactElement {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const min = minValue;

  const dataMap = React.useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    data.forEach((cell) => {
      const key = `${cell.row}-${cell.col}`;
      map.set(key, cell);
    });
    return map;
  }, [data]);

  const getOpacity = (value: number): number => {
    if (max === min) return 0.5;
    return 0.1 + ((value - min) / (max - min)) * 0.9;
  };

  const getCellData = (row: string, col: string): HeatmapCell | undefined => {
    const key = `${row}-${col}`;
    return dataMap.get(key);
  };

  return (
    <div
      className={cn('compact-heatmap', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
      {rowLabels.map((row, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: 'flex',
            gap,
          }}
        >
          {colLabels.map((col, colIdx) => {
            const cellData = getCellData(row, col);
            const value = cellData?.value || 0;
            const opacity = getOpacity(value);

            return (
              <div
                key={colIdx}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  borderRadius: 'var(--ds-border-radius-xs)',
                  position: 'relative',
                  cursor: onCellClick ? 'pointer' : 'default',
                }}
                onClick={() => cellData && onCellClick?.(cellData)}
                title={cellData?.tooltip}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: heatColor,
                    opacity,
                    borderRadius: 'var(--ds-border-radius-xs)',
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
