const getRandomItem = array => array[Math.floor(Math.random() * array.length)]

const link = (title, href) => href ? `<a href="${href}">${title}</a>` : null

const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}.${date.getMonth().toString().padStart(2, '0')}.${date.getFullYear().toString().padStart(2, '0')}`
}

module.exports = {
    getRandomItem,
    link,
    formatDate
}
