/* eslint-disable digdir/prefer-ds-components -- Reports with data tables */

import { useState, useMemo } from 'react';
import { Card, Heading, Paragraph, Button, Badge, Spinner, BarChart, DownloadIcon, CalendarIcon, Dropdown, FilterIcon } from '@xaheen/ds';
import {
  useDashboardKPIs,
  useUsageReport,
  useRevenueReport,
  useBookingStats,
  useTimeSlotHeatmap,
  useSeasonalPatterns,
  useExportReport,
  type ReportPeriod,
  type ExportFormat,
  formatCurrency,
  formatPercent,
} from '@xaheen/sdk';

const periodLabels: Record<ReportPeriod, string> = {
  day: 'Dag',
  week: 'Uke',
  month: 'Måned',
  quarter: 'Kvartal',
  year: 'År',
};

// Filter options
const FACILITY_OPTIONS = [
  { id: 'all', label: 'Alle lokaler' },
  { id: 'facility-1', label: 'Møterom A' },
  { id: 'facility-2', label: 'Konferansesal B' },
  { id: 'facility-3', label: 'Fellesareal C' },
];

const ORGANIZATION_OPTIONS = [
  { id: 'all', label: 'Alle organisasjoner' },
  { id: 'org-1', label: 'Kulturhuset' },
  { id: 'org-2', label: 'Idrettslaget' },
  { id: 'org-3', label: 'Frivilligsentralen' },
];

const BOOKING_TYPE_OPTIONS = [
  { id: 'all', label: 'Alle typer' },
  { id: 'meeting', label: 'Møte' },
  { id: 'event', label: 'Arrangement' },
  { id: 'training', label: 'Trening' },
  { id: 'other', label: 'Annet' },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  });

  // Filter state
  const [facilityId, setFacilityId] = useState<string>('all');
  const [organizationId, setOrganizationId] = useState<string>('all');
  const [bookingType, setBookingType] = useState<string>('all');

  // Fetch data from API - API returns data directly (no wrapper)
  const { data: kpis, isLoading: isLoadingKPIs } = useDashboardKPIs();

  const usageParams = {
    period,
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
    ...(facilityId !== 'all' && { facilityId }),
    ...(organizationId !== 'all' && { organizationId }),
    ...(bookingType !== 'all' && { bookingType }),
  };
  const { data: usageData, isLoading: isLoadingUsage } = useUsageReport(usageParams);
  const usageReport = Array.isArray(usageData) ? usageData : [];

  const revenueParams = {
    period,
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
    ...(facilityId !== 'all' && { facilityId }),
    ...(organizationId !== 'all' && { organizationId }),
    ...(bookingType !== 'all' && { bookingType }),
  };
  const { data: revenueData, isLoading: isLoadingRevenue } = useRevenueReport(revenueParams);
  const revenueReport = Array.isArray(revenueData) ? revenueData : [];

  const bookingStatsParams = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
    ...(facilityId !== 'all' && { facilityId }),
    ...(organizationId !== 'all' && { organizationId }),
    ...(bookingType !== 'all' && { bookingType }),
  };
  const { data: bookingStats, isLoading: isLoadingStats } = useBookingStats(bookingStatsParams);

  const heatmapParams = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
    ...(facilityId !== 'all' && { facilityId }),
    ...(organizationId !== 'all' && { organizationId }),
    ...(bookingType !== 'all' && { bookingType }),
  };
  const { data: heatmapData, isLoading: isLoadingHeatmap } = useTimeSlotHeatmap(heatmapParams);
  const heatmap = Array.isArray(heatmapData) ? heatmapData : [];

  const seasonalParams = {
    ...(dateRange.startDate && { startDate: dateRange.startDate }),
    ...(dateRange.endDate && { endDate: dateRange.endDate }),
    ...(facilityId !== 'all' && { facilityId }),
    ...(organizationId !== 'all' && { organizationId }),
    ...(bookingType !== 'all' && { bookingType }),
  };
  const { data: seasonalData, isLoading: isLoadingSeasonal } = useSeasonalPatterns(seasonalParams);
  const seasonalPatterns = Array.isArray(seasonalData) ? seasonalData : [];

  const exportReport = useExportReport();

  // Transform usage data for chart
  const usageChartData = useMemo(() => {
    return usageReport.slice(0, 10).map((item) => ({
      label: item.listingName || item.listingId,
      value: item.totalHours || 0,
    }));
  }, [usageReport]);

  // Transform revenue data for chart
  const revenueChartData = useMemo(() => {
    return revenueReport.slice(0, 10).map((item) => ({
      label: item.period || '',
      value: item.totalRevenue || 0,
    }));
  }, [revenueReport]);

  // Transform heatmap data into 2D grid
  const heatmapGrid = useMemo(() => {
    const grid: { [hour: number]: { [dayOfWeek: number]: { bookingCount: number; utilizationRate: number } } } = {};

    // Initialize grid with zeros
    for (let hour = 0; hour < 24; hour++) {
      grid[hour] = {};
      for (let day = 0; day < 7; day++) {
        grid[hour]![day] = { bookingCount: 0, utilizationRate: 0 };
      }
    }

    // Fill grid with actual data
    heatmap.forEach((item) => {
      const hourRow = grid[item.hour];
      if (hourRow && hourRow[item.dayOfWeek] !== undefined) {
        hourRow[item.dayOfWeek] = {
          bookingCount: item.bookingCount,
          utilizationRate: item.utilizationRate,
        };
      }
    });

    return grid;
  }, [heatmap]);

  // Get max booking count for color scaling
  const maxBookingCount = useMemo(() => {
    return Math.max(...heatmap.map((item) => item.bookingCount), 1);
  }, [heatmap]);

  // Transform seasonal data for charts
  const seasonalChartData = useMemo(() => {
    // Group by period and get current year data
    const currentYear = new Date().getFullYear();
    const periodMap = new Map<string, { bookingCount: number; revenue: number }>();

    seasonalPatterns.forEach((item) => {
      if (item.year === currentYear) {
        periodMap.set(item.period, {
          bookingCount: item.bookingCount,
          revenue: item.revenue,
        });
      }
    });

    return Array.from(periodMap.entries()).map(([period, data]) => ({
      label: period,
      value: data.bookingCount,
    }));
  }, [seasonalPatterns]);

  // Calculate year-over-year comparison
  const yearOverYearData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const currentYearData = seasonalPatterns.filter((item) => item.year === currentYear);
    const previousYearData = seasonalPatterns.filter((item) => item.year === previousYear);

    // Calculate totals
    const currentTotal = currentYearData.reduce((sum, item) => sum + item.bookingCount, 0);
    const previousTotal = previousYearData.reduce((sum, item) => sum + item.bookingCount, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      currentYear,
      previousYear,
      currentTotal,
      previousTotal,
      change,
      currentRevenue: currentYearData.reduce((sum, item) => sum + item.revenue, 0),
      previousRevenue: previousYearData.reduce((sum, item) => sum + item.revenue, 0),
    };
  }, [seasonalPatterns]);

  const handleExport = (format: ExportFormat, type: 'usage' | 'revenue' | 'bookings') => {
    exportReport.mutate({
      type,
      format,
      params: {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      },
    });
  };

  const isLoading = isLoadingKPIs || isLoadingUsage || isLoadingRevenue || isLoadingStats || isLoadingHeatmap || isLoadingSeasonal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Rapporter
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Oversikt og statistikk over bookinger og bruk.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={() => handleExport('xlsx', 'usage')}
            disabled={exportReport.isPending}
          >
            <DownloadIcon />
            Eksporter Excel
          </Button>
          <Button
            type="button"
            variant="secondary"
            data-size="md"
            onClick={() => handleExport('pdf', 'usage')}
            disabled={exportReport.isPending}
          >
            <DownloadIcon />
            Eksporter PDF
          </Button>
        </div>
      </div>

      {/* Period Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CalendarIcon />
              <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>Periode:</span>
            </div>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>til</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              style={{
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            {(Object.keys(periodLabels) as ReportPeriod[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={period === p ? 'primary' : 'tertiary'}
                data-size="sm"
                onClick={() => setPeriod(p)}
              >
                {periodLabels[p]}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <FilterIcon />
            <span style={{ fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>Filtre:</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flex: 1 }}>
            <Dropdown
              items={FACILITY_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                onSelect: () => setFacilityId(opt.id),
              }))}
              label={FACILITY_OPTIONS.find((opt) => opt.id === facilityId)?.label || 'Velg lokale'}
              data-size="md"
            />
            <Dropdown
              items={ORGANIZATION_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                onSelect: () => setOrganizationId(opt.id),
              }))}
              label={ORGANIZATION_OPTIONS.find((opt) => opt.id === organizationId)?.label || 'Velg organisasjon'}
              data-size="md"
            />
            <Dropdown
              items={BOOKING_TYPE_OPTIONS.map((opt) => ({
                id: opt.id,
                label: opt.label,
                onSelect: () => setBookingType(opt.id),
              }))}
              label={BOOKING_TYPE_OPTIONS.find((opt) => opt.id === bookingType)?.label || 'Velg type'}
              data-size="md"
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card style={{ padding: 'var(--ds-spacing-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner aria-label="Laster rapporter..." />
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Aktive lokaler
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.activeListings ?? 0}
                </Heading>
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Ventende forespørsler
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.pendingRequests ?? 0}
                </Heading>
                {(kpis?.pendingRequests ?? 0) > 0 && (
                  <Badge data-color="warning" data-size="sm">Krever handling</Badge>
                )}
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Bookinger i dag
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {kpis?.todayBookings ?? 0}
                </Heading>
              </div>
            </Card>

            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                Omsetning denne {periodLabels[period].toLowerCase()}en
              </Paragraph>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
                <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                  {formatCurrency(kpis?.periodRevenue ?? 0)}
                </Heading>
                {kpis?.revenueChange !== undefined && (
                  <Badge data-color={kpis.revenueChange >= 0 ? 'success' : 'danger'} data-size="sm">
                    {formatPercent(kpis.revenueChange)}
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            {/* Usage Chart */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Bruk per lokale (timer)
                </Heading>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={() => handleExport('csv', 'usage')}
                  disabled={exportReport.isPending}
                >
                  <DownloadIcon />
                  CSV
                </Button>
              </div>
              {usageChartData.length > 0 ? (
                <BarChart data={usageChartData} />
              ) : (
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                  Ingen bruksdata for valgt periode.
                </Paragraph>
              )}
            </Card>

            {/* Revenue Chart */}
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Omsetning over tid
                </Heading>
                <Button
                  type="button"
                  variant="tertiary"
                  data-size="sm"
                  onClick={() => handleExport('csv', 'revenue')}
                  disabled={exportReport.isPending}
                >
                  <DownloadIcon />
                  CSV
                </Button>
              </div>
              {revenueChartData.length > 0 ? (
                <BarChart data={revenueChartData} maxValue={Math.max(...revenueChartData.map((d: { label: string; value: number }) => d.value))} />
              ) : (
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                  Ingen omsetningsdata for valgt periode.
                </Paragraph>
              )}
            </Card>
          </div>

          {/* Heatmap Section */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
              <div>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Booking-heatmap
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  Populære tidspunkter for bookinger (dager × timer)
                </Paragraph>
              </div>
            </div>
            {heatmap.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px', minWidth: 'min-content' }}>
                  {/* Day labels */}
                  <div style={{ display: 'flex', gap: '2px', paddingLeft: 'var(--ds-spacing-12)' }}>
                    {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((day, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '60px',
                          fontSize: 'var(--ds-font-size-xs)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          textAlign: 'center',
                          color: 'var(--ds-color-neutral-text-subtle)',
                          padding: 'var(--ds-spacing-1)',
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Heatmap grid */}
                  {Object.entries(heatmapGrid).map(([hour, days]) => (
                    <div key={hour} style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                      {/* Hour label */}
                      <div
                        style={{
                          width: 'var(--ds-spacing-12)',
                          fontSize: 'var(--ds-font-size-xs)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          textAlign: 'right',
                          color: 'var(--ds-color-neutral-text-subtle)',
                          paddingRight: 'var(--ds-spacing-2)',
                        }}
                      >
                        {hour.padStart(2, '0')}:00
                      </div>
                      {/* Day cells */}
                      {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
                        const cellData = days[dayOfWeek];

                        // Null check for cellData
                        if (!cellData) {
                          return (
                            <div
                              key={dayOfWeek}
                              style={{
                                width: '60px',
                                height: '32px',
                                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                                border: '1px solid var(--ds-color-neutral-border-subtle)',
                                borderRadius: 'var(--ds-border-radius-sm)',
                              }}
                            />
                          );
                        }

                        const intensity = cellData.bookingCount / maxBookingCount;
                        const backgroundColor = intensity > 0
                          ? `rgba(59, 130, 246, ${Math.max(0.1, intensity)})`
                          : 'var(--ds-color-neutral-surface-subtle)';

                        return (
                          <div
                            key={dayOfWeek}
                            style={{
                              width: '60px',
                              height: '32px',
                              backgroundColor,
                              border: '1px solid var(--ds-color-neutral-border-subtle)',
                              borderRadius: 'var(--ds-border-radius-sm)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 'var(--ds-font-size-xs)',
                              fontWeight: 'var(--ds-font-weight-medium)',
                              color: intensity > 0.5 ? 'var(--ds-color-neutral-contrast-default)' : 'var(--ds-color-neutral-text-default)',
                              cursor: 'pointer',
                              transition: 'transform 0.1s',
                            }}
                            title={`${cellData.bookingCount} bookinger (${cellData.utilizationRate.toFixed(1)}% utnyttelse)`}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {cellData.bookingCount > 0 ? cellData.bookingCount : ''}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)', marginTop: 'var(--ds-spacing-4)', paddingLeft: 'var(--ds-spacing-12)' }}>
                  <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Færre bookinger
                  </Paragraph>
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                    {[0.1, 0.3, 0.5, 0.7, 1.0].map((intensity, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '24px',
                          height: '16px',
                          backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                          border: '1px solid var(--ds-color-neutral-border-subtle)',
                          borderRadius: 'var(--ds-border-radius-sm)',
                        }}
                      />
                    ))}
                  </div>
                  <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Flere bookinger
                  </Paragraph>
                </div>
              </div>
            ) : (
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                Ingen heatmap-data for valgt periode.
              </Paragraph>
            )}
          </Card>

          {/* Seasonal Patterns Section */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
              <div>
                <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                  Sesongmønstre
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  Bookingvolum per sesong/måned med år-over-år sammenligning
                </Paragraph>
              </div>
              <Button
                type="button"
                variant="tertiary"
                data-size="sm"
                onClick={() => handleExport('csv', 'usage')}
                disabled={exportReport.isPending}
              >
                <DownloadIcon />
                CSV
              </Button>
            </div>

            {seasonalPatterns.length > 0 ? (
              <>
                {/* Year-over-year comparison cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-5)' }}>
                  <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      {yearOverYearData.currentYear} Bookinger
                    </Paragraph>
                    <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                      {yearOverYearData.currentTotal}
                    </Heading>
                  </Card>

                  <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      {yearOverYearData.previousYear} Bookinger
                    </Paragraph>
                    <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                      {yearOverYearData.previousTotal}
                    </Heading>
                  </Card>

                  <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      Endring (År-over-år)
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                      <Heading level={4} data-size="md" style={{ margin: 0 }}>
                        {yearOverYearData.change >= 0 ? '+' : ''}{yearOverYearData.change.toFixed(1)}%
                      </Heading>
                      <Badge
                        data-color={yearOverYearData.change >= 0 ? 'success' : 'danger'}
                        data-size="sm"
                      >
                        {yearOverYearData.change >= 0 ? 'Økning' : 'Nedgang'}
                      </Badge>
                    </div>
                  </Card>

                  <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                      Omsetning {yearOverYearData.currentYear}
                    </Paragraph>
                    <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                      {formatCurrency(yearOverYearData.currentRevenue)}
                    </Heading>
                  </Card>
                </div>

                {/* Seasonal chart */}
                {seasonalChartData.length > 0 ? (
                  <div>
                    <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-3)', margin: 0 }}>
                      Bookinger per periode ({yearOverYearData.currentYear})
                    </Paragraph>
                    <BarChart data={seasonalChartData} />
                  </div>
                ) : (
                  <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
                    Ingen data for inneværende år.
                  </Paragraph>
                )}

                {/* Monthly breakdown table */}
                <div style={{ marginTop: 'var(--ds-spacing-5)' }}>
                  <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-3)', margin: 0 }}>
                    Detaljert oversikt
                  </Paragraph>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--ds-color-neutral-border-default)' }}>
                          <th style={{
                            textAlign: 'left',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}>
                            Periode
                          </th>
                          <th style={{
                            textAlign: 'right',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}>
                            År
                          </th>
                          <th style={{
                            textAlign: 'right',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}>
                            Bookinger
                          </th>
                          <th style={{
                            textAlign: 'right',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}>
                            Omsetning
                          </th>
                          <th style={{
                            textAlign: 'right',
                            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                          }}>
                            Utnyttelse
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasonalPatterns.slice(0, 12).map((item, idx) => (
                          <tr
                            key={`${item.period}-${item.year}`}
                            style={{
                              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                              backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--ds-color-neutral-surface-subtle)',
                            }}
                          >
                            <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)' }}>
                              {item.period}
                            </td>
                            <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', textAlign: 'right' }}>
                              {item.year}
                            </td>
                            <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', textAlign: 'right', fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {item.bookingCount}
                            </td>
                            <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', textAlign: 'right', fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {formatCurrency(item.revenue)}
                            </td>
                            <td style={{ padding: 'var(--ds-spacing-2) var(--ds-spacing-3)', textAlign: 'right' }}>
                              <Badge
                                data-color={
                                  item.utilizationRate >= 70 ? 'success' :
                                  item.utilizationRate >= 40 ? 'warning' : 'neutral'
                                }
                                data-size="sm"
                              >
                                {item.utilizationRate.toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                Ingen sesongdata for valgt periode.
              </Paragraph>
            )}
          </Card>

          {/* Booking Statistics */}
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Bookingstatistikk
            </Heading>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Totalt antall
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {bookingStats?.totalBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Bekreftet
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
                  {bookingStats?.confirmedBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Venter
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-warning-text-default)' }}>
                  {bookingStats?.pendingBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Kansellert
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
                  {bookingStats?.cancelledBookings ?? 0}
                </Heading>
              </div>
              <div>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                  Gj.snitt varighet
                </Paragraph>
                <Heading level={4} data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
                  {bookingStats?.averageDuration ? `${bookingStats.averageDuration.toFixed(1)}t` : '-'}
                </Heading>
              </div>
            </div>
          </Card>

          {/* Top Listings */}
          {usageReport.length > 0 && (
            <Card style={{ padding: 'var(--ds-spacing-5)' }}>
              <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
                Mest brukte lokaler
              </Heading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {usageReport.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.listingId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: 'var(--ds-color-accent-surface-default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-bold)',
                          color: 'var(--ds-color-accent-text-default)',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {item.listingName || item.listingId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Timer
                        </Paragraph>
                        <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {item.totalHours?.toFixed(1) ?? 0}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Bookinger
                        </Paragraph>
                        <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {item.bookingCount ?? 0}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                          Utnyttelse
                        </Paragraph>
                        <Badge data-color={
                          (item.utilizationRate ?? 0) >= 70 ? 'success' :
                          (item.utilizationRate ?? 0) >= 40 ? 'warning' : 'neutral'
                        } data-size="sm">
                          {item.utilizationRate?.toFixed(0) ?? 0}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
