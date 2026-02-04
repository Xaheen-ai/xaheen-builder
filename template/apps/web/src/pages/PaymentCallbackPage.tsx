/**
 * PaymentCallbackPage
 *
 * Handles Vipps payment callback after user completes payment flow.
 * Checks payment status and displays success/failure state.
 */
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  ContentSection,
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Stack,
} from '@xaheen/ds';
import { useVippsPayment } from '@xaheen/sdk';

export function PaymentCallbackPage(): React.ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Support both ?reference= (new Vipps ePayment flow) and ?orderId= (legacy)
  const orderId = searchParams.get('reference') || searchParams.get('orderId');

  // Fetch payment status using SDK hook
  const { data: paymentData, isLoading, error } = useVippsPayment(orderId || '', {
    enabled: !!orderId,
  });

  // Handle missing orderId
  if (!orderId) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Stack gap="24px" align="center" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <Heading size="lg" level={1}>
                Ugyldig betalingslenke
              </Heading>
              <Paragraph size="md">
                Betalingslenken er ugyldig eller mangler ordre-ID. Vennligst gå tilbake og prøv igjen.
              </Paragraph>
              <Button type="button" onClick={() => navigate('/')}>
                Gå til forsiden
              </Button>
            </Stack>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Stack gap="24px" align="center" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <Spinner size="lg" title="Sjekker betalingsstatus..." />
              <Heading size="md" level={1}>
                Sjekker betalingsstatus
              </Heading>
              <Paragraph size="md">
                Vennligst vent mens vi bekrefter betalingen din...
              </Paragraph>
            </Stack>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Error state
  if (error || !paymentData?.data) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-danger-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ds-color-danger-background-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-heading-1)',
                }}>
                  ✕
                </div>
                <Heading size="lg" level={1}>
                  Betaling feilet
                </Heading>
                <Paragraph size="md">
                  Vi kunne ikke fullføre betalingen din. Dette kan skyldes at betalingen ble avbrutt eller at det oppstod en feil.
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Ordre-ID: {orderId}
                </Paragraph>
                <Stack direction="horizontal" gap="12px" justify="center">
                  <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                    Gå til forsiden
                  </Button>
                  <Button type="button" onClick={() => window.location.reload()}>
                    Prøv igjen
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  const payment = paymentData.data;
  const isSuccess = payment.status === 'captured' || payment.status === 'authorized'
    || payment.status === 'COMPLETED' || payment.status === 'AUTHORIZED';
  const isPending = payment.status === 'created' || payment.status === 'PENDING' || payment.status === 'INITIATED';

  // Success state
  if (isSuccess) {
    // Store payment success in sessionStorage for booking confirmation
    sessionStorage.setItem('paymentSuccess', JSON.stringify({
      orderId: payment.reference || payment.orderId,
      amount: payment.amount,
      status: payment.status,
      timestamp: new Date().toISOString(),
    }));

    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-success-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--ds-color-success-background-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-heading-1)',
                }}>
                  ✓
                </div>
                <Heading size="lg" level={1}>
                  Betaling vellykket!
                </Heading>
                <Paragraph size="md">
                  Din betaling på <strong>{payment.amount} {payment.currency || 'NOK'}</strong> er godkjent og behandlet.
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Ordre-ID: {payment.orderId}
                </Paragraph>
                <Paragraph size="sm">
                  Du vil motta en bekreftelse på e-post om kort tid.
                </Paragraph>
                <Button type="button" onClick={() => navigate('/')}>
                  Gå til forsiden
                </Button>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Pending state
  if (isPending) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        paddingTop: 'var(--ds-spacing-16)',
      }}>
        <ContentLayout>
          <ContentSection>
            <Card
              style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: 'var(--ds-spacing-8)',
                border: '2px solid var(--ds-color-warning-border-default)',
              }}
            >
              <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
                <Spinner size="lg" title="Behandler betaling..." />
                <Heading size="lg" level={1}>
                  Betaling behandles
                </Heading>
                <Paragraph size="md">
                  Betalingen din er mottatt og behandles. Dette kan ta noen øyeblikk.
                </Paragraph>
                <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Ordre-ID: {orderId}
                </Paragraph>
                <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
                  Oppdater status
                </Button>
              </Stack>
            </Card>
          </ContentSection>
        </ContentLayout>
      </div>
    );
  }

  // Failed state (default fallback)
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-neutral-background-default)',
      paddingTop: 'var(--ds-spacing-16)',
    }}>
      <ContentLayout>
        <ContentSection>
          <Card
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              padding: 'var(--ds-spacing-8)',
              border: '2px solid var(--ds-color-danger-border-default)',
            }}
          >
            <Stack gap="24px" align="center" style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--ds-color-danger-background-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-heading-1)',
              }}>
                ✕
              </div>
              <Heading size="lg" level={1}>
                Betaling avbrutt
              </Heading>
              <Paragraph size="md">
                Betalingen ble avbrutt eller fullført ikke. Ingen beløp er trukket fra kontoen din.
              </Paragraph>
              <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ordre-ID: {orderId}
              </Paragraph>
              <Stack direction="horizontal" gap="12px" justify="center">
                <Button type="button" variant="secondary" onClick={() => navigate('/')}>
                  Gå til forsiden
                </Button>
                <Button type="button" onClick={() => navigate(-1)}>
                  Tilbake
                </Button>
              </Stack>
            </Stack>
          </Card>
        </ContentSection>
      </ContentLayout>
    </div>
  );
}
