const bot = require('./src/bot')
const { memoryDB } = require('./src/db')

const launch = async () => {
    await memoryDB.load()

    bot.launch()
}

launch()
