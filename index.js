const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, 'config.json');
const LOG_PATH = path.resolve(__dirname, 'activity.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(line.trim());
  try { fs.appendFileSync(LOG_PATH, line); } catch(e){}
}

let cfg;
try {
  cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (e) {
  console.error('Cannot read config.json:', e);
  process.exit(1);
}

function startAll() {
  cfg.bots.forEach((bconf, idx) => startBot(bconf, idx));
}

function startBot(bconf, idx) {
  const bot = mineflayer.createBot({
    host: cfg.server.host,
    port: cfg.server.port,
    username: bconf.username,
    version: cfg.server.version || '1.21.8',
  });

  bot.once('spawn', () => {
    log(`${bconf.username} spawned`);
    setTimeout(() => bot.chat(bconf.registerCmd), 1000);
    setTimeout(() => bot.chat(bconf.loginCmd), 2000);
  });

  bot.on('end', () => {
    log(`${bconf.username} disconnected, retry in 10s`);
    setTimeout(() => startBot(bconf, idx), 10000);
  });

  bot.on('error', err => log(`${bconf.username} error: ${err.message}`));
}

startAll();
