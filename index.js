const Discord = require("discord.js");
const YTDL = require("ytdl-core");

const PREFIX = "pm.";

function play(connection, message) {
    var server = servers[message.guild.id];

    server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) play(connection, message);
        else connection.disconnect();
    });
}

var bot = new Discord.Client();

var servers = {};

bot.on("ready", function() {
    bot.user.setActivity("pm.ajuda", {type: "STREAMING", url: "https://www.twitch.tv/doug_dev"});
});

bot.on("message", function(message) {
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(PREFIX)) return;

    var args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0].toLowerCase()) {
        case "ajuda":
            message.channel.send("```Portal Música\n\nComandos:\npm.ouvir <link>\npm.pular\npm.parar```");
        break;
        case "ouvir":
            message.delete();
            if(!message.member.roles.some(r=>["MANAGE_MESSAGES"].includes(r.name)) )
                return message.reply("Desculpe, você não tem permissão para usar isso!");
            
            if (!args[1]) {
                message.channel.send("Por-favor coloque um link!");
                return;
            }

            if (!message.member.voiceChannel) {
                message.channel.send("Você deve está em um canal de Musica!");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
                play(connection, message);
            });
        break;
        case "pular":
            message.delete();
            
            if(!message.member.roles.some(r=>["MANAGE_MESSAGES"].includes(r.name)) )
                return message.reply("Desculpe, você não tem permissão para usar isso!");
            
            var server = servers[message.guild.id];

            if (server.dispatcher) server.dispatcher.end();
        break;
        case "parar":
            message.delete();
            
            if(!message.member.roles.some(r=>["MANAGE_MESSAGES"].includes(r.name)) )
                return message.reply("Desculpe, você não tem permissão para usar isso!");
            
            var server = servers[message.guild.id];

            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        break;
        default:
            message.channel.send(":heavy_multiplication_x: Comando não encontrado!");
        break;
    }
});

bot.login(process.env.TOKEN);
