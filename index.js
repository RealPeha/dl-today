const bot = require('./src/bot')
const db = require('./src/db')

const launch = async () => {
    await db.load()

    bot.launch()
}

launch()
