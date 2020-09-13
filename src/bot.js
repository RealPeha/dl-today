const { Telegraf, Markup, Extra } = require('telegraf')
require('dotenv').config()

const {
    sendTimetable,
    timetableToday,
    timetableTomorrow,
} = require('./timetable.js')
const db = require('./db')

const bot = new Telegraf(process.env.TOKEN)

bot.catch((e) => console.log('Bot catch: ', e))

const logger = ({ message, from: { is_bot, language_code, ...from } }, next) => {
    console.log(`${message.text} ${JSON.stringify(from)}`)

    return next()
}

bot.use(logger)

bot.start(({ reply }) => {
    return reply('👀', Markup
        .keyboard(['Лекции сегодня', 'Лекции завтра'])
        .resize()
        .extra()
    )
})

bot.hears('Лекции сегодня', ctx => sendTimetable(ctx, timetableToday()))
bot.hears('Лекции завтра', ctx => sendTimetable(ctx, timetableTomorrow()))

bot.command('/today', ctx => sendTimetable(ctx, timetableToday()))
bot.command('/tomorrow', ctx => sendTimetable(ctx, timetableTomorrow()))

bot.on('inline_query', ({ answerInlineQuery }) => {
    try {
        const formattedTimetableToday = timetableToday()
        const formattedTimetableTomorrow = timetableTomorrow()

        const extra = Extra.HTML().webPreview(false);

        return answerInlineQuery([
            {
                type: 'article',
                id: 'today',
                title: 'Лекции сегодня',
                input_message_content: {
                    message_text: formattedTimetableToday ? `<b>Лекции сегодня</b>\n\n${formattedTimetableToday}` : 'Сегодня пар нет',
                    ...extra,
                },
            },
            {
                type: 'article',
                id: 'tomorrow',
                title: 'Лекции завтра',
                input_message_content: {
                    message_text: formattedTimetableTomorrow ?  `<b>Лекции завтра</b>\n\n${formattedTimetableTomorrow}` : 'Завтра пар нет',
                    ...extra,
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
    try {
        await db.load()

        return reply('Updated')
    } catch (e) {
        console.log(e)

        return reply(`Error: ${JSON.stringify(e)}`)
    }
})

module.exports = bot
