import Discord, { MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { Command } from "../../index"
import { successColor } from "../../config.json"

const command: Command = {
    name: "test",
    description: "Test Command",
    allowDM: true,
    channelWhitelist: ["830874699495374869"], // bots staff-bots bot-development admin-bots
    async execute(interaction: Discord.CommandInteraction) {
        const row = new MessageActionRow().addComponents(new MessageButton().setCustomID("refresh_btn").setStyle("SUCCESS").setLabel("Refresh"))

        const embed = new MessageEmbed().setDescription(`Client ping: ${interaction.client.ws.ping}`).setColor(successColor)
        await interaction.reply({ ephemeral: true, embeds: [embed], components: [row] })
    }
}

export default command
