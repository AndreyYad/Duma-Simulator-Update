const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'presets');
const output = path.join(dir, 'catalog.js');
const files = fs.readdirSync(dir, { withFileTypes: true })
  .filter(entry => entry.isFile() && /\.json$/i.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));
const names = new Set();
const presets = files.map(file => {
  const filePath = path.join(dir, file.name);
  let config;
  try {
    config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${file.name}: invalid JSON (${error.message})`);
  }
  if (!config || Array.isArray(config) || typeof config !== 'object' ||
      !Array.isArray(config.topics) || !config.topics.length ||
      !Array.isArray(config.fams) || config.fams.length < 2 ||
      !Array.isArray(config.qs)) {
    throw new Error(`${file.name}: expected a test configuration with topics, at least two fams, and qs arrays`);
  }
  const name = String(config.name || path.basename(file.name, path.extname(file.name))).trim();
  if (!name) throw new Error(`${file.name}: preset name cannot be empty`);
  if (names.has(name)) throw new Error(`${file.name}: duplicate preset name "${name}"`);
  names.add(name);
  config.name = name;
  return { n: name, c: config };
});

fs.writeFileSync(output, `window.EXTRA_PRESETS = ${JSON.stringify(presets)};\n`);
console.log(`Built preset catalog with ${presets.length} preset(s).`);
