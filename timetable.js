const { Extra } = require('telegraf')

const {
    getRandomItem,
    link,
    formatDate
} = require('./utils')

const lectures = require('./data/lectures.json')
const timetable = require('./data/timetable.json')

const emojis = ['🧻', '🚽', '🗿', '🦷', '👨🏼‍🦳']

const getTimetableForDate = (date) => {
    return timetable.filter(lecture => lecture.date === date)
}

const getFormattedTimetable = (timetableForDate) => {
    const formattedTimetable = timetableForDate.map(({
        id,
        time
    }) => {
        const {
            name,
            dlLink,
            dlChatLink,
            dlVisitLink,
            googleMeetLink,
        } = lectures[id] || {};

        const linksFormatted = [
            link('DL', dlLink),
            link('Вiдвiдування', dlVisitLink),
            link('Чат', dlChatLink),
            link('Google Meet', googleMeetLink)
        ].filter(Boolean).join(', ')

        return `${getRandomItem(emojis)} <code>[${time}]</code> ${name}${linksFormatted.length ? `\n- ${linksFormatted}` : ''}`
    }).join('\n\n')

    return formattedTimetable
}

const sendTimetable = ({ reply, replyWithAnimation }, date) => {
    try {
        const timetableForDate = getTimetableForDate(date)

        if (!timetableForDate.length) {
            return replyWithAnimation({ source: 'dog.mp4' })
        }

        const formattedTimetable = getFormattedTimetable(timetableForDate)

        if (!formattedTimetable.trim()) {
            return 'Ошибка с базой данных лекций'
        }

        return reply(formattedTimetable, Extra.HTML().webPreview(false))
    } catch (e) {
        console.log(e)
        return reply('Произошла внутрення ошибка')
    }
}

const timetableToday = (ctx) => {
    return sendTimetable(ctx, formatDate(new Date()))
}

const timetableTomorrow = (ctx) => {
    const today = new Date()
    today.setDate(today.getDate() + 1)

    return sendTimetable(ctx, formatDate(today))
}

module.exports = {
    timetableToday,
    timetableTomorrow,
}
