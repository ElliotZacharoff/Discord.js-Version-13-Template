import { client } from "../index"

client.on("message", async message => {
    //Delete pinned message messages
    if (message.type === "PINS_ADD" && message.channel.type !== "dm") {
        await message.delete()
        return
    }

    //Stop if user is a bot
    if (message.author.bot) return
})
