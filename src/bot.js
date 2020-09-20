const { Telegraf, Markup, Extra } = require('telegraf')

require('dotenv').config()

const { sendTimetable, timetableToday, timetableTomorrow } = require('./timetable.js')
const { logger, storeUsers, onlyBot, onlyAdmin } = require('./middlewares')
const { memoryDB, db } = require('./db')

const bot = new Telegraf(process.env.TOKEN)
const extra = Extra.HTML().webPreview(false);
const keyboard = (buttons) => Markup
    .keyboard(['Лекции сегодня', 'Лекции завтра', ...buttons])
    .resize()
    .extra()

const timesStart = ['07:45', '09:30', '11:15', '13:10', '14:55', '16:40', '12:15']
const timesEnd = ['09:20', '11:05', '12:50', '14:45', '16:30', '18:15', '12:42']

require('./cron')(bot, timesStart, timesEnd)

bot.catch((e) => console.log('Bot error: ', e))

const setNotification = (id, value) => {
    db.get(`users.${id}`)
        .set('notificationEnabled', value)
        .write()
}

const enableNotification = ({ from, reply }) => {
    setNotification(from.id, true)

    return reply('Теперь ты будешь получать уведомление о начале лекции', keyboard(['Выключить уведомления']))
}

const disableNotification = ({ from, reply }) => {
    setNotification(from.id, false)

    return reply('Теперь ты не будешь получать уведомление о начале лекции', keyboard(['Включить уведомления']))
} 

bot.use(storeUsers)
bot.use(logger)

bot.on('new_chat_members', ctx => {
    console.log(ctx.message.chat)
})

bot.start(onlyBot, ({ reply, from }) => {
    const user = db.get(`users.${from.id}`).value()

    return reply('👀', keyboard([user.notificationEnabled
        ? 'Выключить уведомления'
        : 'Включить уведомления']))
})

bot.hears('Лекции сегодня', onlyBot, ctx => sendTimetable(ctx, timetableToday()))
bot.hears('Лекции завтра', onlyBot, ctx => sendTimetable(ctx, timetableTomorrow()))
bot.command('/today', ctx => sendTimetable(ctx, timetableToday()))
bot.command('/tomorrow', ctx => sendTimetable(ctx, timetableTomorrow()))

bot.hears('Включить уведомления', onlyBot, enableNotification)
bot.hears('Выключить уведомления', onlyBot, disableNotification)
bot.command('/enable_notification', onlyBot, enableNotification)
bot.command('/disable_notification', onlyBot, disableNotification)

bot.command('/time', onlyAdmin, onlyBot, ({ reply }) => reply(new Date().toLocaleString()))

bot.command('/clear', onlyAdmin, async ({ reply, deleteMessage }) => {
    const msg = await reply('Да.', Markup.removeKeyboard().extra())

    return deleteMessage(msg.message_id)
})

bot.on('inline_query', ({ answerInlineQuery }) => {
    try {
        const formattedTimetableToday = timetableToday()
        const formattedTimetableTomorrow = timetableTomorrow()

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

bot.command('update', onlyAdmin, onlyBot, async ({ reply }) => {
    try {
        await memoryDB.load()

        return reply('Updated')
    } catch (e) {
        console.log('Update error: ', e)

        return reply(`Update error: ${JSON.stringify(e)}`)
    }
})

module.exports = bot
