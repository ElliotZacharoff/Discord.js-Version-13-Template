import { client, Command } from "../index"
import Discord from "discord.js"
import { isEqual } from "lodash"

client.once("ready", async () => {
    client.logger.success(`Logged in as ${client.user!.tag}!`)

    //Only update global commands in production

    const globalCommands = await client.application!.commands.fetch()
    client.commands
        .filter(c => !!c.allowDM)
        .forEach(async command => {
            if (!globalCommands) await publishCommand(command)
            else {
                const discordCommand = globalCommands.find(c => c.name === command.name)!
                //Chech if the command is published
                if (!globalCommands.some(cmd => cmd.name === command.name)) await publishCommand(command)
                else if (!commandEquals(discordCommand, command)) {
                    await discordCommand.edit(convertToDiscordCommand(command))
                    console.log(`Edited command ${command.name} since changes were found\n`, discordCommand, command)
                }
            }
        })
    //Delete commands that have been removed locally
    globalCommands.forEach(async command => {
        if (!client.commands.get(command.name)) {
            await command.delete()
            console.log(`Deleted command ${command.name} as it was deleted locally.`)
        } else if (!client.commands.get(command.name)?.allowDM) {
            await command.delete()
            console.log(`Deleted command ${command.name} globally as it is no longer allowed in DMs`)
        }
    })
    //Set guild commands - these don't need checks since they update instantly
    client.guilds.cache
        .get("775097867453857803")!
        .commands.set(constructDiscordCommands())
        .then(commands_ => commands_.forEach(async command => await setPermissions(command)))
})

async function publishCommand(command: Command) {
    if (command.allowDM) {
        //Create a global command
        const cmd = await client.application!.commands.create(convertToDiscordCommand(command))!
        await setPermissions(cmd)
    } else {
        //Create a guild wide command
        const cmd = await client.guilds.cache.get("775097867453857803")!.commands.create(convertToDiscordCommand(command))
        await setPermissions(cmd)
    }
    console.log(`Published command ${command.name}!`)
}

async function setPermissions(command: Discord.ApplicationCommand) {
    const permissions: Discord.ApplicationCommandPermissionData[] = [],
        clientCmd = client.commands.get(command.name)!
    if (clientCmd.dev)
        permissions.push({
            type: "ROLE",
            id: "768435276191891456", //Discord Staff
            permission: true
        })
    else {
        clientCmd.roleWhitelist?.forEach(id => {
            //Add whitelisted roles
            permissions.push({
                type: "ROLE",
                id,
                permission: true
            })
        })
        clientCmd.roleBlacklist?.forEach(id => {
            //Add blacklisted roles
            permissions.push({
                type: "ROLE",
                id,
                permission: false
            })
        })
    }
    if (permissions.length) await command.setPermissions(permissions, "775097867453857803")
}

function constructDiscordCommands() {
    const returnCommands: Discord.ApplicationCommandData[] = []
    let clientCommands = client.commands
    if (process.env.NODE_ENV === "production") clientCommands = clientCommands.filter(cmd => !cmd.allowDM)
    clientCommands.forEach(c => returnCommands.push(convertToDiscordCommand(c)))

    return returnCommands
}

function convertToDiscordCommand(command: Command): Discord.ApplicationCommandData {
    return {
        name: command.name,
        description: command.description,
        defaultPermission: command.roleWhitelist || command.dev ? false : true,
        options: command.options
    }
}

const commandEquals = (discordCommand: Discord.ApplicationCommand, localCommand: Command) =>
    discordCommand.name === localCommand.name &&
    discordCommand.description === localCommand.description &&
    isEqual(discordCommand.options, localCommand.options?.map(o => transformOption(o)) ?? [])

function transformOption(option: Discord.ApplicationCommandOptionData): Discord.ApplicationCommandOptionData {
    return {
        type: option.type,
        name: option.name,
        description: option.description,
        required: option.required,
        choices: option.choices,
        options: option.options?.map(o => transformOption(o))
    }
}
