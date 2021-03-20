// Initializing client and environment vars
const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, analystRole, ownerRole } = require('./config.json');
const { listAlerts } = require('./alert.json');
const { exit } = require('process');

// Log for marking if online
client.on('ready', () => {
    console.log(`${client.user.tag} has logged in.`);
});

// Event handling commands by analysts
client.on('message', (message) => {
    if( !message.content.startsWith(prefix) || !message.member.roles.cache.some(r=>[analystRole, ownerRole].includes(r.name))) return; // Checks for prefix or if analyst or owner

    const [cmd_name, ...args] = message.content // Parses command arguments into array
        .trim()
        .substring(prefix.length)
        .split(/\s+/);
    
    // JSON data file initialization + embed message variable initialization
    var trade, tradeType, ticker, price, exitPrice, color, positionEmbed, analysisSliceInt, imageLink, optionType, strike, exp, future, alertID = message.id, alertJSON = { listAlerts: [] }, fs = require('fs');
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    if ( cmd_name.toLowerCase() === 'new' || cmd_name.toLowerCase() === 'n' ) { 
        /*  
         *  !<new/n> <share/sh> <BTO/STO> <ticker> <entryPrice> <imageLink:yes/no> <if:yes->imageLink> <analysis>
         */
        if( args[0] === 'share' || args[0] === 'sh' ) { 
            try {
                trade = 'shares';
                color = '#08db04';
                if ( args[1].toUpperCase() === 'BTO' ) { tradeType = 'Buy to Open'; }
                if ( args[1].toUpperCase() === 'STO' ) { tradeType = 'Sell to Open'; }
                ticker = args[2].toUpperCase(); 
                price = args[3];
                if( args[4].toLowerCase() === 'yes' ) {
                    analysisSliceInt = 6;
                    imageLink = args[5];
                }
                else { 
                    analysisSliceInt = 5; 
                    imageLink = '';
                }
                positionEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(`${ticker} - Shares - ${tradeType}`)
                    .addFields(
                        { name: 'Trade ID', value: alertID },
                        { name: 'Ticker', value: ticker, inline: true },
                        { name: 'Purchase Price', value: price, inline: true },
                        { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                    )
                    .setImage(imageLink)
                    .setTimestamp();
            }
            catch (err) {
                console.error(err);
            }
        }
        /*  
         *  !<new/n> <option/op> <BTO/STO> <ticker> <strike> <C/P:optionType> <expiration> <entryPrice> <imageLink:yes/no> <if:yes->imageLink> <analysis>
         */
        if( args[0] === 'option' || args[0] === 'op' ) { 
            try {
                trade = 'option';
                color = '#08db04';
                if ( args[1].toUpperCase() === 'BTO' ) { tradeType = 'Buy to Open'; }
                if ( args[1].toUpperCase() === 'STO' ) { tradeType = 'Sell to Open'; }
                ticker = args[2].toUpperCase(); 
                strike = args[3];
                if ( args[4].toUpperCase() === 'C' ) { optionType = 'Call'; }
                if ( args[4].toUpperCase() === 'P' ) { optionType = 'Put'; }
                exp = args[5];
                price = args[6];
                if( args[7].toLowerCase() === 'yes' ) {
                    analysisSliceInt = 9;
                    imageLink = args[8];
                }
                else { 
                    analysisSliceInt = 8; 
                    imageLink = '';
                }
                positionEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(`${ticker} - Option - ${optionType} - ${tradeType}`)
                    .addFields(
                        { name: 'Trade ID', value: alertID },
                        { name: 'Ticker', value: ticker, inline: true },
                        { name: 'Strike', value: strike, inline: true },
                        { name: 'Expiration', value: exp, inline: true },
                        { name: 'Purchase Price', value: price, inline: true },
                        { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                    )
                    .setImage(imageLink)
                    .setTimestamp();
            }
            catch (err) {
                console.error(err);
            }
        }
        /*  
         *  !<new/n> <future/fu> <BTO/STO> <ticker> <entryPrice> <imageLink:yes/no> <if:yes->imageLink> <analysis>
         */
        if( args[0] === 'future' || args[0] === 'fu' ) { 
            try {
                trade = 'future';
                color = '#08db04';
                if ( args[1].toUpperCase() === 'BTO' ) { tradeType = 'Buy to Open'; }
                if ( args[1].toUpperCase() === 'STO' ) { tradeType = 'Sell to Open'; }
                ticker = args[2].toUpperCase();
                future = ticker; 
                price = args[3];
                if( args[4].toLowerCase() === 'yes' ) {
                    analysisSliceInt = 6;
                    imageLink = args[5];
                }
                else { 
                    analysisSliceInt = 5; 
                    imageLink = '';
                }
                positionEmbed = new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle(`${ticker} - Futures - ${tradeType}`)
                    .addFields(
                        { name: 'Trade ID', value: alertID },
                        { name: 'Ticker', value: ticker, inline: true },
                        { name: 'Entry Price', value: price, inline: true },
                        { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                    )
                    .setImage(imageLink)
                    .setTimestamp();
            }
            catch (err) {
                console.error(err);
            }
        }

        // Sending embed message after initialization
        message.channel.send(positionEmbed) 
            .then(sent => {
                // Alert stored in JSON data file
                try {
                    alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
                    console.log(fs.readFileSync('./alert.json', 'utf8'));
                    message.channel.send('@here').then( sentHere => {
                        alertJSON.listAlerts.push(
                            {
                                alertID: alertID,
                                botMessageID: sent.id,
                                tagID: sentHere.id,
                                trade: trade,
                                tradeType: tradeType,
                                ticker: ticker,
                                optionType: optionType,
                                strike: strike,
                                expiration: exp,
                                future: future,
                                entryPrice: price,
                                analyst: message.member.id
                            }
                        );
                        var json = JSON.stringify(alertJSON); 
                        fs.writeFile('alert.json', json, () => {} ); 
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .catch((err) => {
                console.error(err);
                message.channel.send(new Discord.MessageEmbed()
                    .setColor('#00ff88')
                    .setTitle('Error: inputted invalid command or arguments')
                    .setDescription('*Deleting in 5 seconds...*'))
                        .then(msg => msg.delete({timeout: 5000}));
            }
        );
    }

    if ( cmd_name.toLowerCase() === 'close' || cmd_name.toLowerCase() === 'c' ) {
        /*  
         *  !<close/c> <id> <exitPrice> <imageLink:yes/no> <if:yes->imageLink> <analysis>
         */
        try {
            alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
            var idFound = false, profit;
            for( var i = 0; i < alertJSON.listAlerts.length; i++ ) {
                if ( alertJSON.listAlerts[i].alertID === args[0] ) {
                    idFound = true;
                    color = '#de0b0b';
                    if ( alertJSON.listAlerts[i].tradeType === 'Sell to Open' ) { tradeType = 'Buy to Close'; }
                    if ( alertJSON.listAlerts[i].tradeType === 'Buy to Open' ) { tradeType = 'Sell to Close'; }
                    ticker = alertJSON.listAlerts[i].ticker; 
                    price = alertJSON.listAlerts[i].entryPrice;
                    trade = alertJSON.listAlerts[i].trade;
                    exitPrice = args[1];
                    if( args[2].toLowerCase() === 'yes' ) {
                        analysisSliceInt = 4;
                        imageLink = args[3];
                    }
                    else { 
                        analysisSliceInt = 3; 
                        imageLink = '';
                    }
                    // Embed initialization
                    if ( alertJSON.listAlerts[i].trade === 'shares' ) {
                        profit = ((exitPrice/price-1)*100).toFixed(2);
                        positionEmbed = new Discord.MessageEmbed()
                            .setColor(color)
                            .setTitle(`${ticker} - Shares - ${tradeType}`)
                            .setDescription(`**Trade ID:** ${alertID}`)
                            .addFields(
                                { name: 'Ticker', value: ticker },
                                { name: 'Purchase Price', value: price, inline: true },
                                { name: 'Close Price', value: exitPrice, inline: true },
                                { name: 'P/L %', value: `${profit}%`, inline: true },
                                { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                            )
                            .setImage(imageLink)
                            .setTimestamp();
                        profit = exitPrice-price;
                    }
                    if ( alertJSON.listAlerts[i].trade === 'option' ) {
                        strike = alertJSON.listAlerts[i].strike;
                        exp = alertJSON.listAlerts[i].expiration;
                        optionType = alertJSON.listAlerts[i].optionType;
                        profit = ((exitPrice/price-1)*100).toFixed(2);
                        positionEmbed = new Discord.MessageEmbed()
                            .setColor(color)
                            .setTitle(`${ticker} - Option - ${optionType} - ${tradeType}`)
                            .addFields(
                                { name: 'Trade ID', value: alertID },
                                { name: 'Ticker', value: ticker, inline: true },
                                { name: 'Strike', value: strike, inline: true },
                                { name: 'Expiration', value: exp, inline: true },
                                { name: 'Purchase Price', value: price, inline: true },
                                { name: 'Close Price', value: exitPrice, inline: true },
                                { name: 'P/L %', value: `${profit}%`, inline: true },
                                { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                            )
                            .setImage(imageLink)
                            .setTimestamp();
                        profit = (exitPrice - price) *100;
                    }
                    if ( alertJSON.listAlerts[i].trade === 'future' ) {
                        var profitMultiplier, loss;
                        if ( alertJSON.listAlerts[i].future === 'MES' ) { profitMultiplier = 5; }
                        if ( alertJSON.listAlerts[i].future === 'ES' ) { profitMultiplier = 50; }
                        if ( tradeType === 'Sell to Close' ) { loss = 1; }
                        else { loss = -1; }
                        profit = profitMultiplier*(exitPrice-price)*loss;
                        positionEmbed = new Discord.MessageEmbed()
                            .setColor(color)
                            .setTitle(`${ticker} - Futures - ${tradeType}`)
                            .setDescription(`**Trade ID:** ${alertID}`)
                            .addFields(
                                { name: 'Ticker', value: ticker },
                                { name: 'Entry Price', value: price, inline: true },
                                { name: 'Close Price', value: exitPrice, inline: true },
                                { name: 'P/L', value: (profitMultiplier*(exitPrice-price)*loss), inline: true },
                                { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                            )
                            .setImage(imageLink)
                            .setTimestamp();
                    }

                    // Sending embed message
                    message.channel.send(positionEmbed) 
                        .then(sent => {
                            // Alert stored in JSON data file
                            try {
                                
                                message.channel.send('@here').then( sentHere => {
                                    alertJSON.listAlerts.push(
                                        {
                                            alertID: alertID,
                                            botMessageID: sent.id,
                                            tagID: sentHere.id,
                                            trade: trade,
                                            tradeType: tradeType,
                                            ticker: ticker,
                                            optionType: optionType,
                                            strike: strike,
                                            expiration: exp,
                                            future: future,
                                            entryPrice: price,
                                            profit: profit,
                                            analysis: args.slice(analysisSliceInt).join(' '), 
                                            date: datetime,
                                            analyst: message.member.id
                                        }
                                    );
                                    var json = JSON.stringify(alertJSON); 
                                    fs.writeFile('alert.json', json, () => {} ); 
                                });
                            } catch (err) {
                                console.error(err);
                            }
                            if( profit > 80 ) { sent.react('🔥'); sent.react('🤑'); sent.react('😳'); }
                            else if( profit > 50 ) { sent.react('🔥'); }
                            else if( profit > 0 ) { sent.react('💸'); }
                        })
                        .catch((err) => {
                            console.error(err);
                            message.channel.send(new Discord.MessageEmbed()
                                .setColor('#00ff88')
                                .setTitle('Error: inputted invalid command or arguments')
                                .setDescription('*Deleting in 5 seconds...*'))
                                .then(msg => msg.delete({timeout: 5000}));
                        }
                    );
                }
            }
            if (idFound === false) {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor('#00ff88')
                    .setTitle('Error: no open trade for that ID found')
                    .setDescription('*Deleting in 5 seconds...*'))
                    .then(msg => msg.delete({timeout: 5000}));
            }
            var json = JSON.stringify(alertJSON); 
            fs.writeFile('alert.json', json, () => {} ); 
        } catch (err) {
            console.error(err);
            message.channel.send(new Discord.MessageEmbed()
                .setColor('#00ff88')
                .setTitle('Error: inputted invalid command or arguments')
                .setDescription('*Deleting in 5 seconds...*'))
                .then(msg => msg.delete({timeout: 5000}));
        }
    }

    if ( cmd_name.toLowerCase() === 'scale' || cmd_name.toLowerCase() === 'sc' ) { 
        /*  
         *  !<scale/sc> <trade ID> <scalePrice> <averagePrice> <imageLink:yes/no> <if:yes->imageLink> <analysis>
         */
        // Updating JSON data file with deleted trade
        try {
            alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
            console.log(fs.readFileSync('./alert.json', 'utf8'));
            for( var i = 0; i < alertJSON.listAlerts.length; i++ ) {
                if ( alertJSON.listAlerts[i].alertID === args[0] ) {
                    if( alertJSON.listAlerts[i].trade === 'shares' ) { 
                        try {
                            trade = 'shares';
                            color = '#08db04';
                            tradeType = alertJSON.listAlerts[i].tradeType;
                            ticker = alertJSON.listAlerts[i].ticker;
                            var scalePrice = args[1];
                            price = args[2];
                            if( args[3].toLowerCase() === 'yes' ) {
                                analysisSliceInt = 5;
                                imageLink = args[4];
                            }
                            else { 
                                analysisSliceInt = 4; 
                                imageLink = '';
                            }
                            positionEmbed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setTitle(`${ticker} - Shares - ${tradeType}`)
                                .addFields(
                                    { name: 'Trade ID', value: alertID },
                                    { name: 'Ticker', value: ticker, inline: true },
                                    { name: 'Scale Price', value: scalePrice, inline: true },
                                    { name: 'Average Price', value: price, inline: true },
                                    { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                                )
                                .setImage(imageLink)
                                .setTimestamp();
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    if( alertJSON.listAlerts[i].trade === 'option' ) { 
                        try {
                            trade = 'option';
                            color = '#08db04';
                            tradeType = alertJSON.listAlerts[i].tradeType;
                            ticker = alertJSON.listAlerts[i].ticker;
                            var scalePrice = args[1];
                            price = args[2];
                            optionType = alertJSON.listAlerts[i].optionType;
                            strike = alertJSON.listAlerts[i].strike;
                            exp = alertJSON.listAlerts[i].expiration;
                            if( args[3].toLowerCase() === 'yes' ) {
                                analysisSliceInt = 5;
                                imageLink = args[4];
                            }
                            else { 
                                analysisSliceInt = 4; 
                                imageLink = '';
                            }
                            positionEmbed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setTitle(`${ticker} - Option - ${optionType} - ${tradeType}`)
                                .addFields(
                                    { name: 'Trade ID', value: alertID },
                                    { name: 'Ticker', value: ticker, inline: true },
                                    { name: 'Strike', value: strike, inline: true },
                                    { name: 'Expiration', value: exp, inline: true },
                                    { name: 'Scale Price', value: scalePrice, inline: true },
                                    { name: 'Average Price', value: price, inline: true },
                                    { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                                )
                                .setImage(imageLink)
                                .setTimestamp();
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                    if( alertJSON.listAlerts[i].trade === 'future' ) { 
                        try {
                            color = '#08db04';
                            trade = 'future';
                            tradeType = alertJSON.listAlerts[i].tradeType;
                            ticker = alertJSON.listAlerts[i].ticker;
                            future = alertJSON.listAlerts[i].future;
                            var scalePrice = args[1];
                            price = args[2];
                            if( args[3].toLowerCase() === 'yes' ) {
                                analysisSliceInt = 5;
                                imageLink = args[4];
                            }
                            else { 
                                analysisSliceInt = 4; 
                                imageLink = '';
                            }
                            positionEmbed = new Discord.MessageEmbed()
                                .setColor(color)
                                .setTitle(`${ticker} - Futures - ${tradeType}`)
                                .addFields(
                                    { name: 'Trade ID', value: alertID },
                                    { name: 'Ticker', value: ticker, inline: true },
                                    { name: 'Scale Price', value: scalePrice, inline: true },
                                    { name: 'Average Price', value: price, inline: true },
                                    { name: 'Analysis', value: args.slice(analysisSliceInt).join(' ') }
                                )
                                .setImage(imageLink)
                                .setTimestamp();
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
            
                    // Sending embed message after initialization
                    message.channel.send(positionEmbed) 
                        .then(sent => {
                            // Alert stored in JSON data file
                            try {
                                alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
                                console.log(fs.readFileSync('./alert.json', 'utf8'));
                                message.channel.send('@here').then( sentHere => {
                                    
                                    alertJSON.listAlerts.push(
                                        {
                                            alertID: alertID,
                                            botMessageID: sent.id,
                                            tagID: sentHere.id,
                                            trade: trade,
                                            tradeType: tradeType,
                                            ticker: ticker,
                                            optionType: optionType,
                                            strike: strike,
                                            expiration: exp,
                                            future: future,
                                            entryPrice: price,
                                            analyst: message.member.id
                                        }
                                    );

                                    var json = JSON.stringify(alertJSON); 
                                    fs.writeFile('alert.json', json, () => {} ); 
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            message.channel.send(new Discord.MessageEmbed()
                                .setColor('#00ff88')
                                .setTitle('Error: inputted invalid command or arguments')
                                .setDescription('*Deleting in 5 seconds...*'))
                                    .then(msg => msg.delete({timeout: 5000}));
                        }
                    );


                }
            }
            var json = JSON.stringify(alertJSON); 
            fs.writeFile('alert.json', json, () => {} ); 
        } catch (err) {
            console.error(err);
        }
    }

    if ( cmd_name.toLowerCase() === 'delete' || cmd_name.toLowerCase() === 'del' ) { 
        // deletes bot message
        // Updating JSON data file with deleted trade
        try {
            alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
            console.log(fs.readFileSync('./alert.json', 'utf8'));
            for( var i = 0; i < alertJSON.listAlerts.length; i++ ) {
                if ( alertJSON.listAlerts[i].alertID === args[0] ) {
                    client.channels.cache.get(message.channel.id).messages.fetch(alertJSON.listAlerts[i].botMessageID)
                        .then(message => message.delete())
                        .catch((err) => {
                            console.error(err);
                            message.channel.send(new Discord.MessageEmbed()
                                .setColor('#00ff88')
                                .setTitle('Error: inputted invalid command or arguments')
                                .setDescription('*Deleting in 5 seconds...*'))
                                .then(msg => msg.delete({timeout: 5000}));
                    });
                    client.channels.cache.get(message.channel.id).messages.fetch(alertJSON.listAlerts[i].tagID)
                        .then(message => message.delete());
                    alertJSON.listAlerts.splice(i,1);
                }
            }
            var json = JSON.stringify(alertJSON); 
            fs.writeFile('alert.json', json, () => {} ); 
        } catch (err) {
            console.error(err);
        }
    }

    if ( cmd_name.toLowerCase() === 'wipe' || cmd_name.toLowerCase() === 'wi' ) { 
        // hard wipes bot message from message ID
        try {
            client.channels.cache.get(message.channel.id).messages.fetch(args[0])
                .then(message => message.delete())
                .catch((err) => {
                    console.error(err);
                    message.channel.send(new Discord.MessageEmbed()
                        .setColor('#00ff88')
                        .setTitle('Error: inputted invalid command or arguments')
                        .setDescription('*Deleting in 5 seconds...*'))
                        .then(msg => msg.delete({timeout: 5000}));
                    });
            console.log(`Wiped out comment by ID: ${args[0]}`)
        } catch (err) {
            console.error(err);
        }
    }

    if ( cmd_name.toLowerCase() === 'list' || cmd_name.toLowerCase() === 'li' ) { 
        // Lists all trades in console for puny database management
        try {
            alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
            console.log(fs.readFileSync('./alert.json', 'utf8'));
            var json = JSON.stringify(alertJSON); 
            fs.writeFile('alert.json', json, () => {} ); 
        } catch (err) {
            console.error(err);
        }
    }

    if ( cmd_name.toLowerCase() === 'file' || cmd_name.toLowerCase() === 'fi' ) {
        try {
            message.channel.send('**~ List of Trades via JSON ~**', { files: ['./alert.json'] });
        } catch (err) {
            console.error(err);
        }
    }
    
    if ( cmd_name.toLowerCase() === 'recap' || cmd_name.toLowerCase() === 're' ) {
        /*  
         *  !<recap/re> <analysis>
         */
        try {
            color = '#34ebab';
            let data = [0], labels = [',']
            var chart = 'https://quickchart.io/chart/render/zm-8704c5ef-a26c-4253-ab44-c2024dc69721?labels=';
            alertJSON = JSON.parse(fs.readFileSync('./alert.json', 'utf8'));
            console.log(fs.readFileSync('./alert.json', 'utf8'));
            for( var i = 0; i < alertJSON.listAlerts.length; i++ ) {
                if( message.member.id === alertJSON.listAlerts[i].analyst && alertJSON.listAlerts[i].date === datetime ) {
                    data.push(alertJSON.listAlerts[i].profit+data[data.length-1]);
                    labels.push(',');
                }
            }
            for( var i = 0; i < data.length-1; i++ ) { chart += labels[i]; }
            chart += '&data1=';
            for( var i = 0; i < data.length-1; i++ ) { chart += data[i] + ','; }
            chart += data[data.length-1];
            var json = JSON.stringify(alertJSON); 
            fs.writeFile('alert.json', json, () => {} ); 
            positionEmbed = new Discord.MessageEmbed()
                        .setColor(color)
                        .setTitle(`**Daily Recap:**`)
                        .setImage(chart)
                        .setDescription(args.slice(0).join(' '))
                        .setTimestamp();

            message.channel.send(positionEmbed) 
                .catch((err) => {
                    console.error(err);
                    message.channel.send(new Discord.MessageEmbed()
                        .setColor('#00ff88')
                        .setTitle('Error: inputted invalid command or arguments')
                        .setDescription('*Deleting in 5 seconds...*'))
                            .then(msg => msg.delete({timeout: 5000}));
                }
            );
            message.channel.send('@here');
        } catch (err) {
            console.error(err);
            message.channel.send(new Discord.MessageEmbed()
                        .setColor('#00ff88')
                        .setTitle('Error: inputted invalid command or arguments')
                        .setDescription('*Deleting in 5 seconds...*'))
                            .then(msg => msg.delete({timeout: 5000}));
        }
    }

    message.delete().catch(console.error); // deletes user command after everything
});

// Client login
client.login(process.env.BOT_TOKEN);