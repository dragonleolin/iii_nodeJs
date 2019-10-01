
const http = require('http')
const fs = require('fs')
const server = http.createServer((request, response)=>{
    fs.writeFile(__dirname+'/header01.json', JSON.stringify(request.headers),
    error=>{
        if(error) return console.log("error" + error);
        console.log('file save');    
    })
    response.writeHead(200, 
        {'content-Type': 'text/html'})
    //${request.url}取得網址列的值
    response.end(`<div>Hello, node.js</div><br><h2>test ${request.url}</h2>`)
})

//伺服器埠號
server.listen(3000)