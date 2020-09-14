const axios = require('axios')

const lectures = require('../data/lectures.json')
const timetable = require('../data/timetable.json')

const gitBranchUrl = 'https://raw.githubusercontent.com/RealPeha/dl-today/master'

const lecturesUrl = `${gitBranchUrl}/data/lectures.json`
const timetableUrl = `${gitBranchUrl}/data/timetable.json`

class DB {
    lectures = {}
    timetable = []

    async load() {
        console.log('update db')
        
        try {
            this.lectures = (await axios.get(lecturesUrl)).data
        } catch (e) {
            console.log('Error with update lectures', e)
            this.lectures = lectures
        }

        try {
            this.timetable = (await axios.get(timetableUrl)).data
        } catch (e) {
            console.log('Error with update timetable', e)
            this.timetable = timetable
        }
    }
}

module.exports = new DB()
