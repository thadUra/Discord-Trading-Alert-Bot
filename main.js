// Initializing client and environment
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, analystRole, ownerRole } = require('./config.json');

// Log for marking if online
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

// Event handling example
// client.on('message', (message) => {
//     console.log(`[${message.author.tag}]: ${message.content}`);
//     if (message.content === 'hello') {
//         message.channel.send('hello there');
//     }
// });

// Event handling commands by analysts
client.on('message', (message) => {
    // Checks for prefix or if analyst or owner
    if( !message.content.startsWith(prefix) || !message.member.roles.cache.some(r=>[analystRole, ownerRole].includes(r.name))) return;

    // Different commands loaded here
    const [cmd_name, ...args] = message.content
        .trim()
        .substring(prefix.length)
        .split(/\s+/);
    
    if ( cmd_name === 'trade' ) { // displaying trade banners
        var tradeType, ticker, price, color, positionEmbed, time;
        if( args[0] === 'share' ) {
            if ( args[1].toUpperCase() === 'BTO' ) { 
                tradeType = 'Buy to Open'; 
                color = '#08db04';
            }
            if ( args[1].toUpperCase() === 'STC' ) { 
                tradeType = 'Sell to Close'; 
                color = '#ff0000';
            }
            ticker = args[2].toUpperCase();
            price = args[3];
            time = Date.toLocaleString();
            positionEmbed = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle(`${ticker} - Shares - ${tradeType}`)
                .addFields(
                    { name: 'Ticker', value: ticker, inline: true },
                    { name: 'Price', value: price, inline: true },
                    { name: 'Analysis', value: args.slice(4).join(' ') }
                )
                .setTimestamp();
        }
        // if( args[0] === 'option' ) {

        // }
        // if( args[0] === 'future' ) {

        // }
        message.channel.send(positionEmbed).catch((err) => {
            console.error(err);
            message.channel.send(new Discord.MessageEmbed()
                .setColor('#00ff88').
                setTitle('Error: inputted invalid command or arguments')
                .setDescription('*Deleting in 5 seconds...*')
                ).then(msg => msg.delete({timeout: 5000}));
        });
    }

    if ( cmd_name === 'info' ) { // info on how to use bot commands
        const infoEmbed = new Discord.MessageEmbed()
            .setColor('#00ff88')
            .setTitle('How to use AlertBot')
            .setDescription('**!info** ~ Gives information on how to use bot.');
        client.users.cache.get(message.author.id)
            .send(infoEmbed)
            .catch(console.error);
    }
    message.delete().catch(console.error); // deletes user command
});


// Client login
client.login('ODEzMjk2MzU3Mjk3MjI1NzQ0.YDNPQQ.2vg779Gdvh84QakK0tFGTmHF8kM');