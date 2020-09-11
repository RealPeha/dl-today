const axios = require('axios')

const gitBranchUrl = 'https://raw.githubusercontent.com/RealPeha/dl-today/master'

const lecturesUrl = `${gitBranchUrl}/data/lectures.json`
const timetableUrl = `${gitBranchUrl}/data/timetable.json`

class DB {
    lectures = {}
    timetable = []

    async load() {
        console.log('update db')
        
        this.lectures = (await axios.get(lecturesUrl)).data
        this.timetable = (await axios.get(timetableUrl)).data
    }
}

module.exports = new DB()
