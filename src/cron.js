const { Extra } = require('telegraf')
const cron = require('node-cron')

const { formatDate, link } = require('./utils')
const { memoryDB, db } = require('./db')

const broadcast = (bot, message) => {
    const users = Object.values(db.get('users').value()).filter(user => user.notificationEnabled)

    const messages = []
    
    for (const user of users) {
        messages.push(bot.telegram.sendMessage(user.id, message, Extra.HTML().webPreview(false)))
        
    }

    return Promise.allSettled(messages)
}

module.exports = (bot, times) => {
    times.forEach(time => {
        const [hh, mm] = time.split(':')
        const hour = +hh
        const minute = mm - 5

        cron.schedule(`${minute} ${hour} * * *`, async () => {
            const date = formatDate(new Date())
            const currentLecture = memoryDB.timetable.find(lecture => (lecture.date === date && lecture.time === time))
    
            if (currentLecture) {
                const lecture = memoryDB.lectures[currentLecture.id]
                
                await broadcast(bot,
                    `5 хвилин до лекції ${link(lecture.name, lecture.dlLink) || `<b>${lecture.name}</b>`}\n` +
                    `➞ ${link('Відмітити присутність', lecture.dlVisitLink)}\n` +
                    `${lecture.googleMeetLink ? `➞ ${link('Підключитися до Google Meet', lecture.googleMeetLink)}\n` : ''}` +
                    `${lecture.dlChatLink ? `➞ ${link('Війти в чат', lecture.dlChatLink)}` : ''}`
                )
            }
        })
    })


    cron.schedule(`59 23 * * *`, async () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const date = formatDate(tomorrow)

        const tomorrowMorningLecture = memoryDB.timetable.find(lecture => (lecture.date === date && lecture.time === '07:45'))

        if (tomorrowMorningLecture) {
            const lecture = memoryDB.lectures[tomorrowMorningLecture.id]

            await broadcast(bot,
                `Завтра раненько вставать, пара ${link(lecture.name, lecture.dlLink) || `<b>${lecture.name}</b>`} на <code>7:45</code>, тому довго не сиди`
            )
        }
    })
}
