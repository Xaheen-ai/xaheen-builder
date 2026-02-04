/**
 * BookingWidgetPlacement Component
 *
 * Full-width booking section with time slot calendar.
 * Provides entry point to the booking flow.
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@xaheen/ds';
import { useCreateBooking, useAuth as useSdkAuth, auditService, useOrganizations } from '@xaheen/sdk';
import type { TenantId, ResourceId, UserId } from '@xaheen/sdk';
import type { BookingConfig } from '../../types';
import { BookingDialog, type BookingFormData, type BookingSlot } from '../BookingDialog';
import { useAuth } from '../../../../hooks/useAuth';

import { BookingStepperHeader, type BookingStep } from './components/BookingStepperHeader';
import { BookingCartSidebar, type SlotDetail } from './components/BookingCartSidebar';
import { BookingPricingStep, type PriceGroup, type AdditionalService } from './components/BookingPricingStep';
import { BookingConfirmationStep } from './components/BookingConfirmationStep';
import { BookingAvailabilityConflictDialog, type SlotAvailability } from './components/BookingAvailabilityConflictDialog';

// =============================================================================
// Icons
// =============================================================================

function ChevronLeftIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckCircleIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

type SlotStatus = 'available' | 'occupied' | 'selected' | 'unavailable';

interface TimeSlot {
  time: string;
  status: SlotStatus;
  isPast?: boolean;
}

interface DayColumn {
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  slots: TimeSlot[];
}

export interface OpeningHours {
  open: string;
  close: string;
}

// =============================================================================
// Props
// =============================================================================

export interface BookingWidgetPlacementProps {
  listingId?: string;
  tenantId?: string;
  bookingConfig?: BookingConfig;
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
  };
  className?: string;
  listingTitle?: string;
  openingHours?: Record<number, OpeningHours>;
  busySlots?: Array<{ date: string; startTime: string; endTime: string }>;
  /** Enable season rental booking option */
  allowSeasonRental?: boolean;
  /** Enable recurring booking option */
  allowRecurringBooking?: boolean;
  onSeasonRentalClick?: () => void;
  onRecurringBookingClick?: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const BOOKING_STEPS: BookingStep[] = [
  { id: 'calendar', label: 'Velg tidspunkter', icon: 'calendar' },
  { id: 'details', label: 'Detaljer og vilkår', icon: 'pricing' },
  { id: 'confirm', label: 'Bekreft', icon: 'confirm' },
  { id: 'done', label: 'Sendt', icon: 'success' },
];

const DEFAULT_PRICE_GROUPS: PriceGroup[] = [
  { id: 'standard', label: 'Standard', pricePerHour: 500, description: 'Vanlig pris for alle.' },
  { id: 'member', label: 'Medlem', pricePerHour: 350, description: 'Rabattert pris for medlemmer.' },
  { id: 'youth', label: 'Ungdom (under 26)', pricePerHour: 250, description: 'Redusert pris for unge.' },
];

const DEFAULT_ADDITIONAL_SERVICES: AdditionalService[] = [
  { id: 'cleaning', label: 'Rengjøring', description: 'Profesjonell rengjøring etter bruk', price: 500 },
  { id: 'equipment', label: 'Utstyrspakke', description: 'Inkluderer bord, stoler og projektor', price: 300 },
];

const DEFAULT_OPENING_HOURS: Record<number, OpeningHours> = {
  0: { open: '10:00', close: '18:00' },
  1: { open: '08:00', close: '21:00' },
  2: { open: '08:00', close: '21:00' },
  3: { open: '08:00', close: '21:00' },
  4: { open: '08:00', close: '21:00' },
  5: { open: '08:00', close: '21:00' },
  6: { open: '10:00', close: '18:00' },
};

// =============================================================================
// Helper Functions
// =============================================================================

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateTimeSlots(
  openingHours: Record<number, OpeningHours>,
  busySlots: Array<{ date: string; startTime: string; endTime: string }>,
  weekStart: Date,
  selectedSlots: Set<string>
): DayColumn[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dayOfWeek = date.getDay();
    const hours = openingHours[dayOfWeek] || { open: '08:00', close: '18:00' };

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const startMins = (openH ?? 8) * 60 + (openM ?? 0);
    const endMins = (closeH ?? 18) * 60 + (closeM ?? 0);

    const dateStr = date.toISOString().split('T')[0];
    const dayBusySlots = busySlots.filter(s => s.date === dateStr);

    const slots: TimeSlot[] = [];
    for (let mins = startMins; mins < endMins; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const slotKey = `${dayIndex}-${timeStr}`;

      const isPast = date < today || (date.toDateString() === now.toDateString() && mins <= now.getHours() * 60 + now.getMinutes());
      const isOccupied = dayBusySlots.some(busy => {
        const [bsH, bsM] = busy.startTime.split(':').map(Number);
        const [beH, beM] = busy.endTime.split(':').map(Number);
        const busyStart = (bsH ?? 0) * 60 + (bsM ?? 0);
        const busyEnd = (beH ?? 0) * 60 + (beM ?? 0);
        return mins >= busyStart && mins < busyEnd;
      });

      let status: SlotStatus = 'available';
      if (isPast) status = 'unavailable';
      else if (isOccupied) status = 'occupied';
      else if (selectedSlots.has(slotKey)) status = 'selected';

      slots.push({ time: timeStr, status, isPast });
    }

    return {
      dayName: dayNames[dayOfWeek] ?? '',
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      slots,
    };
  });
}

// =============================================================================
// Component
// =============================================================================

export function BookingWidgetPlacement({
  listingId,
  tenantId: listingTenantId,
  bookingConfig,
  pricing: _pricing,
  className,
  listingTitle,
  openingHours = DEFAULT_OPENING_HOURS,
  busySlots = [],
  allowSeasonRental = false,
  allowRecurringBooking = false,
  onSeasonRentalClick,
  onRecurringBookingClick,
}: BookingWidgetPlacementProps): React.ReactElement {
  const [isMobile, setIsMobile] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [weekStart, setWeekStart] = React.useState(() => getStartOfWeek(new Date()));
  const [selectedSlots, setSelectedSlots] = React.useState<Set<string>>(new Set());
  const [slotDetails, setSlotDetails] = React.useState<Record<string, SlotDetail>>({});
  const [selectedPriceGroup, setSelectedPriceGroup] = React.useState('');
  const [selectedServices, setSelectedServices] = React.useState<Set<string>>(new Set());
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [bookingAccountType, setBookingAccountType] = React.useState<'private' | 'organization' | undefined>(undefined);
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | undefined>(undefined);
  const [isAccountTypeConfirmed, setIsAccountTypeConfirmed] = React.useState(false);
  
  // Use real authentication state
  const { isAuthenticated: authIsAuthenticated, user, login: authLogin } = useAuth();
  const isAuthenticated = authIsAuthenticated;

  // SDK auth provides tenantId and userId needed for Convex mutations
  const sdkAuth = useSdkAuth({ appId: 'web' });
  const { createBooking } = useCreateBooking();
  
  // Fetch user's organizations when authenticated
  // The API should return only organizations the user is a member of
  const { data: organizationsData } = useOrganizations(
    isAuthenticated ? {} : undefined
  );
  
  const organizations = React.useMemo(() => {
    if (!organizationsData?.data) return [];
    return organizationsData.data.map(org => ({ id: org.id, name: org.name }));
  }, [organizationsData]);
  
  // Reset account selection when authentication changes
  React.useEffect(() => {
    if (!isAuthenticated) {
      setBookingAccountType(undefined);
      setSelectedOrganizationId(undefined);
      setIsAccountTypeConfirmed(false);
    }
  }, [isAuthenticated]);
  
  const handleAccountTypeSelect = (type: 'private' | 'organization' | undefined, organizationId?: string): void => {
    if (type === undefined) {
      // Reset selection
      setBookingAccountType(undefined);
      setSelectedOrganizationId(undefined);
      setIsAccountTypeConfirmed(false);
    } else {
      setBookingAccountType(type);
      setSelectedOrganizationId(organizationId);
      setIsAccountTypeConfirmed(false); // Reset confirmation when selection changes
    }
  };

  const handleConfirmAccountType = (): void => {
    setIsAccountTypeConfirmed(true);
  };
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = React.useState(false);
  const [slotAvailabilities, setSlotAvailabilities] = React.useState<SlotAvailability[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSlotForDialog, setSelectedSlotForDialog] = React.useState<BookingSlot | undefined>(undefined);
  const [isCalendarExpanded, setIsCalendarExpanded] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isBookable = bookingConfig?.enabled !== false;
  const priceGroups = DEFAULT_PRICE_GROUPS;
  const additionalServices = DEFAULT_ADDITIONAL_SERVICES;

  const calendarData = React.useMemo(
    () => generateTimeSlots(openingHours, busySlots, weekStart, selectedSlots),
    [openingHours, busySlots, weekStart, selectedSlots]
  );

  const handleSlotClick = (dayIndex: number, time: string): void => {
    const slot = calendarData[dayIndex]?.slots.find(s => s.time === time);
    if (!slot || slot.status === 'unavailable' || slot.status === 'occupied') return;

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    setSelectedSlotForDialog({
      date: slotDate,
      startTime: time,
      endTime: '',
    });
    setDialogOpen(true);
  };

  const handleDialogConfirm = (data: BookingFormData): void => {
    if (!selectedSlotForDialog) return;

    const dayIndex = Math.floor(
      (selectedSlotForDialog.date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const slotKey = `${dayIndex}-${selectedSlotForDialog.startTime}`;

    // Calculate duration from startTime and endTime
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const duration = ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0));

    setSelectedSlots(prev => new Set(prev).add(slotKey));
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: {
        duration: duration > 0 ? duration : 60,
        purpose: data.purpose,
        attendees: data.attendees,
        activityType: data.activityType,
      },
    }));
    setDialogOpen(false);
    setSelectedSlotForDialog(undefined);
  };

  const handleRemoveSlot = (slotKey: string): void => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      next.delete(slotKey);
      return next;
    });
    setSlotDetails(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleAdjustTime = (slotKey: string, minutesDelta: number): void => {
    const [dayIdxStr, timeStr] = slotKey.split('-');
    const dayIdx = parseInt(dayIdxStr ?? '0', 10);
    const [h, m] = (timeStr ?? '00:00').split(':').map(Number);
    const newMins = (h ?? 0) * 60 + (m ?? 0) + minutesDelta;
    if (newMins < 0 || newMins >= 24 * 60) return;

    const newH = Math.floor(newMins / 60);
    const newM = newMins % 60;
    const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    const newKey = `${dayIdx}-${newTime}`;

    if (selectedSlots.has(newKey)) return;

    setSelectedSlots(prev => {
      const next = new Set(prev);
      next.delete(slotKey);
      next.add(newKey);
      return next;
    });
    setSlotDetails(prev => {
      const details = prev[slotKey];
      const next = { ...prev };
      delete next[slotKey];
      if (details) next[newKey] = details;
      return next;
    });
  };

  const handleChangeDuration = (slotKey: string, duration: number): void => {
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], duration } as SlotDetail,
    }));
  };

  const handleServiceToggle = (serviceId: string, checked: boolean): void => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
  };

  const handleLoginVipps = async (): Promise<void> => {
    setIsLoggingIn(true);
    try {
      // Use real auth login
      authLogin('vipps');
      // Note: Navigation will happen in useAuth hook
    } catch (error) {
      auditService.logError('login_failed', 'auth', error instanceof Error ? error : String(error), { provider: 'vipps' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginEmployee = async (): Promise<void> => {
    setIsLoggingIn(true);
    try {
      // Use real auth login for organization (ID-porten)
      authLogin('idporten');
      // Note: Navigation will happen in useAuth hook
    } catch (error) {
      auditService.logError('login_failed', 'auth', error instanceof Error ? error : String(error), { provider: 'idporten' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmitBooking = async (): Promise<void> => {
    if (!listingId) {
      setBookingError('Mangler listing ID');
      return;
    }

    const userId = sdkAuth.user?.id;

    if (!userId) {
      setBookingError('Du må være innlogget for å booke');
      return;
    }

    if (!listingTenantId) {
      setBookingError('Kunne ikke finne utleier for dette lokalet');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      for (const slotKey of selectedSlots) {
        const [dayIdxStr, timeStr] = slotKey.split('-');
        const dayIdx = parseInt(dayIdxStr ?? '0', 10);
        const details = slotDetails[slotKey] ?? { duration: 60 };

        const slotDate = new Date(weekStart);
        slotDate.setDate(weekStart.getDate() + dayIdx);

        // Convert date + time strings to epoch milliseconds
        const [startH, startM] = (timeStr ?? '00:00').split(':').map(Number);
        slotDate.setHours(startH ?? 0, startM ?? 0, 0, 0);
        const startEpoch = slotDate.getTime();

        const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
        const endDate = new Date(slotDate);
        endDate.setHours(Math.floor(endMins / 60), endMins % 60, 0, 0);
        const endEpoch = endDate.getTime();

        // Pack purpose, attendees, activityType into notes
        const noteParts: string[] = [];
        if (details.purpose) noteParts.push(`Formål: ${details.purpose}`);
        if (details.attendees) noteParts.push(`Deltakere: ${details.attendees}`);
        if (details.activityType) noteParts.push(`Aktivitet: ${details.activityType}`);
        const notes = noteParts.length > 0 ? noteParts.join('. ') : undefined;

        await createBooking({
          tenantId: listingTenantId as TenantId,
          resourceId: listingId as unknown as ResourceId,
          userId: userId as UserId,
          startTime: startEpoch,
          endTime: endEpoch,
          notes,
        });
      }

      setCurrentStep(3);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'En feil oppstod ved booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next'): void => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = (): void => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  const getDateRangeString = (): string => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    return `${weekStart.getDate()}. ${months[weekStart.getMonth()]} – ${endDate.getDate()}. ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
  };

  const visibleRows = isCalendarExpanded ? 26 : 14; // 14 rows = ~7 hours initially, 26 = full day

  // Check availability for all selected slots against busy slots
  const checkAvailability = (): SlotAvailability[] => {
    return Array.from(selectedSlots).map(slotKey => {
      const [dayIdxStr, timeStr] = slotKey.split('-');
      const dayIdx = parseInt(dayIdxStr ?? '0', 10);
      const details = slotDetails[slotKey] ?? { duration: 60 };

      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + dayIdx);

      const [startH, startM] = (timeStr ?? '00:00').split(':').map(Number);
      const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const dateStr = slotDate.toISOString().split('T')[0] ?? '';

      // Check if this slot conflicts with any busy slot
      const isConflicting = busySlots.some(busy => {
        if (busy.date !== dateStr) return false;
        const busyStart = busy.startTime;
        const busyEnd = busy.endTime;
        // Check for time overlap
        return (timeStr ?? '') < busyEnd && endTime > busyStart;
      });

      return {
        slotKey,
        date: slotDate,
        startTime: timeStr ?? '',
        endTime,
        isAvailable: !isConflicting,
        conflictReason: isConflicting ? 'Tidspunktet er opptatt' : undefined,
      };
    });
  };

  const handleCheckAvailabilityAndProceed = (): void => {
    const availabilities = checkAvailability();
    const hasConflicts = availabilities.some(a => !a.isAvailable);

    if (hasConflicts && availabilities.length > 1) {
      // Show conflict dialog for multiple slots with conflicts
      setSlotAvailabilities(availabilities);
      setConflictDialogOpen(true);
    } else if (hasConflicts && availabilities.length === 1) {
      // Single slot with conflict - show error
      setBookingError('Det valgte tidspunktet er ikke tilgjengelig. Vennligst velg et annet tidspunkt.');
    } else {
      // No conflicts - proceed to next step
      setCurrentStep(1);
    }
  };

  const handleBookAvailableSlots = (availableSlotKeys: string[]): void => {
    // Update selected slots to only include available ones
    setSelectedSlots(new Set(availableSlotKeys));
    setConflictDialogOpen(false);
    // Proceed to next step
    setCurrentStep(1);
  };

  const handleChangeTimeFromConflict = (): void => {
    setConflictDialogOpen(false);
    // Stay on calendar step to allow user to change selections
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        gap: 'var(--ds-spacing-4)',
      }}
    >
      {/* Tabs - Separate container */}
      <BookingStepperHeader
        steps={BOOKING_STEPS}
        currentStep={currentStep}
        listingTitle={listingTitle}
        isMobile={isMobile}
        onStepClick={(stepIndex) => {
          // Only allow navigating to completed steps or current step
          if (stepIndex <= currentStep) {
            setCurrentStep(stepIndex);
          }
        }}
      />

      {/* Content Panel - Separate container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Full-width Calendar Header - spans both columns */}
        {currentStep === 0 && (
          <div
            style={{
              padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.08))',
              backgroundColor: 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.02))',
              gap: 'var(--ds-spacing-3)',
              minHeight: '56px',
              boxSizing: 'border-box',
            }}
          >
            <Button type="button" variant="tertiary" data-size="sm" onClick={goToToday}>
              I dag
            </Button>

            <div
              className="booking-date-nav"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}
            >
              <button
                type="button"
                onClick={() => navigateWeek('prev')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                }}
                aria-label="Forrige uke"
              >
                <ChevronLeftIcon size={16} />
              </button>
              <Paragraph
                data-size="sm"
                style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', minWidth: '180px', textAlign: 'center' }}
              >
                {getDateRangeString()}
              </Paragraph>
              <button
                type="button"
                onClick={() => navigateWeek('next')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  cursor: 'pointer',
                }}
                aria-label="Neste uke"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', fontSize: 'var(--ds-font-size-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.6)' }} />
                <span style={{ color: 'var(--ds-color-neutral-text-subtle, #94a3b8)' }}>Ledig</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.6)' }} />
                <span style={{ color: 'var(--ds-color-neutral-text-subtle, #94a3b8)' }}>Opptatt</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'var(--ds-color-accent-base-default, #3b82f6)', boxShadow: '0 0 8px rgba(59, 130, 246, 0.5)' }} />
                <span style={{ color: 'var(--ds-color-neutral-text-subtle, #94a3b8)' }}>Valgt</span>
              </div>
            </div>

            {/* Booking Type Buttons */}
            {(allowSeasonRental || allowRecurringBooking) && (
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                {allowSeasonRental && (
                  <button
                    type="button"
                    onClick={onSeasonRentalClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      border: '1px solid var(--ds-color-accent-border-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      cursor: 'pointer',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-accent-text-default)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                    </svg>
                    Sesongutleie
                  </button>
                )}
                {allowRecurringBooking && (
                  <button
                    type="button"
                    onClick={onRecurringBookingClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      border: '1px solid var(--ds-color-accent-border-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      cursor: 'pointer',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-accent-text-default)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Gjentakende
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content - Two columns */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
        {/* LEFT COLUMN: Step Content */}
        <div
          style={{
            flex: isMobile || currentStep === 2 ? 1 : '0 0 55%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}
        >
          {/* Step 0: Calendar Selection */}
          {currentStep === 0 && (
            <>
              {/* Calendar Grid */}
              <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4) var(--ds-spacing-5)' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `70px repeat(7, 1fr)`,
                    gap: '2px',
                    backgroundColor: 'var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.06))',
                    border: '1px solid var(--ds-color-neutral-border-subtle, rgba(255,255,255,0.1))',
                    borderRadius: 'var(--ds-border-radius-lg, 12px)',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Header Row */}
                  <div style={{ backgroundColor: 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.03))', padding: 'var(--ds-spacing-3)' }} />
                  {calendarData.map((day, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: day.isToday
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.03))',
                        padding: 'var(--ds-spacing-3)',
                        textAlign: 'center',
                        borderBottom: day.isToday ? '2px solid var(--ds-color-accent-base-default, #3b82f6)' : 'none',
                      }}
                    >
                      <Paragraph
                        data-size="xs"
                        style={{
                          margin: 0,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          color: day.isToday ? 'var(--ds-color-accent-base-default, #3b82f6)' : 'var(--ds-color-neutral-text-subtle, #64748b)',
                        }}
                      >
                        {day.dayName}
                      </Paragraph>
                      <Paragraph
                        data-size="lg"
                        style={{
                          margin: 0,
                          marginTop: '2px',
                          fontWeight: day.isToday ? 700 : 500,
                          color: day.isToday ? 'var(--ds-color-accent-base-default, #3b82f6)' : 'var(--ds-color-neutral-text-default, #fff)',
                        }}
                      >
                        {day.dayNumber}
                      </Paragraph>
                    </div>
                  ))}

                  {/* Time Rows */}
                  {Array.from({ length: visibleRows }, (_, rowIdx) => {
                    const firstDaySlots = calendarData[0]?.slots ?? [];
                    const slot = firstDaySlots[rowIdx];
                    if (!slot) return null;

                    return (
                      <React.Fragment key={rowIdx}>
                        <div
                          style={{
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            padding: 'var(--ds-spacing-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Paragraph data-size="xs" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {slot.time}
                          </Paragraph>
                        </div>
                        {calendarData.map((day, dayIdx) => {
                          const daySlot = day.slots[rowIdx];
                          if (!daySlot) return <div key={dayIdx} style={{ backgroundColor: 'var(--ds-color-neutral-background-default, #0f172a)' }} />;

                          const isClickable = daySlot.status === 'available' || daySlot.status === 'selected';

                          // Enhanced color scheme
                          const getSlotStyles = () => {
                            switch (daySlot.status) {
                              case 'selected':
                                return {
                                  backgroundColor: 'var(--ds-color-accent-base-default, #3b82f6)',
                                  boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3), 0 0 12px rgba(59, 130, 246, 0.4)',
                                };
                              case 'occupied':
                                return {
                                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                  boxShadow: 'inset 0 0 0 1px rgba(239, 68, 68, 0.3)',
                                };
                              case 'unavailable':
                                return {
                                  backgroundColor: 'var(--ds-color-neutral-surface-default, rgba(255,255,255,0.02))',
                                };
                              default: // available
                                return {
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  boxShadow: 'inset 0 0 0 1px rgba(34, 197, 94, 0.2)',
                                };
                            }
                          };

                          return (
                            <button
                              key={dayIdx}
                              type="button"
                              onClick={() => isClickable && handleSlotClick(dayIdx, daySlot.time)}
                              disabled={!isClickable}
                              className="booking-slot-cell"
                              style={{
                                ...getSlotStyles(),
                                border: 'none',
                                cursor: isClickable ? 'pointer' : 'default',
                                padding: 'var(--ds-spacing-1)',
                                minHeight: '36px',
                                transition: 'all 150ms ease',
                                opacity: daySlot.status === 'unavailable' ? 0.4 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (isClickable && daySlot.status !== 'selected') {
                                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.25)';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isClickable && daySlot.status !== 'selected') {
                                  e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                              aria-label={`${day.dayName} ${day.dayNumber}, ${daySlot.time}`}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Expand/Collapse */}
                {!isCalendarExpanded && (calendarData[0]?.slots.length ?? 0) > visibleRows && (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--ds-spacing-3)' }}>
                    <button
                      type="button"
                      onClick={() => setIsCalendarExpanded(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        border: '1px solid var(--ds-color-neutral-border-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      Vis flere
                    </button>
                  </div>
                )}
                {isCalendarExpanded && (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 'var(--ds-spacing-3)' }}>
                    <button
                      type="button"
                      onClick={() => setIsCalendarExpanded(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-2)',
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        border: '1px solid var(--ds-color-neutral-border-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--ds-font-size-sm)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      Vis færre
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Step 1: Pricing */}
          {currentStep === 1 && (
            <BookingPricingStep
              priceGroups={priceGroups}
              additionalServices={additionalServices}
              selectedPriceGroup={selectedPriceGroup}
              selectedServices={selectedServices}
              termsAccepted={termsAccepted}
              onPriceGroupChange={setSelectedPriceGroup}
              onServiceToggle={handleServiceToggle}
              onTermsChange={setTermsAccepted}
            />
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <BookingConfirmationStep
              key={`confirmation-${isAuthenticated}-${bookingAccountType}-${selectedOrganizationId}`}
              isAuthenticated={isAuthenticated}
              isLoggingIn={isLoggingIn}
              isSubmitting={isSubmitting}
              bookingError={bookingError}
              isMobile={isMobile}
              selectedSlots={selectedSlots}
              slotDetails={slotDetails}
              weekStart={weekStart}
              onLoginWithVipps={handleLoginVipps}
              onLoginAsEmployee={handleLoginEmployee}
              onConfirmBooking={handleSubmitBooking}
              onClearError={() => setBookingError(null)}
              bookingAccountType={bookingAccountType}
              selectedOrganizationId={selectedOrganizationId}
              onAccountTypeSelect={handleAccountTypeSelect}
              onConfirmAccountType={handleConfirmAccountType}
              organizations={organizations}
              isAccountTypeConfirmed={isAccountTypeConfirmed}
            />
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--ds-spacing-4)',
                }}
              >
                <CheckCircleIcon size={40} />
              </div>
              <Heading level={2} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                Booking sendt!
              </Heading>
              <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Din bookingforespørsel er sendt til utleier for godkjenning.
              </Paragraph>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Fixed Sidebar - Hidden on login step */}
        {!isMobile && currentStep < 3 && currentStep !== 2 && (
          <div
            style={{
              flex: '0 0 45%',
              minWidth: 0,
              maxWidth: '45%',
              borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <BookingCartSidebar
              selectedSlots={selectedSlots}
              slotDetails={slotDetails}
              weekStart={weekStart}
              priceGroups={priceGroups}
              additionalServices={additionalServices}
              selectedPriceGroup={selectedPriceGroup}
              selectedServices={selectedServices}
              onRemoveSlot={handleRemoveSlot}
              onAdjustTime={handleAdjustTime}
              onChangeDuration={handleChangeDuration}
            />
          </div>
        )}
      </div>

      {/* Action Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {currentStep > 0 && currentStep < 3 && (
          <Button
            type="button"
            variant="secondary"
            data-size="lg"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          >
            Tilbake
          </Button>
        )}
        {currentStep < 3 && (
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            data-color="accent"
            onClick={() => {
              if (currentStep === 2 && isAuthenticated) {
                handleSubmitBooking();
              } else if (currentStep === 0) {
                // Check availability before proceeding from calendar step
                handleCheckAvailabilityAndProceed();
              } else if (currentStep < 2) {
                setCurrentStep(prev => prev + 1);
              }
            }}
            disabled={
              !isBookable ||
              (currentStep === 0 && selectedSlots.size === 0) ||
              (currentStep === 1 && (!selectedPriceGroup || !termsAccepted)) ||
              (currentStep === 2 && (!isAuthenticated || !isAccountTypeConfirmed)) ||
              isSubmitting
            }
            style={{ flex: 1 }}
          >
            {isSubmitting
              ? 'Sender booking...'
              : currentStep === 0
                ? selectedSlots.size > 0
                  ? `Fortsett med ${selectedSlots.size} tidspunkt${selectedSlots.size > 1 ? 'er' : ''}`
                  : 'Velg tidspunkt for å fortsette'
                : currentStep === 1
                  ? 'Fortsett til bekreftelse'
                  : currentStep === 2
                    ? isAuthenticated && isAccountTypeConfirmed
                      ? 'Send bookingforespørsel'
                      : isAuthenticated && bookingAccountType
                        ? 'Bekreft bookingtype'
                        : isAuthenticated
                          ? 'Velg bookingtype'
                          : 'Logg inn for å fortsette'
                    : 'Ferdig'}
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            onClick={() => {
              setCurrentStep(0);
              setSelectedSlots(new Set());
              setSlotDetails({});
              setSelectedPriceGroup('');
              setSelectedServices(new Set());
              setTermsAccepted(false);
            }}
            style={{ flex: 1 }}
          >
            Book flere tidspunkter
          </Button>
        )}
      </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        key={selectedSlotForDialog ? `${selectedSlotForDialog.date.getTime()}-${selectedSlotForDialog.startTime}` : 'dialog'}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        slot={selectedSlotForDialog}
        busySlots={busySlots}
      />

      {/* Availability Conflict Dialog */}
      <BookingAvailabilityConflictDialog
        isOpen={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        slots={slotAvailabilities}
        onChangeTime={handleChangeTimeFromConflict}
        onBookAvailable={handleBookAvailableSlots}
        listingTitle={listingTitle}
      />
    </div>
  );
}

export default BookingWidgetPlacement;
