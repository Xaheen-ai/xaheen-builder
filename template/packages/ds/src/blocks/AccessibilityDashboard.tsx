/**
 * AccessibilityDashboard - Real-time accessibility metrics visualization
 *
 * Displays accessibility monitoring data in a user-friendly dashboard
 * with WCAG AAA compliant design.
 */

import * as React from 'react';

// Accessibility Report type (from SDK)
export interface AccessibilityReport {
  period: {
    start: Date;
    end: Date;
  };
  tenantId: string;
  metrics: {
    keyboardNavigation: {
      total: number;
      byAction: Record<string, number>;
      byPage: Record<string, number>;
    };
    skipLinkUsage: {
      total: number;
      byTarget: Record<string, number>;
    };
    screenReaderUsers: {
      total: number;
      percentage: number;
      byType: Record<string, number>;
    };
    focusIssues: {
      total: number;
      byType: Record<string, number>;
    };
    ariaAnnouncements: {
      total: number;
      successRate: number;
    };
  };
  complianceScore: number; // 0-100
  recommendations: string[];
}

export interface AccessibilityDashboardProps {
  report: AccessibilityReport;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function AccessibilityDashboard({
  report,
  isLoading = false,
  onRefresh,
  className,
}: AccessibilityDashboardProps): React.ReactElement {
  // Calculate compliance badge color
  const getComplianceColor = (score: number): string => {
    if (score >= 90) return 'var(--ds-color-success-border-default)';
    if (score >= 70) return 'var(--ds-color-warning-border-default)';
    return 'var(--ds-color-danger-border-default)';
  };

  const getComplianceLabel = (score: number): string => {
    if (score >= 90) return 'Utmerket';
    if (score >= 70) return 'God';
    return 'Trenger forbedring';
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-6)',
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 'var(--ds-font-size-2xl)',
              fontWeight: 'var(--ds-font-weight-bold)' as unknown as number,
              color: 'var(--ds-color-neutral-text-default)',
              margin: 0,
            }}
          >
            Tilgjengelighetsoversikt
          </h2>
          <p
            style={{
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
              margin: 'var(--ds-spacing-1) 0 0 0',
            }}
          >
            {new Date(report.period.start).toLocaleDateString('nb-NO')} -{' '}
            {new Date(report.period.end).toLocaleDateString('nb-NO')}
          </p>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-accent-base-default)',
              color: 'var(--ds-color-accent-contrast-default)',
              border: 'none',
              borderRadius: 'var(--ds-border-radius-md)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
            aria-label="Oppdater tilgjengelighetsdata"
          >
            {isLoading ? 'Oppdaterer...' : 'Oppdater'}
          </button>
        )}
      </div>

      {/* Compliance Score Card */}
      <div
        role="region"
        aria-label="Samlet tilgjengelighetsscore"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 'var(--ds-spacing-8)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Circular Progress */}
          <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--ds-color-neutral-border-subtle)"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={getComplianceColor(report.complianceScore)}
              strokeWidth="12"
              strokeDasharray={`${(report.complianceScore / 100) * 565} 565`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
          </svg>

          {/* Score Text */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 'var(--ds-font-size-5xl)',
                fontWeight: 'var(--ds-font-weight-bold)' as unknown as number,
                color: 'var(--ds-color-neutral-text-default)',
                lineHeight: 1,
              }}
            >
              {report.complianceScore}
            </span>
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginTop: 'var(--ds-spacing-1)',
              }}
            >
              av 100
            </span>
          </div>
        </div>

        <span
          style={{
            marginTop: 'var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-lg)',
            fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
            color: getComplianceColor(report.complianceScore),
          }}
        >
          {getComplianceLabel(report.complianceScore)}
        </span>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Keyboard Navigation */}
        <MetricCard
          title="Tastaturnavigasjon"
          value={report.metrics.keyboardNavigation.total.toLocaleString('nb-NO')}
          subtitle="hendelser"
          icon="⌨️"
          details={[
            {
              label: 'Tab-navigasjon',
              value: report.metrics.keyboardNavigation.byAction.tab || 0,
            },
            {
              label: 'Enter-aktivering',
              value: report.metrics.keyboardNavigation.byAction.enter || 0,
            },
          ]}
        />

        {/* Screen Reader Usage */}
        <MetricCard
          title="Skjermleserbrukere"
          value={`${report.metrics.screenReaderUsers.percentage.toFixed(1)}%`}
          subtitle={`${report.metrics.screenReaderUsers.total} brukere`}
          icon="🔊"
          details={Object.entries(report.metrics.screenReaderUsers.byType).map(([type, count]) => ({
            label: type,
            value: count as number,
          }))}
        />

        {/* Skip Link Usage */}
        <MetricCard
          title="Hopp-til-lenker"
          value={report.metrics.skipLinkUsage.total.toLocaleString('nb-NO')}
          subtitle="brukstilfeller"
          icon="⏩"
          details={Object.entries(report.metrics.skipLinkUsage.byTarget).map(([target, count]) => ({
            label: target,
            value: count as number,
          }))}
        />

        {/* Focus Issues */}
        <MetricCard
          title="Fokusproblemer"
          value={report.metrics.focusIssues.total.toLocaleString('nb-NO')}
          subtitle="hendelser"
          icon="🎯"
          status={report.metrics.focusIssues.total > 10 ? 'warning' : 'success'}
          details={Object.entries(report.metrics.focusIssues.byType).map(([type, count]) => ({
            label: type,
            value: count as number,
          }))}
        />

        {/* ARIA Announcements */}
        <MetricCard
          title="ARIA-kunngjøringer"
          value={`${report.metrics.ariaAnnouncements.successRate.toFixed(1)}%`}
          subtitle="suksessrate"
          icon="📢"
          status={report.metrics.ariaAnnouncements.successRate > 95 ? 'success' : 'warning'}
          details={[
            {
              label: 'Totalt',
              value: report.metrics.ariaAnnouncements.total,
            },
          ]}
        />
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div
          role="region"
          aria-label="Anbefalinger for forbedring"
          style={{
            padding: 'var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-info-border-default)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--ds-font-size-lg)',
              fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
              color: 'var(--ds-color-info-text-default)',
              margin: '0 0 var(--ds-spacing-4) 0',
            }}
          >
            💡 Anbefalinger
          </h3>
          <ul
            style={{
              margin: 0,
              padding: '0 0 0 var(--ds-spacing-5)',
              listStyle: 'disc',
            }}
          >
            {report.recommendations.map((recommendation: string, index: number) => (
              <li
                key={index}
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-info-text-default)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          circle {
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          button:focus-visible {
            outline: 4px solid var(--ds-color-focus-outer);
            outline-offset: 2px;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// MetricCard Component
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  status?: 'success' | 'warning' | 'danger';
  details?: Array<{ label: string; value: number }>;
}

function MetricCard({ title, value, subtitle, icon, status, details }: MetricCardProps): React.ReactElement {
  const getStatusColor = (): string => {
    if (!status) return 'var(--ds-color-neutral-border-subtle)';
    switch (status) {
      case 'success':
        return 'var(--ds-color-success-border-default)';
      case 'warning':
        return 'var(--ds-color-warning-border-default)';
      case 'danger':
        return 'var(--ds-color-danger-border-default)';
    }
  };

  return (
    <div
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderLeft: `4px solid ${getStatusColor()}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--ds-font-size-2xl)',
          }}
          role="img"
          aria-hidden="true"
        >
          {icon}
        </span>
        <h4
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)' as unknown as number,
            color: 'var(--ds-color-neutral-text-default)',
            margin: 0,
          }}
        >
          {title}
        </h4>
      </div>

      <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
        <div
          style={{
            fontSize: 'var(--ds-font-size-3xl)',
            fontWeight: 'var(--ds-font-weight-bold)' as unknown as number,
            color: 'var(--ds-color-neutral-text-default)',
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-1)',
          }}
        >
          {subtitle}
        </div>
      </div>

      {details && details.length > 0 && (
        <div
          style={{
            paddingTop: 'var(--ds-spacing-3)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          {details.map((detail, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--ds-font-size-xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                marginTop: index > 0 ? 'var(--ds-spacing-1)' : 0,
              }}
            >
              <span>{detail.label}</span>
              <span style={{ fontWeight: 'var(--ds-font-weight-medium)' as unknown as number }}>
                {detail.value.toLocaleString('nb-NO')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccessibilityDashboard;
