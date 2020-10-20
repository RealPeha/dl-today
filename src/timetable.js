const { Extra } = require('telegraf')
const axios = require('axios')

const { getRandomItem, link, formatDate } = require('./utils')
const { memoryDB } = require('./db')
const { EMOJIS, LECTURE_TYPES } = require('./constants')

const getTimetableForDate = (date) => {
    const formattedDate = formatDate(date)

    return memoryDB.timetable.filter(({ date }) => date === formattedDate)
}

const formatLinks = (lecture, isFull) => {
    const {
        dlLink,
        dlChatLink,
        dlVisitLink,
        googleMeetLink,
        otherLinks,
    } = lecture

    return [
        link('DL', dlLink),
        link('Вiдвiдування', dlVisitLink),
        link('Чат', dlChatLink),
        link('Google Meet', googleMeetLink),
    ].filter(Boolean).join(', ') + (isFull ? formatOtherLinks(otherLinks) : '')
}

const formatOtherLinks = links => {
    if (!links || !Array.isArray(links) || !links.length) {
        return ''
    }

    return links.map(({ title, url, description }) => {
        return `\n➞ ${link(title, url)}${description ? ` - ${description}` : ''}`
    }).join('')
}

const formatTimetable = (timetableForDate, isFull) => {
    const formattedTimetable = timetableForDate.map(({ id, time, type }) => {
        const lecture = memoryDB.lectures[id] || {}

        const links = formatLinks(lecture, isFull)

        return `${getRandomItem(EMOJIS)} ${LECTURE_TYPES[type] ? ` <code>${LECTURE_TYPES[type]}</code> ` : ''}<code>[${time}]</code> <b>${lecture.name}</b>` +
               `${links.length ? `\n➞ ${links}` : ''}`
    }).join('\n\n')

    return formattedTimetable
}

const getFormattedTimetableForDate = (date, isFull = false) => {
    const timetableForDate = getTimetableForDate(date)

    if (!timetableForDate.length) {
        return null
    }

    const formattedTimetable = formatTimetable(timetableForDate, isFull)

    if (!formattedTimetable.trim()) {
        return 'Ошибка с базой данных лекций'
    }

    return formattedTimetable
}

const sendTimetable = async ({ reply, replyWithAnimation, replyWithVideo }, formattedTimetable) => {
    try {
        if (!formattedTimetable) {
            if (Math.random() > 0.5) {
                try {
                    const gifs = (await axios.get('https://api.tenor.com/v1/random?key=XF1HV0X0MUY2&q=sad&limit=1')).data

                    const media = gifs.results[0].media[0]
                    const gif = media.gif.url

                    return replyWithAnimation(gif, { caption: 'Лекций нет' })
                } catch (e) {
                    return replyWithAnimation({ source: 'dog.mp4' }, { caption: 'Лекций нет' })
                }
            }

            return replyWithAnimation({ source: 'dog.mp4' }, { caption: 'Лекций нет' })
        }

        return reply(formattedTimetable, Extra.HTML().webPreview(false))
    } catch (e) {
        console.log('Send timetable error: ', e)

        return reply('Произошла внутрення ошибка')
    }
}

const timetableToday = (isFull = false) => {
    return getFormattedTimetableForDate(new Date(), isFull)
}

const timetableTomorrow = (isFull = false) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return getFormattedTimetableForDate(tomorrow, isFull)
}

module.exports = {
    timetableToday,
    timetableTomorrow,
    sendTimetable,
}
