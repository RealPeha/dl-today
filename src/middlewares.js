const { formatDate } = require('./utils')
const { db } = require('./db')

const logger = ({ updateType, message, from: { is_bot, language_code, ...from } }, next) => {
    if (updateType === 'inline_query') {
        console.log(`[${formatDate(new Date())}] inline_query ${JSON.stringify(from)}`)
    } else {
        console.log(`[${formatDate(new Date())}] ${message.text} ${JSON.stringify(from)}`)
    }

    return next()
}

const storeUsers = ({ from: { is_bot, language_code, ...from } }, next) => {
    if (!db.get(`users.${from.id}`).value()) {
        db.set(`users.${from.id}`, {
            ...from,
            notificationEnabled: true,
        }).write()
    }

    return next()
}

module.exports = {
    logger,
    storeUsers,
}