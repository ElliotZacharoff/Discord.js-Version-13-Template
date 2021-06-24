import fs from "fs"
import path from "path"
import { HTBClient } from "./Client"
import { Command } from "../index"

function findCommands(dir: string, pattern: string) {
    let results: string[] = []
    fs.readdirSync(dir).forEach(innerPath => {
        innerPath = path.resolve(dir, innerPath)
        const stat = fs.statSync(innerPath)

        if (stat.isDirectory()) results = results.concat(findCommands(innerPath, pattern))
        else if (stat.isFile() && innerPath.endsWith(pattern)) results.push(innerPath)
    })

    return results
}

export function setup(client: HTBClient) {
    //Set commands
    const cmdFiles = findCommands("./dist/commands", ".js")
    if (cmdFiles.length <= 0) console.log("There are no commands to load...")
    else {
        cmdFiles.forEach(file => {
            const command: Command = require(file).default
            const pathSplit = file.split("\\")
            command.category = pathSplit[pathSplit.length - 2]
            client.commands.set(command.name, command)
        })
        client.logger.success(`Loaded ${cmdFiles.length} commands.`)
    }

    //Setup events
    fs.readdir("./dist/events", (err, files) => {
        if (err) console.error(err)
        let events = files.filter(f => f.endsWith(".js"))
        if (events.length <= 0) return console.log("There are no events to load...")
        events.forEach(file => require(`../events/${file}`))
        client.logger.success(`Loaded ${events.length} events.`)
    })
}
