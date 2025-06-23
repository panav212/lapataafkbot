const express = require('express');
const app = express();
const http = require('http');
const mineflayer = require('mineflayer');
const { GoalFollow } = require('mineflayer-pathfinder').goals;
const pathfinder = require('mineflayer-pathfinder').pathfinder;

app.get('/', (req, res) => res.send('Lapata bot is online'));
app.listen(3000, () => console.log('[+] Web server running on port 3000'));

const BOT_USERNAME = 'ChotuDon';
const BOT_PASSWORD = 'afkpassword123';
const SERVER_HOST = 'fakelapatasmp-kHMS.aternos.me';
const SERVER_PORT = 30562;
const MINECRAFT_VERSION = '1.20.1';

function startBot() {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: MINECRAFT_VERSION,
  });

  bot.loadPlugin(pathfinder);
  let isFollowing = false;
  let hasLoggedIn = false;

  bot.on('login', () => {
    console.log('[+] Bot connected!');
    hasLoggedIn = false;
  });

  bot.on('spawn', () => {
    setTimeout(() => {
      if (!hasLoggedIn) {
        bot.chat(`/login ${BOT_PASSWORD}`);
        bot.once('message', (msg) => {
          if (msg.toString().toLowerCase().includes('register')) {
            bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
            console.log('[*] Sent /register');
          } else {
            console.log('[*] Sent /login');
          }
          hasLoggedIn = true;
        });
      }
    }, 5000);

    antiAFK();
  });

  bot.on('end', () => {
    console.log('[-] Bot disconnected. Reconnecting in 30s...');
    setTimeout(startBot, 30000);
  });

  bot.on('error', err => {
    console.log('[!] Error:', err.message);
  });

  bot.on('playerJoined', (player) => {
    bot.chat(`Welcome to HeroicLand, ${player.username}!`);
  });

  function antiAFK() {
    setInterval(() => {
      if (!isFollowing) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 300);

        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * Math.PI / 4;
        bot.look(yaw, pitch, true);

        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 800);

        bot.setControlState('back', true);
        setTimeout(() => bot.setControlState('back', false), 800);

        console.log('[*] Anti-AFK movement done');
      }
    }, 180000);
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    const args = message.trim().split(" ");
    const command = args[0].toLowerCase();
    const player = bot.players[username]?.entity;

    switch (command) {
      case '!help':
        bot.chat("I'm just an AFK bot. Use !cmds for my powers.");
        break;
      case '!coords':
        const pos = bot.entity.position;
        bot.chat(`Coords: X=${pos.x.toFixed(1)}, Y=${pos.y.toFixed(1)}, Z=${pos.z.toFixed(1)}`);
        break;
      case '!jump':
        bot.chat("Jumping!");
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        break;
      case '!status':
        bot.chat("Online and AFKing!");
        break;
      case '!follow':
        if (player) {
          bot.chat(`Following ${username}`);
          isFollowing = true;
          bot.pathfinder.setGoal(new GoalFollow(player, 2));
        } else {
          bot.chat("Player not found.");
        }
        break;
      case '!stop':
        bot.chat("Stopping actions.");
        isFollowing = false;
        bot.pathfinder.setGoal(null);
        bot.clearControlStates();
        break;
      case '!cmds':
        bot.chat("Commands: !help, !coords, !jump, !status, !follow, !stop");
        break;
      default:
        bot.chat("Unknown command. Try !cmds");
    }
  });
}

startBot();

// Keep-alive server for hosting platforms
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is online');
}).listen(process.env.PORT || 3000);
