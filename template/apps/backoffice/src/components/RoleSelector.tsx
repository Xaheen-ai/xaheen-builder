/**
 * Role Selector Component
 *
 * Displays role selection options for dual-role users in the backoffice.
 * Allows users to choose between Admin and Case Handler (Saksbehandler) roles.
 *
 * @example
 * ```tsx
 * function RoleSelectionPage() {
 *   return (
 *     <RoleSelector
 *       onRoleSelect={(role) => navigate(role === 'admin' ? '/' : '/work-queue')}
 *     />
 *   );
 * }
 * ```
 */
import React, { useState } from 'react';
import {
  Button,
  Checkbox,
  Heading,
  Paragraph,
} from '@xaheen/ds';
import { ShieldCheckIcon, ClipboardListIcon } from '@xaheen/ds';
import type { EffectiveBackofficeRole } from '../lib/capabilities';
import { useBackofficeRole } from '../hooks/useBackofficeRole';

// =============================================================================
// Types
// =============================================================================

export interface RoleSelectorProps {
  /** Callback fired when a role is selected */
  onRoleSelect?: (role: EffectiveBackofficeRole) => void;
  /** Show the "Remember my choice" checkbox */
  showRememberChoice?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Role Option Component
// =============================================================================

interface RoleOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

function RoleOption({
  icon,
  title,
  description,
  onClick,
  disabled = false,
}: RoleOptionProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        width: '100%',
        padding: 'var(--ds-spacing-5)',
        height: 'auto',
        textAlign: 'left',
        justifyContent: 'flex-start',
        minHeight: '88px',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '48px',
          height: '48px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: 'var(--ds-color-accent-surface-default)',
          color: 'var(--ds-color-accent-base-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-1)',
          }}
        >
          {description}
        </div>
      </div>
    </Button>
  );
}

// =============================================================================
// Role Selector Component
// =============================================================================

export function RoleSelector({
  onRoleSelect,
  showRememberChoice = true,
  className,
}: RoleSelectorProps): React.ReactElement {
  const { setEffectiveRole, grantedRoles } = useBackofficeRole();
  const [rememberChoice, setRememberChoice] = useState(false);

  const handleRoleSelect = (role: EffectiveBackofficeRole): void => {
    // Only allow selection of roles the user has been granted
    if (!grantedRoles.includes(role)) {
      return;
    }

    setEffectiveRole(role, rememberChoice);
    onRoleSelect?.(role);
  };

  const isRoleAvailable = (role: EffectiveBackofficeRole): boolean => {
    return grantedRoles.includes(role);
  };

  return (
    <div
      className={className}
      style={{
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <Heading
        level={2}
        data-size="lg"
        style={{ marginBottom: 'var(--ds-spacing-2)' }}
      >
        Velg rolle
      </Heading>
      <Paragraph
        data-size="md"
        style={{
          color: 'var(--ds-color-neutral-text-subtle)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        Du har tilgang til flere roller. Velg hvordan du vil fortsette.
      </Paragraph>

      {/* Role Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
          marginBottom: showRememberChoice ? 'var(--ds-spacing-6)' : '0',
        }}
      >
        <RoleOption
          icon={<ShieldCheckIcon size={24} />}
          title="Administrator"
          description="Full tilgang til alle funksjoner og innstillinger"
          onClick={() => handleRoleSelect('admin')}
          disabled={!isRoleAvailable('admin')}
        />
        <RoleOption
          icon={<ClipboardListIcon size={24} />}
          title="Saksbehandler"
          description="Behandle bookinger, søknader og henvendelser"
          onClick={() => handleRoleSelect('case_handler')}
          disabled={!isRoleAvailable('case_handler')}
        />
      </div>

      {/* Remember Choice Checkbox */}
      {showRememberChoice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <Checkbox
            checked={rememberChoice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberChoice(e.target.checked)}
            value="remember"
          >
            Husk mitt valg
          </Checkbox>
        </div>
      )}
    </div>
  );
}

export default RoleSelector;
