const { Extra } = require('telegraf')
const cron = require('node-cron')

const { formatDate, link } = require('./utils')
const { memoryDB, db } = require('./db')

module.exports = (bot, times) => {
    times.forEach(time => {
        const [hour, mm] = time.split(':')
        const minute = mm - 5

        cron.schedule(`${minute} ${hour} * * *`, async () => {
            const date = formatDate(new Date())
            const currentLecture = memoryDB.timetable.find(lecture => (lecture.date === date && lecture.time === time))
            const lecture = memoryDB.lectures[currentLecture.id]
    
            if (currentLecture && lecture) {
                const users = Object.values(db.get('users').value()).filter(user => user.notificationEnabled)
                const messages = []
    
                for (const user of users) {
                    messages.push(bot.telegram.sendMessage(
                        user.id,
                            `5 хвилин до лекції ${link(lecture.name, lecture.dlLink) || `<b>${lecture.name}</b>`}\n` +
                            `➞ ${link('Відмітити присутність', lecture.dlVisitLink)}\n` +
                            `${lecture.googleMeetLink ? `➞ ${link('Підключитися до Google Meet', lecture.googleMeetLink)}\n` : ''}` +
                            `${lecture.dlChatLink ? `➞ ${link('Війти в чат', lecture.dlChatLink)}` : ''}`,
                        Extra.HTML().webPreview(false),
                    ))
                    
                }

                await Promise.allSettled(messages)
            }
        })
    })
}
