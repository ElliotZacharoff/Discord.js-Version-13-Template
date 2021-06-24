import { client } from "../index"
import Discord from "discord.js"
import { errorColor } from "../config.json"

client.on("interaction", async interaction => {
    if (!interaction.isCommand() || interaction.user.bot) return

    const command = client.commands.get(interaction.commandName)!

    //Log if command is ran in DMs
    if (interaction.channel?.type === "dm") console.log(`${interaction.user.tag} used command ${interaction.commandName} in DMs`)

    let allowed = true

    //Channel Blacklist and whitelist systems
    if (!(interaction.channel instanceof Discord.DMChannel) && interaction.channel) {
        if (command.categoryBlacklist && command.categoryBlacklist.includes(interaction.channel.parentID!)) allowed = false
        else if (command.channelBlacklist && command.channelBlacklist.includes(interaction.channelID)) allowed = false
        else if (command.categoryWhitelist && !command.categoryWhitelist.includes(interaction.channel.parentID!)) allowed = false
        else if (command.channelWhitelist && !command.channelWhitelist.includes(interaction.channelID)) allowed = false
    }

    //Run command and handle errors
    try {
        // Run the command
        await command.execute(interaction)
    } catch (error) {
        // Send error to bot-dev channel
        if (error.stack) {
            if (process.env.NODE_ENV === "production") {
                const embed = new Discord.MessageEmbed()
                    .setColor(errorColor)
                    .setAuthor("Unexpected error!")
                    .setTitle(error.toString().substring(0, 255))
                    .setDescription(`\`\`\`${error.stack.substring(0, 2047)}\`\`\``)
                    .setFooter("Check the console for more details")
                await (interaction.client.channels.cache.get("730042612647723058") as Discord.TextChannel).send({
                    embeds: [embed]
                }) //Rodry and bot-development
            }
            console.error(
                `Unexpected error with command ${interaction.commandName} on channel ${
                    interaction.channel instanceof Discord.DMChannel ? interaction.channel.type : (interaction.channel as Discord.TextChannel).name
                } executed by ${interaction.user.tag}. Here's the error:\n${error.stack}`
            )
        }
    }
})
