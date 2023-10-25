const Discord = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fix')
        .setDescription('Fix a twitter or X link')
        .addStringOption(option => option.setName('link').setDescription('Paste your broken twitter/X link here').setRequired(true)),

    async execute(interaction) {
        let link = interaction.options.getString('link');
        let newLink = "You must use a twitter or x link!";
        let public = true;

        if(link.includes('x.com')) {
            newLink = link.replace('x.com', 'fixupx.com');
            public = false;
        }
        
        if(link.includes('twitter.com')) {
            newLink = link.replace('twitter.com', 'fxtwitter.com');
            public = false;
        }

        await interaction.reply({content: newLink, ephemeral: public });
    }
}