/**
 * Type-Specific Fields Step
 * Dynamic form fields based on listing type (SPACE, RESOURCE, SERVICE, EVENT, VEHICLE, OTHER)
 */

import {
  FormField,
  Textfield,
  Select,
  Checkbox,
  Stack,
  Paragraph,
  Alert,
} from '@xaheen/ds';
import type { BackofficeListing } from '../../../types';

export interface TypeSpecificStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function TypeSpecificStep({ data, onChange, errors: _errors = [] }: TypeSpecificStepProps) {
  const listingType = data.type;

  const handleFieldChange = (field: string, value: any) => {
    onChange({
      ...data,
      typeSpecificData: {
        ...(data.typeSpecificData || {}),
        [field]: value,
      },
    });
  };

  // Get the current type-specific data
  const typeData = data.typeSpecificData || {};

  // Render different fields based on listing type
  const renderTypeSpecificFields = () => {
    switch (listingType) {
      case 'SPACE':
        return (
          <Stack spacing={4}>
            <Alert severity="info">
              <Paragraph data-size="sm">
                Legg til detaljer om lokalet som hjelper brukere å forstå rommet bedre.
              </Paragraph>
            </Alert>

            <FormField
              label="Gulvtype"
              description="Type gulv i lokalet"
            >
              <Select
                value={typeData.floorType || ''}
                onChange={(e) => handleFieldChange('floorType', e.target.value)}
              >
                <option value="">Velg gulvtype...</option>
                <option value="parkett">Parkett</option>
                <option value="laminat">Laminat</option>
                <option value="vinyl">Vinyl</option>
                <option value="treningsgulv">Treningsgulv</option>
                <option value="tregulv">Tregulv</option>
                <option value="betong">Betong</option>
                <option value="kunstgress">Kunstgress</option>
                <option value="annet">Annet</option>
              </Select>
            </FormField>

            <FormField
              label="Maksimal takhøyde (meter)"
              description="Takhøyde i meter"
            >
              <Textfield
                type="number"
                value={typeData.ceilingHeight || ''}
                onChange={(e) => handleFieldChange('ceilingHeight', parseFloat(e.target.value))}
                placeholder="F.eks. 3.5"
                step="0.1"
                min="0"
              />
            </FormField>

            <FormField
              label="Areal (m²)"
              description="Lokalets areal i kvadratmeter"
            >
              <Textfield
                type="number"
                value={typeData.area || ''}
                onChange={(e) => handleFieldChange('area', parseFloat(e.target.value))}
                placeholder="F.eks. 120"
                step="1"
                min="0"
              />
            </FormField>

            <FormField
              label="Scenestørrelse"
              description="Kun relevant for scener eller rom med scene"
            >
              <Textfield
                value={typeData.stageSize || ''}
                onChange={(e) => handleFieldChange('stageSize', e.target.value)}
                placeholder="F.eks. 6m x 4m"
              />
            </FormField>

            <div>
              <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                Fasiliteter
              </Paragraph>
              <Stack spacing={2}>
                <Checkbox
                  checked={typeData.hasKitchen || false}
                  onChange={(e) => handleFieldChange('hasKitchen', e.target.checked)}
                >
                  Kjøkken/Kjøkkenkrok
                </Checkbox>
                <Checkbox
                  checked={typeData.hasProjector || false}
                  onChange={(e) => handleFieldChange('hasProjector', e.target.checked)}
                >
                  Projektor/Skjerm
                </Checkbox>
                <Checkbox
                  checked={typeData.hasSoundSystem || false}
                  onChange={(e) => handleFieldChange('hasSoundSystem', e.target.checked)}
                >
                  Lydanlegg
                </Checkbox>
                <Checkbox
                  checked={typeData.hasWifi || false}
                  onChange={(e) => handleFieldChange('hasWifi', e.target.checked)}
                >
                  WiFi
                </Checkbox>
                <Checkbox
                  checked={typeData.hasWhiteboard || false}
                  onChange={(e) => handleFieldChange('hasWhiteboard', e.target.checked)}
                >
                  Tavle/Whiteboard
                </Checkbox>
              </Stack>
            </div>
          </Stack>
        );

      case 'RESOURCE':
        return (
          <Stack spacing={4}>
            <Alert severity="info">
              <Paragraph data-size="sm">
                Beskriv ressursen i detalj slik at brukere forstår hva som tilbys.
              </Paragraph>
            </Alert>

            <FormField
              label="Merke/Produsent"
              description="Hvem har laget utstyret?"
            >
              <Textfield
                value={typeData.brand || ''}
                onChange={(e) => handleFieldChange('brand', e.target.value)}
                placeholder="F.eks. Yamaha, Bose"
              />
            </FormField>

            <FormField
              label="Modell"
              description="Modellnavn eller nummer"
            >
              <Textfield
                value={typeData.model || ''}
                onChange={(e) => handleFieldChange('model', e.target.value)}
                placeholder="F.eks. Speaker X2000"
              />
            </FormField>

            <FormField
              label="Tilstand"
              description="Ressursens tilstand"
            >
              <Select
                value={typeData.condition || ''}
                onChange={(e) => handleFieldChange('condition', e.target.value)}
              >
                <option value="">Velg tilstand...</option>
                <option value="new">Ny</option>
                <option value="excellent">Utmerket</option>
                <option value="good">God</option>
                <option value="fair">Akseptabel</option>
                <option value="poor">Dårlig</option>
              </Select>
            </FormField>

            <FormField
              label="Antall tilgjengelige"
              description="Hvor mange enheter er tilgjengelige?"
            >
              <Textfield
                type="number"
                value={typeData.quantity || ''}
                onChange={(e) => handleFieldChange('quantity', parseInt(e.target.value))}
                placeholder="1"
                min="1"
              />
            </FormField>

            <div>
              <Checkbox
                checked={typeData.requiresTraining || false}
                onChange={(e) => handleFieldChange('requiresTraining', e.target.checked)}
              >
                Krever opplæring før bruk
              </Checkbox>
            </div>
          </Stack>
        );

      case 'SERVICE':
        return (
          <Stack spacing={4}>
            <Alert severity="info">
              <Paragraph data-size="sm">
                Gi detaljer om tjenesten og leveringsbetingelser.
              </Paragraph>
            </Alert>

            <FormField
              label="Tjenestevarighet"
              description="Estimert varighet per økt"
            >
              <Textfield
                value={typeData.serviceDuration || ''}
                onChange={(e) => handleFieldChange('serviceDuration', e.target.value)}
                placeholder="F.eks. 60 minutter, 2 timer"
              />
            </FormField>

            <FormField
              label="Leveringsform"
              description="Hvordan leveres tjenesten?"
            >
              <Select
                value={typeData.deliveryMethod || ''}
                onChange={(e) => handleFieldChange('deliveryMethod', e.target.value)}
              >
                <option value="">Velg leveringsform...</option>
                <option value="onsite">På stedet</option>
                <option value="online">Digitalt/Online</option>
                <option value="hybrid">Hybrid (fysisk + digitalt)</option>
              </Select>
            </FormField>

            <FormField
              label="Maksimalt antall deltakere"
              description="Hvor mange kan delta samtidig?"
            >
              <Textfield
                type="number"
                value={typeData.maxParticipants || ''}
                onChange={(e) => handleFieldChange('maxParticipants', parseInt(e.target.value))}
                placeholder="F.eks. 10"
                min="1"
              />
            </FormField>

            <div>
              <Checkbox
                checked={typeData.requiresCertification || false}
                onChange={(e) => handleFieldChange('requiresCertification', e.target.checked)}
              >
                Krever sertifisering eller kvalifikasjoner
              </Checkbox>
            </div>
          </Stack>
        );

      case 'EVENT':
        return (
          <Stack spacing={4}>
            <Alert severity="info">
              <Paragraph data-size="sm">
                Legg til informasjon om arrangementet.
              </Paragraph>
            </Alert>

            <FormField
              label="Type arrangement"
              description="Hvilken type arrangement er dette?"
            >
              <Select
                value={typeData.eventCategory || ''}
                onChange={(e) => handleFieldChange('eventCategory', e.target.value)}
              >
                <option value="">Velg type...</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Konferanse</option>
                <option value="concert">Konsert</option>
                <option value="sports">Sportsarrangement</option>
                <option value="cultural">Kulturarrangement</option>
                <option value="other">Annet</option>
              </Select>
            </FormField>

            <FormField
              label="Arrangør"
              description="Hvem arrangerer eventet?"
            >
              <Textfield
                value={typeData.organizer || ''}
                onChange={(e) => handleFieldChange('organizer', e.target.value)}
                placeholder="F.eks. Kultur Norge"
              />
            </FormField>

            <FormField
              label="Minimumsdeltakere"
              description="Minste antall påmeldte for gjennomføring"
            >
              <Textfield
                type="number"
                value={typeData.minAttendees || ''}
                onChange={(e) => handleFieldChange('minAttendees', parseInt(e.target.value))}
                placeholder="F.eks. 5"
                min="0"
              />
            </FormField>

            <FormField
              label="Maksimumsdeltakere"
              description="Maks antall påmeldte"
            >
              <Textfield
                type="number"
                value={typeData.maxAttendees || ''}
                onChange={(e) => handleFieldChange('maxAttendees', parseInt(e.target.value))}
                placeholder="F.eks. 100"
                min="1"
              />
            </FormField>

            <div>
              <Checkbox
                checked={typeData.requiresRegistration || false}
                onChange={(e) => handleFieldChange('requiresRegistration', e.target.checked)}
              >
                Krever forhåndspåmelding
              </Checkbox>
            </div>
          </Stack>
        );

      case 'VEHICLE':
        return (
          <Stack spacing={4}>
            <Alert severity="info">
              <Paragraph data-size="sm">
                Gi tekniske detaljer om kjøretøyet.
              </Paragraph>
            </Alert>

            <FormField
              label="Kjøretøytype"
              description="Type kjøretøy"
            >
              <Select
                value={typeData.vehicleType || ''}
                onChange={(e) => handleFieldChange('vehicleType', e.target.value)}
              >
                <option value="">Velg type...</option>
                <option value="car">Bil</option>
                <option value="van">Varebil</option>
                <option value="bus">Buss</option>
                <option value="boat">Båt</option>
                <option value="bicycle">Sykkel</option>
                <option value="motorcycle">Motorsykkel</option>
                <option value="trailer">Tilhenger</option>
                <option value="other">Annet</option>
              </Select>
            </FormField>

            <FormField
              label="Merke"
              description="Kjøretøymerke"
            >
              <Textfield
                value={typeData.vehicleBrand || ''}
                onChange={(e) => handleFieldChange('vehicleBrand', e.target.value)}
                placeholder="F.eks. Toyota, Tesla"
              />
            </FormField>

            <FormField
              label="Modell"
              description="Modellnavn"
            >
              <Textfield
                value={typeData.vehicleModel || ''}
                onChange={(e) => handleFieldChange('vehicleModel', e.target.value)}
                placeholder="F.eks. Corolla, Model 3"
              />
            </FormField>

            <FormField
              label="Årsmodell"
              description="Hvilket år ble kjøretøyet produsert?"
            >
              <Textfield
                type="number"
                value={typeData.yearModel || ''}
                onChange={(e) => handleFieldChange('yearModel', parseInt(e.target.value))}
                placeholder="F.eks. 2022"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </FormField>

            <FormField
              label="Drivstofftype"
              description="Hva driver kjøretøyet på?"
            >
              <Select
                value={typeData.fuelType || ''}
                onChange={(e) => handleFieldChange('fuelType', e.target.value)}
              >
                <option value="">Velg drivstoff...</option>
                <option value="electric">Elektrisk</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Bensin</option>
                <option value="hybrid">Hybrid</option>
                <option value="none">Ingen (manuell)</option>
                <option value="other">Annet</option>
              </Select>
            </FormField>

            <FormField
              label="Passasjerkapasitet"
              description="Antall sitteplasser"
            >
              <Textfield
                type="number"
                value={typeData.passengerCapacity || ''}
                onChange={(e) => handleFieldChange('passengerCapacity', parseInt(e.target.value))}
                placeholder="F.eks. 5"
                min="1"
              />
            </FormField>

            <div>
              <Checkbox
                checked={typeData.requiresLicense || false}
                onChange={(e) => handleFieldChange('requiresLicense', e.target.checked)}
              >
                Krever førerkort
              </Checkbox>
            </div>
          </Stack>
        );

      case 'OTHER':
      default:
        return (
          <Alert severity="info">
            <Paragraph data-size="sm">
              For denne typen listing, legg til all nødvendig informasjon i beskrivelsen og notater.
              Bruk de generelle feltene i de andre trinnene.
            </Paragraph>
          </Alert>
        );
    }
  };

  if (!listingType) {
    return (
      <Alert severity="warning">
        <Paragraph data-size="sm">
          Vennligst velg en listingtype først i "Grunnleggende informasjon"-steget.
        </Paragraph>
      </Alert>
    );
  }

  return (
    <div>
      <Paragraph style={{ marginBottom: 'var(--ds-spacing-5)', color: 'var(--ds-color-neutral-text-subtle)' }}>
        Disse feltene er spesifikke for <strong>{listingType.toLowerCase()}</strong>-typen og hjelper brukere å forstå tilbudet bedre.
      </Paragraph>
      {renderTypeSpecificFields()}
    </div>
  );
}
