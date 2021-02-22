const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {

    if (message.content === 'ping') {
        message.reply('pong');
    }
});

client.login(process.env.TOKEN);//BOT_TOKEN is the Client Secret