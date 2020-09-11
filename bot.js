const { Telegraf, Markup, Extra } = require('telegraf')

const {
    sendTimetable,
    timetableToday,
    timetableTomorrow,
} = require('./timetable.js')
const db = require('./db')

const bot = new Telegraf(process.env.TOKEN)

bot.start(({ reply }) => {
    return reply('👀', Markup
        .keyboard(['Лекции сегодня', 'Лекции завтра'])
        .resize()
        .extra()
  )
})

bot.hears('Лекции сегодня', (ctx) => sendTimetable(timetableToday())(ctx))
bot.hears('Лекции завтра', (ctx) => sendTimetable(timetableTomorrow())(ctx))

bot.command('/today', (ctx) => sendTimetable(timetableToday())(ctx))
bot.command('/tomorrow', (ctx) => sendTimetable(timetableTomorrow())(ctx))

bot.on('inline_query', (ctx) => {
    try {
        const formattedTimetableToday = timetableToday()
        const formattedTimetableTomorrow = timetableTomorrow()

        return ctx.answerInlineQuery([
            {
                type: 'article',
                id: 'today',
                title: 'Лекции сегодня',
                input_message_content: {
                    message_text: formattedTimetableToday ? `<b>Лекции сегодня</b>\n\n${formattedTimetableToday}` : 'Сегодня пар нет',
                    ...Extra.HTML().webPreview(false),
                },
            },
            {
                type: 'article',
                id: 'tomorrow',
                title: 'Лекции завтра',
                input_message_content: {
                    message_text: formattedTimetableTomorrow ?  `<b>Лекции завтра</b>\n\n${formattedTimetableTomorrow}` : 'Завтра пар нет',
                    ...Extra.HTML().webPreview(false),
                },
            }
        ], {
            cache_time: 20,
        })
    } catch (e) {
        console.log(e)
    }
})

bot.command('update', async ({ reply }) => {
    await db.update()

    return reply('Updated')
})

const launch = async () => {
    await db.update()

    bot.launch()
}

launch()
