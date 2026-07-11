// HermesStore — Start the APP's own Hermes (not the user's global one)
// Uses: hermes-agent/.venv/Scripts/hermes.exe with HERMES_HOME=.hermes

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const HERMES_PORT = 8642;
const PROJECT_DIR = path.resolve(__dirname, '..');
const HERMES_VENV = path.join(PROJECT_DIR, 'hermes-agent', '.venv', 'Scripts', 'hermes.exe');
const HERMES_HOME = path.join(PROJECT_DIR, '.hermes');

function waitForHermes(timeout = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(`http://127.0.0.1:${HERMES_PORT}/health`, (res) => {
        if (res.statusCode === 200) resolve(true);
        else if (Date.now() - start < timeout) setTimeout(check, 1000);
        else reject(new Error('Hermes failed to start'));
      }).on('error', () => {
        if (Date.now() - start < timeout) setTimeout(check, 1000);
        else reject(new Error('Hermes failed to start'));
      });
    };
    check();
  });
}

async function startHermes() {
  console.log('🤖 Starting HermesStore agent (project-local)...');
  console.log(`   Binary: ${HERMES_VENV}`);
  console.log(`   Home:   ${HERMES_HOME}`);
  console.log(`   Port:   ${HERMES_PORT}`);

  const hermes = spawn(HERMES_VENV, ['gateway'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      HERMES_HOME: HERMES_HOME,
      PATH: path.join(PROJECT_DIR, 'hermes-agent', '.venv', 'Scripts') + ';' + process.env.PATH,
    },
  });

  hermes.stdout.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`  [hermes] ${msg}`);
  });

  hermes.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`  [hermes] ${msg}`);
  });

  hermes.on('exit', (code) => {
    console.log(`  [hermes] Exited with code ${code}`);
  });

  try {
    await waitForHermes();
    console.log('✅ HermesStore agent ready on port ' + HERMES_PORT);
  } catch (err) {
    console.error('❌ Failed to start Hermes:', err.message);
    process.exit(1);
  }

  process.on('SIGINT', () => { hermes.kill(); process.exit(0); });
  process.on('SIGTERM', () => { hermes.kill(); process.exit(0); });

  return hermes;
}

module.exports = { startHermes };

if (require.main === module) {
  startHermes().then(() => {
    console.log('Hermes is running. Press Ctrl+C to stop.');
  });
}
