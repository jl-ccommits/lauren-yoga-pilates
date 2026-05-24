import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2] || 'build';
const derivedDataPath = '/tmp/namast-app-derived-data';
const appPath = `${derivedDataPath}/Build/Products/Debug-iphonesimulator/App.app`;
const bundleId = 'com.laurenlandman.routinetracker';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (!options.allowFailure && result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getBootedSimulatorId() {
  const result = spawnSync('xcrun', ['simctl', 'list', 'devices', 'booted', '--json'], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    console.error(result.stderr || 'Unable to list booted iOS simulators.');
    process.exit(result.status ?? 1);
  }

  const payload = JSON.parse(result.stdout);
  const devices = Object.values(payload.devices || {}).flat();
  const booted = devices.find(device => device.state === 'Booted' && device.name.includes('iPhone'))
    || devices.find(device => device.state === 'Booted');

  if (!booted) {
    console.error('No booted iOS simulator found. Open an iPhone simulator, then try again.');
    process.exit(1);
  }

  return booted.udid;
}

if (!['build', 'run'].includes(mode)) {
  console.error('Usage: node scripts/ios-sim.mjs [build|run]');
  process.exit(1);
}

const simulatorId = getBootedSimulatorId();

rmSync(derivedDataPath, { recursive: true, force: true });

run('npm', ['run', 'cap:sync']);
run('xcodebuild', [
  '-workspace',
  'ios/App/App.xcworkspace',
  '-scheme',
  'App',
  '-configuration',
  'Debug',
  '-destination',
  `platform=iOS Simulator,id=${simulatorId}`,
  '-derivedDataPath',
  derivedDataPath,
  'build',
]);

if (mode === 'run') {
  run('xcrun', ['simctl', 'terminate', simulatorId, bundleId], { allowFailure: true });
  run('xcrun', ['simctl', 'install', simulatorId, appPath]);
  run('xcrun', ['simctl', 'launch', simulatorId, bundleId]);
}
