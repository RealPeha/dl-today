const axios = require('axios')

const lecturesUrl = 'https://raw.githubusercontent.com/RealPeha/dl-today/master/data/lectures.json'
const timetableUrl = 'https://raw.githubusercontent.com/RealPeha/dl-today/master/data/timetable.json'

class DB {
    lectures = {}
    timetable = []

    async update() {
        console.log('update db')
        this.lectures = (await axios.get(lecturesUrl)).data
        this.timetable = (await axios.get(timetableUrl)).data
    }
}

module.exports = new DB()
