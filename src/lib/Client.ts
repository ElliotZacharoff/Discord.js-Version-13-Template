import Discord from "discord.js"
import consola, { Consola } from "consola"
import { Command } from "../index"
export class HTBClient extends Discord.Client {
    public logger: Consola = consola
    public commands: Discord.Collection<string, Command> = new Discord.Collection()
    public cooldowns: Discord.Collection<string, Discord.Collection<Discord.Snowflake, number>> = new Discord.Collection()
}
