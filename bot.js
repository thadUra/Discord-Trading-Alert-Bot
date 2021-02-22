const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.login(process.env.BOT_TOKEN);//BOT_TOKEN is the Client Secret

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {

    if (message.content === 'ping') {
        message.reply('pong');
    }
});