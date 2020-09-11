const getRandomItem = arr => arr[Math.floor(Math.random() * arr.length)]

const link = (title, href) => href ? `<a href="${href}">${title}</a>` : null

const formatDate = (date) => {
    const formatLength = (number, maxLength = 2) => number.toString().padStart(maxLength, '0')

    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()

    return `${formatLength(day)}.${formatLength(month)}.${year}`
}

module.exports = {
    getRandomItem,
    link,
    formatDate,
}
