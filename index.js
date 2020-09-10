const { Telegraf, Markup, Extra } = require('telegraf')

const lectures = require('./lectures.json')
const links = require('./links.json')

const emojis = ['🧻', '🚽', '🗿', '🍑']

const getRandomItem = array => array[Math.floor(Math.random() * array.length)]

const link = (title, href) => href ? `<a href="${href}">${title}</a>` : null

const formatDate = (date) => {
    return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`
}

const getLecturesByDate = (date) => {
    return lectures.filter(lecture => lecture.date === date)
}

const getFormattedLectures = (lectures) => {
    const lecturesText = lectures.map(({
        id,
        time,
        name
    }) => {
        const {
            dlLink,
            dlChatLink,
            dlVisitLink,
            googleMeetLink,
        } = links[id] || {};

        const linksFormatted = [
            link('DL', dlLink),
            link('Вiдвiдування', dlVisitLink),
            link('Чат', dlChatLink),
            link('Google Meet', googleMeetLink)
        ].filter(s => s)

        return `${getRandomItem(emojis)} <code>[${time}]</code> ${name}` + (linksFormatted.length ? `\n- ${linksFormatted.join(', ')}` : '')
    }).join('\n\n')

    if (!lecturesText.trim()) {
        return 'Ошибка с базой данных лекций'
    }

    return lecturesText
}

const sendLectures = ({ reply, replyWithAnimation }, date) => {
    try {
        const lectures = getLecturesByDate(date)

        if (!lectures.length) {
            return replyWithAnimation({ source: 'dog.mp4' })
        }

        const formattedLectures = getFormattedLectures(lectures)

        return reply(formattedLectures, Extra.HTML().webPreview(false))
    } catch (e) {
        console.log(e)
        return reply('Произошла внутрення ошибка')
    }
}

const bot = new Telegraf(process.env.TOKEN)

bot.start(({ reply }) => {
    return reply('👀', Markup
        .keyboard(['Лекции сегодня', 'Лекции завтра'])
        .resize()
        .extra()
  )
})

bot.hears('Лекции сегодня', (ctx) => sendLectures(ctx, formatDate(new Date())))
bot.hears('Лекции завтра', (ctx) => {
    const today = new Date()
    today.setDate(today.getDate() + 1)

    return sendLectures(ctx, formatDate(today))
})
bot.command('/lectures', sendLectures)

bot.launch()
