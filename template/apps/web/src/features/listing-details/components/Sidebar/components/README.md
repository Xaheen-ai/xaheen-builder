# Booking Widget Components

This directory contains refactored components from the large `BookingWidgetPlacement` component, broken down into smaller, more manageable pieces.

## Component Structure

```
components/
├── BookingStepperHeader.tsx       - Step indicator at the top
├── BookingSelectedSlotsSidebar.tsx - Fixed sidebar with selected slots
├── BookingPricingStep.tsx          - Step 1: Price selection form
├── BookingConfirmationStep.tsx     - Step 2: Login and confirmation
└── README.md                        - This file
```

## Component Overview

### 1. BookingStepperHeader

Displays the current step in the booking flow with visual progress indicators.

**Props:**
- `steps`: Array of step objects with `id` and `label`
- `currentStep`: Current step index (0-based)
- `listingTitle`: Optional listing name
- `isMobile`: Mobile responsive flag

**Usage:**
```tsx
<BookingStepperHeader
  steps={bookingSteps}
  currentStep={currentStep}
  listingTitle="Idrettshall"
  isMobile={isMobile}
/>
```

### 2. BookingSelectedSlotsSidebar

**KEY COMPONENT for Fixed Sidebar Layout**

Displays selected time slots with accordion controls for editing. This component should be rendered in a fixed sidebar that persists across all steps.

**Props:**
- `selectedSlots`: Set of selected slot keys
- `slotDetails`: Record of slot details by key
- `weekStart`: Current week start date
- `selectedPriceGroup`: Selected price group ID (optional)
- `totalPrice`: Calculated total price (optional)
- `onRemoveSlot`: Callback to remove a slot
- `onAdjustTime`: Callback to adjust slot time
- `onChangeDuration`: Callback to change slot duration

**Usage:**
```tsx
<BookingSelectedSlotsSidebar
  selectedSlots={selectedSlots}
  slotDetails={slotDetails}
  weekStart={weekStart}
  selectedPriceGroup={selectedPriceGroup}
  totalPrice={calculateTotalPrice()}
  onRemoveSlot={handleRemoveSlot}
  onAdjustTime={handleAdjustTime}
  onChangeDuration={handleChangeDuration}
/>
```

### 3. BookingPricingStep

Form for selecting price groups, additional services, and accepting terms.

**Props:**
- `priceGroups`: Array of available price groups
- `additionalServices`: Array of available services
- `selectedPriceGroup`: Currently selected price group ID
- `selectedServices`: Set of selected service IDs
- `termsAccepted`: Whether terms have been accepted
- `onPriceGroupChange`: Callback for price group changes
- `onServiceToggle`: Callback for service toggle
- `onTermsChange`: Callback for terms acceptance

**Usage:**
```tsx
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
```

### 4. BookingConfirmationStep

Handles login prompts and final booking confirmation display.

**Props:**
- `isAuthenticated`: Authentication status
- `isLoggingIn`: Login in progress flag
- `isSubmitting`: Submission in progress flag
- `bookingError`: Error message (if any)
- `isMobile`: Mobile flag
- `selectedSlots`: Selected slot keys
- `slotDetails`: Slot details record
- `weekStart`: Week start date
- `onLoginWithVipps`: Vipps login callback
- `onLoginAsEmployee`: Employee login callback
- `onConfirmBooking`: Confirmation callback
- `onClearError`: Error clear callback

**Usage:**
```tsx
<BookingConfirmationStep
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
  onConfirmBooking={handleConfirmBooking}
  onClearError={() => setBookingError(null)}
/>
```

## Implementing the Fixed Sidebar Layout

To implement the fixed sidebar layout where the right sidebar stays visible across all steps:

```tsx
<div style={{ display: 'flex', height: '100%' }}>
  {/* LEFT COLUMN: Step content (changes) */}
  <div style={{ flex: '0 0 65%', overflow: 'auto' }}>
    {currentStep === 0 && <CalendarView />}
    {currentStep === 1 && <BookingPricingStep {...pricingProps} />}
    {currentStep === 2 && <BookingConfirmationStep {...confirmProps} />}
    {currentStep === 3 && <BookingSuccessStep />}
  </div>

  {/* RIGHT COLUMN: Fixed sidebar (persists) */}
  {!isMobile && (
    <div style={{
      flex: '0 0 35%',
      borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
      overflow: 'auto',
      backgroundColor: 'var(--ds-color-neutral-background-subtle)'
    }}>
      <BookingSelectedSlotsSidebar {...sidebarProps} />
    </div>
  )}
</div>
```

## Benefits of This Refactoring

1. **Separation of Concerns**: Each component has a single responsibility
2. **Easier Testing**: Smaller components are easier to test in isolation
3. **Better Maintainability**: Changes to one step don't affect others
4. **Clearer Layout**: Two-column layout is easier to implement with separated components
5. **Reusability**: Components can be reused in different contexts
6. **Smaller Files**: No more 2857-line monolithic file!

## Next Steps

1. Update `BookingWidgetPlacement.tsx` to import and use these components
2. Implement the two-column layout as shown above
3. Keep all state management in the parent component
4. Pass props and callbacks down to child components
5. The calendar view (Step 0) can remain in the parent file for now since it's very large

## State Management

All state should remain in the parent `BookingWidgetPlacement` component:
- `selectedSlots`, `slotDetails`
- `selectedPriceGroup`, `selectedServices`
- `termsAccepted`
- `currentStep`
- `isAuthenticated`, `isLoggingIn`
- etc.

Components receive state as props and trigger changes via callbacks.
