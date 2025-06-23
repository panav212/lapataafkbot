const express = require('express');
const app = express();
const http = require('http');
const mineflayer = require('mineflayer');
const { GoalFollow } = require('mineflayer-pathfinder').goals;
const pathfinder = require('mineflayer-pathfinder').pathfinder;

// Bot config
const BOT_USERNAME = 'ChotuDon';
const BOT_PASSWORD = 'afkpassword123'; // Set once, works forever
const SERVER_HOST = 'fakelapatasmp-kHMS.aternos.me';
const SERVER_PORT = 30562;
const MC_VERSION = '1.20.1';

// Web keep-alive
app.get('/', (req, res) => res.send('Lapata bot is online'));
app.listen(3000, () => console.log('[+] Web server running on port 3000'));

function startBot() {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: MC_VERSION
  });

  bot.loadPlugin(pathfinder);
  let isFollowing = false;
  let registered = false;

  bot.on('login', () => {
    console.log('[+] Bot connected to server!');
  });

  // Handle AuthMe login or register logic
  bot.once('spawn', () => {
    setTimeout(() => {
      bot.chat(`/login ${BOT_PASSWORD}`);
      console.log('[*] Sent /login');

      // Wait 3 sec, see if login failed (still stuck at spawn)
      setTimeout(() => {
        if (!bot.health || bot.health === 0 || bot.food === 0) {
          // Might be stuck at login prompt
          bot.chat(`/register ${BOT_PASSWORD} ${BOT_PASSWORD}`);
          console.log('[*] Sent /register (likely first time)');
          registered = true;
        } else {
          console.log('[+] Login successful');
        }
      }, 3000);
    }, 5000);

    // Start AFK loop after login/register
    setTimeout(antiAFK, 10000);
  });

  bot.on('end', () => {
    console.log('[-] Bot disconnected. Reconnecting in 30 seconds...');
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
        bot.chat("Use !cmds to see my commands.");
        break;

      case '!coords':
        const pos = bot.entity.position;
        bot.chat(`My coords: X=${pos.x.toFixed(1)}, Y=${pos.y.toFixed(1)}, Z=${pos.z.toFixed(1)}`);
        break;

      case '!jump':
        bot.chat("Jumping!");
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        break;

      case '!status':
        bot.chat("I'm online and AFKing like a boss");
        break;

      case '!dance':
        bot.chat("Dancing!");
        let spinCount = 5;
        function spin() {
          if (spinCount > 0) {
            bot.look(bot.entity.yaw + Math.PI / 2, 0, true);
            spinCount--;
            setTimeout(spin, 500);
          }
        }
        spin();
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

      case '!twerk':
        bot.chat("Twerking mode ON!");
        let twerkCount = 10;
        function twerk() {
          if (twerkCount > 0) {
            bot.setControlState('sneak', true);
            setTimeout(() => bot.setControlState('sneak', false), 300);
            twerkCount--;
            setTimeout(twerk, 600);
          }
        }
        twerk();
        break;

      case '!attack':
        if (player) {
          bot.chat(`Attacking ${username}!`);
          bot.attack(player);
        } else {
          bot.chat("Player not found.");
        }
        break;

      case '!joke':
        const jokes = [
          "Why did the creeper break up with his girlfriend? Because she blew him away!",
          "What is a skeleton's least favorite room? The living room.",
          "Why don’t Endermen use cell phones? Because they hate being touched!",
        ];
        bot.chat(jokes[Math.floor(Math.random() * jokes.length)]);
        break;

      case '!say':
        const msg = args.slice(1).join(" ");
        if (msg) {
          bot.chat(msg);
        } else {
          bot.chat("You need to type a message!");
        }
        break;

      case '!sleep':
        const bed = bot.findBlock({ matching: block => bot.isABed(block) });
        if (bed) {
          bot.sleep(bed, (err) => {
            if (err) bot.chat("Can't sleep now.");
            else bot.chat("Goodnight!");
          });
        } else {
          bot.chat("No bed nearby!");
        }
        break;

      case '!stop':
        bot.chat("Stopping all actions. Returning to AFK mode.");
        isFollowing = false;
        bot.pathfinder.setGoal(null);
        bot.clearControlStates();
        break;

      case '!cmds':
        bot.chat("Available commands: !help, !coords, !jump, !status, !dance, !follow, !twerk, !attack, !joke, !say, !sleep, !stop");
        break;

      default:
        bot.chat("Unknown command! Type !cmds for a list of commands.");
    }
  });
}

startBot();

// Keep-alive server
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is online');
}).listen(process.env.PORT || 3000);
