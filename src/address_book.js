const express = require('express')

console.log('express.luke:', express.luke);


const router = express.Router()
const bluebird = require('bluebird')
const mysql = require('mysql')
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'my_test',
})
db.connect()
bluebird.promisifyAll(db)

let perPage = 10 //每頁的筆數
router.get('/:page?/:keyword?', (req, res)=>{
    const output = {};
    output.params = req.params;
    output.perPage = perPage;
    let page = parseInt(req.params.page) || 1;
    let keyword = req.params.keyword || '';
    let where = " WHERE 1 ";
    if(keyword){
        // where += " AND `name` LIKE '%" + keyword +  "%' ";
        keyword = keyword.split("'").join("\\'")
        where += ` AND name LIKE '%${keyword}%' `;
        output.keyword = keyword;
    }
    
  

    let t_sql = "SELECT COUNT(1) `total` FROM `address_book` " + where
    // console.log(t_sql);
    
    db.queryAsync(t_sql)
        .then(results=>{
            output.totalRows = results[0]['total']
            output.totalPage = Math.ceil(output.totalRows/perPage)
            if(output.totalPage==0){ return }
            if(page<1) page=1
            if(page>output.totalPage) page = output.totalPage
            output.page = page

            return db.queryAsync(`SELECT * FROM address_book ${where} LIMIT  ${(page-1)*perPage} , ${perPage}`)
        })
        .then(results=>{
            output.rows = results
            res.json(output)
        })
})

module.exports = router