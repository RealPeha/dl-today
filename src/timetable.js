const { Extra } = require('telegraf')

const {
    getRandomItem,
    link,
    formatDate
} = require('./utils')
const db = require('./db')

const emojis = ['🧻', '🚽', '🗿', '🦷', '👨🏼‍🦳']

const getTimetableForDate = (date) => {
    const formattedDate = formatDate(date)

    return db.timetable.filter(({ date }) => date === formattedDate)
}

const formatLinks = lecture => {
    const {
        dlLink,
        dlChatLink,
        dlVisitLink,
        googleMeetLink,
    } = lecture

    return [
        link('DL', dlLink),
        link('Вiдвiдування', dlVisitLink),
        link('Чат', dlChatLink),
        link('Google Meet', googleMeetLink),
    ].filter(Boolean).join(', ')
}

const formatTimetable = (timetableForDate) => {
    const formattedTimetable = timetableForDate.map(({ id, time }) => {
        const lecture = db.lectures[id] || {}

        const links = formatLinks(lecture)

        return `${getRandomItem(emojis)} <code>[${time}]</code> ${lecture.name}` +
               `${links.length ? `\n- ${links}` : ''}`
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

const sendTimetable = ({ reply, replyWithAnimation }, formattedTimetable) => {
    try {
        if (!formattedTimetable) {
            return replyWithAnimation({ source: 'dog.mp4' }, { caption: 'Лекций нет' })
        }

        return reply(formattedTimetable, Extra.HTML().webPreview(false))
    } catch (e) {
        console.log(e)

        return reply('Произошла внутрення ошибка')
    }
}

const timetableToday = () => {
    return getFormattedTimetableForDate(new Date())
}

const timetableTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return getFormattedTimetableForDate(tomorrow)
}

module.exports = {
    timetableToday,
    timetableTomorrow,
    sendTimetable,
}
