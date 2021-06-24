//Setup dotenv and define client
require("dotenv").config()
import Discord from "discord.js"
import { HTBClient } from "./lib/Client"
export const client = new HTBClient({
    partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
    intents: Discord.Intents.ALL
})
//Import commands and events
import { setup } from "./lib/imports"
setup(client)

//Command interface
export interface Command extends Discord.ApplicationCommandData {
    allowDM?: true
    allowTip?: false
    dev?: true
    roleWhitelist?: Discord.Snowflake[]
    roleBlacklist?: Discord.Snowflake[]
    channelBlacklist?: Discord.Snowflake[]
    channelWhitelist?: Discord.Snowflake[]
    categoryWhitelist?: Discord.Snowflake[]
    categoryBlacklist?: Discord.Snowflake[]
    category?: string
    execute(interaction: Discord.CommandInteraction): Promise<any>
}

//Log in
client.login(process.env.DISCORD_TOKEN)
