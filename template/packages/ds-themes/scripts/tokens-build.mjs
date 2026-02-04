import { execSync } from 'node:child_process';

// Builds CSS themes into packages/ds-themes/themes/*.css
// Requires: npm i -D @digdir/designsystemet

execSync('npx @digdir/designsystemet@latest tokens build --config designsystemet.config.json', {
  stdio: 'inherit',
});
