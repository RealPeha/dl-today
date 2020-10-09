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

module.exports = (bot, timesStart, timesEnd) => {
    timesStart.forEach((timeStart, index) => {
        const [hh, mm] = timeStart.split(':')
        let hour = +hh
        let minute = mm - 5

        if (minute < 0) {
            minute = 60 + minute
            hour -= 1
        }

        cron.schedule(`${minute} ${hour} * * *`, async () => {
            const date = formatDate(new Date())
            const currentLecture = memoryDB.timetable.find(lecture => (lecture.date === date && lecture.time === timeStart))
    
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

        if (timesEnd[index]) {
            const [hh, mm] = timesEnd[index].split(':')
            const hour = +hh
            const minute = +mm

            cron.schedule(`${minute} ${hour} * * *`, async () => {
                const date = formatDate(new Date())
                const todayLectures = memoryDB.timetable.filter(lecture => (lecture.date === date))
                const currentLecture = todayLectures.findIndex(lecture => (lecture.date === date && lecture.time === timeStart))
        
                if (currentLecture !== -1) {
                    const isLast = (todayLectures.length - 1) === currentLecture

                    await broadcast(bot, `Лекція закінчилася${isLast ? '\nСьогодні пар більше немає, можеш відпочивати' : '. Готуйся до наступної'}`)
                }
            })
        }
    })


    cron.schedule(`59 23 * * *`, async () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const date = formatDate(tomorrow)

        const tomorrowMorningLecture = memoryDB.timetable.find(lecture => (lecture.date === date && lecture.time === '07:45'))

        if (tomorrowMorningLecture) {
            const lecture = memoryDB.lectures[tomorrowMorningLecture.id]

            const formatterLecture = link(lecture.name, lecture.dlLink) || `<b>${lecture.name}</b>`

            const phrases = [
                `Завтра раненько вставать, пара ${formatterLecture} на <code>7:45</code>, тому довго не сиди`,
                `А ти не забув, що у тебе завтра вранці в <code>7:45</code> лекція ${formatterLecture}? Як би там не було, гайда до кроватки прямо зараз!`,
                `Якщо не хочеш проспати пару ${formatterLecture} на <code>7:45</code>, то лягай спатки`
            ]

            await broadcast(bot, phrases[Math.floor(Math.random() * phrases.length)])
        }
    })
}