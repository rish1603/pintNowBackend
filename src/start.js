const rp = require('request-promise')

const interval = setInterval(async () => {
    // Ping to check if db is alive
    try {
        const result = await rp.get('http://es:9200')
        console.log('Elastic search alive, starting server')
        main()
    } catch (e) {
        console.log('Elastic search not alive, checking again in 1s')
    }
}, 1000)

function main() {
    clearInterval(interval)
    require('./server.js')
}