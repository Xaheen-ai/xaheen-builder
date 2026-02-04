# Accessibility Monitoring Guide

**Production Accessibility Metrics Tracking**
**Last Updated:** 2026-01-14

This guide explains how to use the accessibility monitoring system to track metrics in production and ensure ongoing WCAG compliance.

---

## 📊 Overview

The accessibility monitoring system provides real-time tracking of accessibility metrics in production, helping you:

- **Monitor keyboard navigation** patterns
- **Detect screen reader usage**
- **Track skip link effectiveness**
- **Identify focus management issues**
- **Measure ARIA announcement success rates**
- **Calculate compliance scores**

---

## 🚀 Quick Start

### 1. Enable Monitoring in Your App

Wrap your app with the `AccessibilityMonitoringProvider`:

```tsx
import { AccessibilityMonitoringProvider } from './providers/AccessibilityMonitoringProvider';

function App() {
  return (
    <AccessibilityMonitoringProvider enabled={true}>
      <YourApp />
    </AccessibilityMonitoringProvider>
  );
}
```

### 2. Access Monitoring API

Use the hook to access monitoring functions:

```tsx
import { useAccessibilityMonitoringContext } from './providers/AccessibilityMonitoringProvider';

function MyComponent() {
  const { trackSkipLinkUsage, trackFocusIssue } = useAccessibilityMonitoringContext();

  const handleSkipLink = () => {
    trackSkipLinkUsage('main-content');
  };

  return (
    <a href="#main-content" onClick={handleSkipLink}>
      Skip to main content
    </a>
  );
}
```

### 3. View Dashboard

Display the accessibility dashboard:

```tsx
import { AccessibilityDashboard } from '@xaheen/ds';
import { useAccessibilityReport } from '@xaheen/sdk/hooks';

function AdminDashboard() {
  const { data: report, isLoading, refetch } = useAccessibilityReport(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    new Date()
  );

  if (!report) return null;

  return (
    <AccessibilityDashboard
      report={report}
      isLoading={isLoading}
      onRefresh={refetch}
    />
  );
}
```

---

## 📈 Tracked Metrics

### 1. Keyboard Navigation

**What it tracks:**
- Tab key usage (forward and backward)
- Arrow key navigation
- Enter/Space activations
- Escape key usage

**Why it matters:**
- Identifies keyboard-only users
- Validates keyboard accessibility implementation
- Detects navigation patterns

**Example:**
```tsx
// Automatically tracked when monitoring is enabled
// No additional code needed
```

### 2. Screen Reader Detection

**What it tracks:**
- Screen reader presence (NVDA, JAWS, VoiceOver, TalkBack)
- Percentage of screen reader users
- Accessibility preference settings

**Why it matters:**
- Understand your accessibility user base
- Prioritize accessibility features
- Validate screen reader compatibility

**Heuristics used:**
- User agent detection
- Reduced motion preference
- High contrast preference
- Focus-visible usage patterns

### 3. Skip Link Usage

**What it tracks:**
- Which skip links are used
- Frequency of usage
- Page-specific patterns

**Why it matters:**
- Validates skip link effectiveness
- Identifies missing skip links
- Measures keyboard user satisfaction

**Example:**
```tsx
<a
  href="#main-content"
  onClick={() => tracking?.trackSkipLinkUsage('main-content')}
>
  Skip to content
</a>
```

### 4. Focus Management

**What it tracks:**
- Focus loss events
- Keyboard traps (stuck focus)
- Focus restoration after modals

**Why it matters:**
- Detects critical accessibility bugs
- Identifies UX issues for keyboard users
- Validates modal implementations

**Automatic detection:**
- Focus lost to body/null
- Same element focused 3+ times in a row (trap)
- Page navigation focus handling

### 5. ARIA Announcements

**What it tracks:**
- Polite vs. assertive announcements
- Success rate of announcements
- Message content (anonymized)

**Why it matters:**
- Validates screen reader compatibility
- Ensures dynamic content is announced
- Identifies announcement failures

**Example:**
```tsx
<div role="status" aria-live="polite">
  Loading...
</div>
```

### 6. Page Load Performance

**What it tracks:**
- Time to interactive
- Page-specific load times
- Performance by route

**Why it matters:**
- Slow pages impact all users, especially those with disabilities
- Validates performance budgets
- Identifies optimization opportunities

---

## 🎯 Compliance Scoring

The system calculates an overall compliance score (0-100) based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Keyboard Navigation | 25% | Frequency and success of keyboard usage |
| Screen Reader Support | 20% | Screen reader user satisfaction |
| Focus Management | 20% | Absence of focus issues |
| ARIA Announcements | 15% | Success rate of announcements |
| Skip Link Usage | 10% | Effectiveness of bypass mechanisms |
| Page Performance | 10% | Load time compliance with standards |

**Score Ranges:**
- **90-100:** Utmerket (Excellent) ✅
- **70-89:** God (Good) ⚠️
- **0-69:** Trenger forbedring (Needs Improvement) ❌

---

## 🔧 Configuration

### Sampling Rate

Control how many events are tracked:

```tsx
import { AccessibilityMonitoringService } from '@xaheen/sdk';

const service = new AccessibilityMonitoringService(client, {
  sampleRate: 0.1, // Track 10% of events (reduce server load)
});
```

### Exclude Pages

Exclude specific pages from monitoring:

```tsx
const service = new AccessibilityMonitoringService(client, {
  excludePages: ['/admin', '/debug'],
});
```

### Batch Configuration

Optimize network requests:

```tsx
const service = new AccessibilityMonitoringService(client, {
  batchSize: 50, // Send metrics in batches of 50
  flushIntervalMs: 30000, // Flush every 30 seconds
});
```

---

## 🛡️ Privacy & Compliance

### GDPR Compliance

The monitoring system is designed with privacy in mind:

✅ **No PII Collection**
- No user names, emails, or IDs
- Anonymous session identifiers only
- Aggregate metrics only

✅ **No User Tracking**
- No cross-session tracking
- No fingerprinting
- Session IDs rotate

✅ **Transparent**
- Users can see what's collected
- Data retention policies documented
- Opt-out available

### Data Collected

| Data Point | Example | Privacy Level |
|------------|---------|---------------|
| Session ID | `a11y_1234567890_xyz` | Anonymous |
| Timestamp | `1705234567890` | Non-personal |
| Page | `/listings` | Non-personal |
| Action | `tab` | Non-personal |
| Element Type | `button` | Non-personal |
| User Agent | `Mozilla/5.0...` | Pseudo-anonymous |

### Not Collected

❌ User identifiers (no user_id, email, name)
❌ IP addresses
❌ Personal data
❌ Form input values
❌ Sensitive content

---

## 📊 Dashboard Features

### Circular Compliance Score

Visual representation of overall accessibility health:
- Color-coded (green/yellow/red)
- Animated progress ring
- Responsive to user preferences (reduced motion)

### Metric Cards

Individual cards for each metric type:
- Total count
- Breakdown by subtype
- Status indicators (success/warning/danger)
- Trend analysis

### Recommendations

Actionable suggestions based on data:
- Prioritized by impact
- Specific to your metrics
- Links to documentation

### Period Selection

Filter metrics by time period:
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

---

## 🔍 Interpreting Results

### High Keyboard Navigation

**Good signs:**
- Users successfully navigating with keyboard
- Tab order is logical
- Interactive elements are reachable

**Action items:**
- Ensure all functionality available via keyboard
- Test tab order regularly
- Add keyboard shortcuts for power users

### Low Screen Reader Percentage

**Possible reasons:**
- Not many users need screen readers (normal)
- Screen reader detection heuristic limitations
- Market-specific demographics

**Action items:**
- Don't assume low = good
- Manual testing still required
- Consider user surveys

### High Focus Issues

**Red flags:**
- Focus traps blocking users
- Focus lost during navigation
- Modal focus management broken

**Action items:**
- Fix keyboard traps immediately
- Improve modal focus handling
- Test with real keyboard users

### Low ARIA Success Rate

**Red flags:**
- ARIA attributes misconfigured
- Dynamic content not announced
- Screen reader compatibility issues

**Action items:**
- Review ARIA implementation
- Test with multiple screen readers
- Check console for ARIA warnings

---

## 🧪 Testing the Monitoring System

### Manual Testing

1. **Enable monitoring:**
   ```tsx
   <AccessibilityMonitoringProvider enabled={true}>
   ```

2. **Perform actions:**
   - Navigate with Tab key
   - Use skip links
   - Interact with dynamic content

3. **Check console:**
   ```
   [A11y Monitoring] Tracked: keyboard-navigation (tab)
   [A11y Monitoring] Tracked: skip-link-usage (main-content)
   ```

4. **View dashboard:**
   - See metrics update in real-time
   - Verify counts match your actions

### Automated Testing

```tsx
import { AccessibilityMonitoringService } from '@xaheen/sdk';

describe('Accessibility Monitoring', () => {
  it('should track keyboard navigation', () => {
    const service = new AccessibilityMonitoringService(mockClient);

    service.trackKeyboardNavigation('tab', 'button', '/home');

    expect(service['metricsBuffer']).toHaveLength(1);
    expect(service['metricsBuffer'][0].type).toBe('keyboard-navigation');
  });
});
```

---

## 📚 Best Practices

### 1. Enable in Production Only

```tsx
const ENABLE_MONITORING = process.env.NODE_ENV === 'production';

<AccessibilityMonitoringProvider enabled={ENABLE_MONITORING}>
```

### 2. Use Sampling for High Traffic

```tsx
// Track 10% of events in high-traffic apps
sampleRate: 0.1
```

### 3. Monitor Compliance Score Weekly

Set up alerts for score drops:

```tsx
if (report.complianceScore < 70) {
  notifyTeam('Accessibility compliance dropped below 70%');
}
```

### 4. Review Recommendations Regularly

Act on automated recommendations:

```tsx
report.recommendations.forEach(rec => {
  console.log('TODO:', rec);
});
```

### 5. Combine with Manual Testing

Automated monitoring complements, not replaces, manual testing:
- ✅ Automated: Continuous monitoring
- ✅ Manual: Deep validation
- ✅ User testing: Real-world feedback

---

## 🔗 Related Documentation

- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) - Development patterns
- [TESTING.md](./TESTING.md) - Testing guide
- [ACCESSIBILITY_REPORT.md](./ACCESSIBILITY_REPORT.md) - Current compliance status

---

## 🆘 Troubleshooting

### Metrics Not Appearing

**Check:**
1. Monitoring enabled: `enabled={true}`
2. SDK client initialized
3. Network requests succeeding
4. Browser console for errors

**Solutions:**
```tsx
// Enable debug logging
console.log('Monitoring enabled:', monitoring.isEnabled);
```

### High False Positives

**Common causes:**
- Browser extensions interfering
- Automated tests triggering detection
- Bot traffic

**Solutions:**
- Filter by user agent
- Adjust sampling rate
- Exclude automated traffic

### Dashboard Not Loading

**Check:**
1. API endpoint configured
2. Report data available
3. Date range valid
4. Network connectivity

**Solutions:**
```tsx
// Check report data
console.log('Report:', report);
```

---

## 📞 Support

For questions or issues:

1. Check [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md)
2. Review [TESTING.md](./TESTING.md)
3. Contact the team

---

**Last Updated:** 2026-01-14
**Version:** 1.0.0
