const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

const MAX_ACTIVOS = 2;
const TIEMPO = 30 * 60 * 1000;
const COOLDOWN = 10 * 60 * 1000;

let activos = [];
let espera = [];
let cooldown = new Map();

client.once('ready', () => {
  console.log('Bot encendido');
});

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user.id;

  if (interaction.commandName === "fichar") {

    if (cooldown.has(user)) {
      return interaction.reply("⏳ Estás en cooldown.");
    }

    if (activos.length < MAX_ACTIVOS) {

      activos.push(user);

      setTimeout(() => {
        finalizar(user);
      }, TIEMPO);

      interaction.reply("✅ Has empezado un encargo.");

    } else {

      espera.push(user);
      interaction.reply("🕐 Estás en la cola.");

    }

  }

});

function finalizar(user){

activos = activos.filter(u => u !== user);

cooldown.set(user,true);

setTimeout(()=>{
cooldown.delete(user);
},COOLDOWN);

if(espera.length > 0){

const siguiente = espera.shift();
activos.push(siguiente);

setTimeout(()=>{
finalizar(siguiente);
},TIEMPO);

}

}

client.login(TOKEN);
