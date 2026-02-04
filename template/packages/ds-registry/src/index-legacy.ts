/**
 * Legacy exports for backward compatibility
 */

export type RegistryExample = {
  id: string;
  title: string;
  description: string;
  code: string;
};

export const examples: RegistryExample[] = [
  {
    id: 'button-basic',
    title: 'Button - basic',
    description: 'Basic primary action button using Designsystemet Button.',
    code: `import { Button } from '@xaheen/ds';

export function Example() {
  return <Button>Save</Button>;
}`,
  },
  {
    id: 'button-aschild-link',
    title: 'Button - asChild with link',
    description: 'Use asChild to render a Button as an <a> while keeping DS behavior.',
    code: `import { Button } from '@xaheen/ds';

export function Example() {
  return (
    <Button asChild>
      <a href="/dashboard">Go to dashboard</a>
    </Button>
  );
}`,
  },
];

export const rules = {
  imports: [
    "Apps must import UI only from '@xaheen/ds'.",
    "Apps must not import '@digdir/*' packages directly.",
    "Apps must import '@xaheen/ds/styles' exactly once at startup.",
  ],
  styling: [
    'No custom UI components in apps. Compose Designsystemet components.',
    'Avoid custom CSS. If needed, create a DS-approved wrapper in @xaheen/ds, not in apps.',
  ],
};
