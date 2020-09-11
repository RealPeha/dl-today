const getRandomItem = array => array[Math.floor(Math.random() * array.length)]

const link = (title, href) => href ? `<a href="${href}">${title}</a>` : null

const formatDate = (date) => {
    return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`
}

module.exports = {
    getRandomItem,
    link,
    formatDate
}
