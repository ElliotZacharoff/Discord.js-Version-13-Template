import Discord, { Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { Command } from "../../index"
import { successColor, errorColor } from "../../config.json"

const command: Command = {
    name: "ping",
    description: "Relays the current client ping",
    allowDM: true,
    channelWhitelist: ["830874699495374869"],
    async execute(interaction: Discord.CommandInteraction) {
        const row = new MessageActionRow().addComponents(new MessageButton().setCustomID("refresh_btn").setStyle("SUCCESS").setLabel("Refresh"))

        const embed = new MessageEmbed().setDescription(`Client ping: ${interaction.client.ws.ping}`).setColor(successColor)

        if (interaction.client.ws.ping > 275) embed.setColor(errorColor)
        await interaction.reply({ embeds: [embed], components: [row] })
        const message = await interaction.fetchReply()
        const msg = <Message>message // Type casting the general type

        // @ts-ignore
        const filter = m => m.customID === "refresh_btn"
        /** For some reason this line about throws a type error even though it works fine */

        const collector = msg.createMessageComponentInteractionCollector(filter, { time: 1000 * 300 }) // Disables refreshing after 5 minutes
        collector.on("collect", async i => {
            if (i.customID === "refresh_btn") {
                setTimeout(async () => {
                    const refreshedEmbed = new MessageEmbed()
                        .setDescription(`Client ping: ${interaction.client.ws.ping}`)
                        .setFooter(`Refreshed...`)
                        .setColor(successColor)
                    if (interaction.client.ws.ping > 275) refreshedEmbed.setColor(errorColor)
                    await i.update({ embeds: [refreshedEmbed], components: [row] })
                }, 1000)
            }
        })
    }
}

export default command
