const Discord = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const  mysqlconn = require('../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addevent')
        .setDescription('Add an upcoming event to the calendar')
        .addStringOption(option => option.setName('event_name').setDescription('Name of the event ex: CLoL Finals').setRequired(true))
        .addStringOption(option => option.setName('date').setDescription('MM/DD/YY').setRequired(true))
        .addStringOption(option => option.setName('time').setDescription('HH:MM AM/PM').setRequired(true))
        .addStringOption(option => option.setName('opponent').setDescription('Who are you playing?').setRequired(true))
        .addStringOption(option => option.setName('stream').setDescription('ex: www.twitch.tv/topiEUW, if there is no sream type N/A').setRequired(true))
        .addStringOption(option => option.setName('game_title').setDescription('Which Game')
            .addChoice('LoL', 'LoL')
            .addChoice('RL', 'RL')
            .addChoice('R6', 'R6')
            .addChoice('Valorant', 'Valorant')
            .addChoice('CSGO', 'CSGO')
            .addChoice('COD', 'COD')
            .addChoice('OW', 'OW'))
        .addStringOption(option => option.setName('team_name').setDescription('Which team? ex: Knights Academy')
            .addChoice('Knights', 'Knights')
            .addChoice('Knights Academy', 'Knights Academy')
            .addChoice('Knights Rising', 'Knights Rising')),
    
    async execute(interaction) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('accept')
                    .setLabel('Yes!')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId('reject')
                    .setLabel('No')
                    .setStyle('DANGER')
            );

            //TODO do data validation here for date / time / stream

            let messageContent = `Does this look correct?\`\`\`yaml
Event Name: ${interaction.options.getString('event_name')}
Game Title: ${interaction.options.getString('game_title')}
Team Name: ${interaction.options.getString('team_name')}
Date: ${interaction.options.getString('date')}
Time: ${interaction.options.getString('time')}
Opponent: ${interaction.options.getString('opponent')}
Stream: ${interaction.options.getString('stream')}\`\`\``
        
        await interaction.reply({
            content: messageContent, 
            components: [row]});

        //TODO test this
        const filter = i => {
            return interaction.user.id === i.user.id;
        }

        const collector = interaction.channel.createMessageComponentCollector(filter, {componentType: 'BUTTON', time: 15000});

        collector.on('collect', async i => {
            if (i.customId === 'accept') {

                try {
                    var sql = `INSERT INTO events (name, date, opponent, game, teamname, stream, time) VALUES (?,?,?,?,?,?,?)`;
                    var result = await mysqlconn.pool.execute(
                        sql,
                        [interaction.options.getString('event_name'),
                        interaction.options.getString('date'),
                        interaction.options.getString('opponent'),
                        interaction.options.getString('game_title'),
                        interaction.options.getString('team_name'),
                        interaction.options.getString('stream'),
                        interaction.options.getString('time')], function(err, result) {
                            if (err) throw err;
                            console.log(result);
                            return result;
                        });

                    result = JSON.parse(JSON.stringify(result));
                    
                    row.components[0].setDisabled(true);
                    row.components[1].setDisabled(true);

                    interaction.editReply({
                        components: [row]
                    });

                    i.reply({
                        content: `${messageContent}Submitted!\nEvent ID number: EVN${result[0].insertId}`
                    })

                    collector.stop();
                } catch (error) {
                    console.error(error)
                    console.error("Insertion Failed");
                    i.reply({
                        content: `Insertion failed!`
                    });

                    collector.stop();
                }
            }
            else if(i.customId === 'reject') {
                row.components[0].setDisabled(true);
                row.components[1].setDisabled(true);

                interaction.editReply({
                    components: [row]
                });

                i.reply({
                    content: `${messageContent}Not submitted!`
                })

                collector.stop();
            }
        })
    }
};