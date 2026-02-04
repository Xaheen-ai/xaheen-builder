/**
 * BarChart
 *
 * Simple horizontal bar chart component for data visualization.
 * Follows Digdir design tokens for consistent styling.
 */
import * as React from 'react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface BarChartDataItem {
  /** Label for the bar */
  label: string;
  /** Numeric value */
  value: number;
  /** Optional color override */
  color?: string;
}

export interface BarChartProps {
  /** Data items to display */
  data: BarChartDataItem[];
  /** Maximum value for scale (defaults to max in data) */
  maxValue?: number;
  /** Width of label column */
  labelWidth?: string;
  /** Width of value column */
  valueWidth?: string;
  /** Bar height */
  barHeight?: string;
  /** Default bar color */
  barColor?: string;
  /** Show value labels */
  showValues?: boolean;
  /** Format function for values */
  formatValue?: (value: number) => string;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BarChart({
  data,
  maxValue,
  labelWidth = '80px',
  valueWidth = '60px',
  barHeight = '24px',
  barColor = 'var(--ds-color-accent-base-default)',
  showValues = true,
  formatValue = (v) => v.toString(),
  className,
}: BarChartProps): React.ReactElement {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={cn('bar-chart', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {/* Label */}
          <div
            style={{
              width: labelWidth,
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'right',
              flexShrink: 0,
            }}
          >
            {item.label}
          </div>

          {/* Bar container */}
          <div
            style={{
              flex: 1,
              height: barHeight,
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
              borderRadius: 'var(--ds-border-radius-sm)',
              overflow: 'hidden',
            }}
          >
            {/* Bar fill */}
            <div
              style={{
                height: '100%',
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || barColor,
                borderRadius: 'var(--ds-border-radius-sm)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Value */}
          {showValues && (
            <div
              style={{
                width: valueWidth,
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                flexShrink: 0,
              }}
            >
              {formatValue(item.value)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Vertical Bar Chart Variant
// =============================================================================

export interface VerticalBarChartProps {
  /** Data items to display */
  data: BarChartDataItem[];
  /** Maximum value for scale */
  maxValue?: number;
  /** Height of the chart */
  height?: string;
  /** Bar width */
  barWidth?: string;
  /** Gap between bars */
  gap?: string;
  /** Default bar color */
  barColor?: string;
  /** Show value labels */
  showValues?: boolean;
  /** Format function for values */
  formatValue?: (value: number) => string;
  /** Custom class name */
  className?: string;
}

export function VerticalBarChart({
  data,
  maxValue,
  height = '200px',
  barWidth = '40px',
  gap = 'var(--ds-spacing-2)',
  barColor = 'var(--ds-color-accent-base-default)',
  showValues = true,
  formatValue = (v) => v.toString(),
  className,
}: VerticalBarChartProps): React.ReactElement {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={cn('vertical-bar-chart', className)}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap,
        height,
      }}
    >
      {data.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {/* Value label */}
          {showValues && (
            <div
              style={{
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {formatValue(item.value)}
            </div>
          )}

          {/* Bar */}
          <div
            style={{
              width: barWidth,
              height: `${(item.value / max) * 100}%`,
              minHeight: '4px',
              backgroundColor: item.color || barColor,
              borderRadius: 'var(--ds-border-radius-sm) var(--ds-border-radius-sm) 0 0',
              transition: 'height 0.3s ease',
            }}
          />

          {/* Label */}
          <div
            style={{
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
