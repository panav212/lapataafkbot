const mineflayer = require('mineflayer');
const { GoalFollow } = require('mineflayer-pathfinder').goals;
const pathfinder = require('mineflayer-pathfinder').pathfinder;
const http = require('http');  // Import HTTP module

function startBot() {
  const bot = mineflayer.createBot({
    host: 'escapeeternity.aternos.me',  
    port: 30464,
    username: 'GodBhaiya',             
    version: '1.21.4'
  });

  bot.loadPlugin(pathfinder);

  let isFollowing = false; // Track if the bot is following someone

  bot.on('login', () => {
    console.log('[+] Bot connected to server!');
    antiAFK();
  });

  bot.on('end', () => {
    console.log('[-] Bot disconnected. Reconnecting in 30 seconds...');
    setTimeout(startBot, 30000);  
  });

  bot.on('error', err => {
    console.log('[!] Error:', err.message);
  });

  bot.on('playerJoined', (player) => {
    // Send a welcome message when a player joins the server
    bot.chat(`Welcome to HeroicLand, ${player.username}!`);
  });

  function antiAFK() {
    setInterval(() => {
      if (!isFollowing) {  // Only AFK if not following a player
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
        bot.chat("Hell nah nigga I am not gonna help you");
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

// Start the bot
startBot();

// Simple HTTP server for Render health checks
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(process.env.PORT || 3000);
