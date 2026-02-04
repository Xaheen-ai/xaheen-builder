/**
 * OrganizationMembersPage
 *
 * Organization members management for Minside app
 * - List all members with roles
 * - Invite new members
 * - Update member roles
 * - Remove members
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Input,
  Select,
  Label,
  useDialog,
} from '@xaheen/ds';
import {
  useOrganizationMembers,
} from '@xaheen/sdk';
import { useT } from '@xaheen/i18n';
import { NavLink } from 'react-router-dom';

const MOBILE_BREAKPOINT = 768;
const ORG_ID = 'demo-org';

const ROLES = ['admin', 'member', 'viewer'] as const;
type Role = typeof ROLES[number];

export function OrganizationMembersPage() {
  const t = useT();
  const { confirm } = useDialog();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: membersData, isLoading } = useOrganizationMembers(ORG_ID);
  const addMember = useAddOrganizationMember();
  const removeMember = useRemoveOrganizationMember();
  const updateMember = useUpdateOrganizationMember();

  const members = membersData?.data ?? [];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      await addMember.mutateAsync({
        orgId: ORG_ID,
        data: { email: inviteEmail, role: inviteRole },
      });
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    const confirmed = await confirm({
      title: t('org.removeMember'),
      description: t('org.confirmRemoveMember', { name: memberName }),
      confirmText: t('common.remove'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    });
    
    if (confirmed) {
      await removeMember.mutateAsync({ orgId: ORG_ID, memberId });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    await updateMember.mutateAsync({
      orgId: ORG_ID,
      memberId,
      data: { role: newRole },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <NavLink to="/org" style={{ color: 'var(--ds-color-accent-text-default)', textDecoration: 'none', fontSize: 'var(--ds-font-size-sm)' }}>
            ← {t('org.backToDashboard')}
          </NavLink>
          <Heading level={1} data-size="lg" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
            {t('org.members')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('org.membersDesc')}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="primary"
          data-size="md"
          onClick={() => setShowInviteForm(!showInviteForm)}
          style={{ width: isMobile ? '100%' : 'auto', minHeight: '44px' }}
        >
          {t('org.inviteMember')}
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            {t('org.inviteNewMember')}
          </Heading>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto auto',
            gap: 'var(--ds-spacing-3)',
            alignItems: 'end',
          }}>
            <div>
              <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('common.email')}
              </Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="bruker@example.no"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 'var(--ds-font-weight-medium)' }}>
                {t('common.role')}
              </Label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={handleInvite}
              disabled={addMember.isPending || !inviteEmail.trim()}
              style={{ minHeight: '44px' }}
            >
              {addMember.isPending ? t('common.sending') : t('common.invite')}
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('org.totalMembers')}
          </Paragraph>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            {members.length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('org.admins')}
          </Paragraph>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            {members.filter((m: { id: string; name: string; email: string; role: string; joinedAt?: string }) => m.role === 'admin').length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
            {t('org.regularMembers')}
          </Paragraph>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            {members.filter((m: { id: string; name: string; email: string; role: string; joinedAt?: string }) => m.role !== 'admin').length}
          </Heading>
        </Card>
      </div>

      {/* Members List */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            {t('org.allMembers')}
          </Heading>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label={t('common.loading')} data-size="lg" />
          </div>
        ) : members.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              {t('org.noMembers')}
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map((member: { id: string; name: string; email: string; role: string; joinedAt?: string }) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  gap: 'var(--ds-spacing-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    color: 'var(--ds-color-accent-text-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                  }}>
                    {member.name?.charAt(0) || member.email?.charAt(0) || '?'}
                  </div>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {member.name || member.email}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {member.email}
                    </Paragraph>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', width: isMobile ? '100%' : 'auto' }}>
                  <Select
                    value={member.role || 'member'}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    style={{ minWidth: '120px' }}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </Select>
                  <Button
                    type="button"
                    variant="secondary"
                    data-size="sm"
                    onClick={() => handleRemove(member.id, member.name || member.email)}
                    disabled={removeMember.isPending}
                    style={{ minHeight: '44px' }}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
