const { Telegraf, Markup } = require('telegraf')

const {
    timetableToday,
    timetableTomorrow,
} = require('./timetable.js')

const bot = new Telegraf(process.env.TOKEN)

bot.start(({ reply }) => {
    return reply('👀', Markup
        .keyboard(['Лекции сегодня', 'Лекции завтра'])
        .resize()
        .extra()
  )
})

bot.hears('Лекции сегодня', timetableToday)
bot.hears('Лекции завтра', timetableTomorrow)

bot.command('/today', timetableToday)
bot.command('/tomorrow', timetableTomorrow)

bot.launch()
