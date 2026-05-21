const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

console.log(isWatch ? 'Watching Tailwind CSS...' : 'Building Tailwind CSS...');

// Output files
const outputs = [
  './app/css/tailwind-out.css',
  './careers/tailwind-out.css',
  './dialer/tailwind-out.css',
  './share/tailwind-out.css'
];

// Ensure parent directories exist
outputs.forEach(output => {
  const dir = path.dirname(output);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Run Tailwind compiler
const primaryOutput = outputs[0];
const cmd = `npx tailwindcss -i ./src/input.css -o ${primaryOutput} ${isWatch ? '--watch' : '--minify'}`;

try {
  if (isWatch) {
    // Watch mode: run compilation
    execSync(cmd, { stdio: 'inherit' });
  } else {
    // Build mode: run once and copy to all destinations
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Successfully compiled primary style: ${primaryOutput}`);
    
    // Distribute to other locations
    for (let i = 1; i < outputs.length; i++) {
      fs.copyFileSync(primaryOutput, outputs[i]);
      console.log(`Copied CSS to: ${outputs[i]}`);
    }
    console.log('Tailwind compilation complete.');
  }
} catch (err) {
  console.error('Tailwind compilation failed:', err);
  process.exit(1);
}
