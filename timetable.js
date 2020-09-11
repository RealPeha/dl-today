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

const formatTimetable = (timetableForDate) => {
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

const getFormattedTimetableForDate = (date) => {
    const timetableForDate = getTimetableForDate(date)

    if (!timetableForDate.length) {
        return null
    }

    const formattedTimetable = formatTimetable(timetableForDate)

    if (!formattedTimetable.trim()) {
        return 'Ошибка с базой данных лекций'
    }

    return formattedTimetable
}

const sendTimetable = (formattedTimetable) => ({ reply, replyWithAnimation }) => {
    try {
        if (!formattedTimetable) {
            return replyWithAnimation({ source: 'dog.mp4' })
        }

        return reply(formattedTimetable, Extra.HTML().webPreview(false))
    } catch (e) {
        console.log(e)

        return reply('Произошла внутрення ошибка')
    }
}

const timetableToday = () => {
    return getFormattedTimetableForDate(formatDate(new Date()))
}

const timetableTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return getFormattedTimetableForDate(formatDate(tomorrow))
}

module.exports = {
    timetableToday,
    timetableTomorrow,
    sendTimetable,
}
