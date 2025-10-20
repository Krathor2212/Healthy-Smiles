const fs = require('fs');
const path = require('path');

function readEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  return content.split(/\r?\n/).reduce((acc, line) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!m) return acc;
    const key = m[1].trim();
    let val = m[2] || '';
    // remove surrounding quotes
    val = val.replace(/^"|"$/g, '');
    acc[key] = val;
    return acc;
  }, {});
}

const env = readEnv();

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      BACKEND_URL: env.BACKEND_URL || process.env.BACKEND_URL || 'http://10.11.146.215:4000',
    },
  };
};
