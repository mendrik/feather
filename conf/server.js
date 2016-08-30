let serverFactory = require('spa-server');

let server = serverFactory.create({
    path: './out',
    port: 6060,
    fallback: '/index.html'
})

server.start()
