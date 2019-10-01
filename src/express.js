const express = require('express')

express.luke = 'luke'  //從其他地方取的express都會依樣

const url = require('url')
const bodyParser = require('body-parser')
const multer =require('multer')
const upload =multer({dest:'tmp_uploads/'})
const fs = require('fs')
const session = require('express-session')
const moment = require('moment-timezone')
const mysql = require('mysql')
const bluebird = require ('bluebird')
const cors = require('cors')
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'my_test',
})
db.connect()

bluebird.promisifyAll(db)

/*放置middleware*/
const app = express()
// const urlencodeParser = bodyParser.urlencoded({extended: false})
// app.use(cors());
const whitelist = ['http://localhost:5000', undefined, 'http://localhost:8080', 'http://localhost:3000'];
const corsOptions = {
    credentials: true,
    origin: function(origin, callback){
        console.log('origin: ' + origin);

        if(whitelist.indexOf(origin)>=0){
            callback(null, true);
        } else {
            callback(new Error('EEEEEEEEError'));
        }
    }
};
app.use(cors(corsOptions));

//用use改成全域使用，會自動判斷是否有用post
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(session({
    saveUninitialized:false,
    resave: false,
    secret: '加密用的字串',
    cookie: {
        maxAge: 1200000, //單位毫秒
    }
}))

//routes 路由

app.get('/', (req, res)=>{
    res.render('home', {say: 'hello', name: 'Luke'})
})
app.get('/sales01', (req, res)=>{
    const sales = require('./../data/sales01');
    // res.json(sales)
    res.render('sales01', {
        sales01_data: sales
    })
})

app.get('/abc', (req, res)=>{
    res.send('success abc')
})

app.get('/try-querystring', (req, res)=>{
    const urlParts = url.parse(req.url, true)
    console.log(urlParts);
    res.render('try-querystring',{
        query: urlParts.query
    })
})

app.get('/try-post-form', (req, res)=>{
    res.render('try-post-form')
})
app.post('/try-post-form', (req, res)=>{
    console.log(req.body);
    
    res.render('try-post-form', req.body)
    // res.send(JSON.stringify(req.body))
})

app.get('/try-post-form2', (req, res)=>{
    res.send('GET: try-post-form2')
})
app.post('/try-post-form2', (req, res)=>{
    
    res.json(req.body)
})
app.put('/try-post-form2', (req, res)=>{
    
    res.send('PUT: try-post-form2')
})

//傳單一檔案
// app.post('/try-upload', upload.single('avatar'),(req, res) =>{
//     console.log(req.file);
//     if(req.file && req.file.mimetype){
//         console.log(req.file);

//         switch(req.file.mimetype){
//             case 'image/png':
//             case 'image/jpeg':
//                 fs.createReadStream(req.file.path)
//                     .pipe(
//                         fs.createWriteStream('public/img/' + req.file.originalname)
//                     )
                
//                     res.send('ok')
//                     break;
//             default:
//                 return res.send('bad file type')
                        

//         }
        
//     }else{
//         res.send('no uploads')
//     }
// })

//傳多檔案, 12指最多傳送的檔案數
app.post('/try-upload', upload.array('avatar', 12),(req, res, next) =>{
    // console.log(req.files);
    // res.send('upload success')

    console.log(req.files);
    for(let i=0;i<req.files.length;i++){

        if(req.files[i] && req.files[i].mimetype){
            console.log(req.files.length);
    
            switch(req.files[i].mimetype){
                case 'image/png':
                case 'image/jpeg':
                    fs.createReadStream(req.files[i].path)
                        .pipe(
                            fs.createWriteStream('public/img/' + req.files[i].originalname)
                        )
                        break;
                        default:
                            return res.send('bad file type')
                            
                            
                        }
                        
                    }else{
                        res.send('no uploads')
                    }
                }
                res.send('ok')
    
})

app.get('/my-params1/:action/:id', (req, res)=>{
    res.json(req.params)
})
app.get('/my-params2/:action?/:id?', (req, res)=>{
    res.json(req.params)
})
app.get('/my-params3/*/*?', (req, res)=>{
    res.json(req.params)
})


app.get(/^\/09\d{2}-?\d{3}-?\d{3}/, (req, res)=>{
    // let str = req.url.slice(1,11)
    let str = req.url.slice(1)
    str = str.split('?')[0]
    str = str.split('-').join('')
    res.send('手機: ' + str)
})


//admin1 此方法比較不好
const admin1 = require(__dirname + '/admins/admin1')
admin1(app)

//admin2用此方法
app.use(require(__dirname + '/admins/admin2'))

//admin3 跟admin2差不多，但會多使用/目錄位置
app.use('/admin3', require(__dirname + '/admins/admin3'))

//address_book那隻API
app.use('/address-book', require(__dirname + '/address_book'))

app.get('/try-session', (req, res)=>{
    req.session.my_view = req.session.my_view || 0
    req.session.my_view++

    res.json({
        aa: 'hello',
        'my_view': req.session.my_view
    })
})

app.get('/try-moment', (req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const mo1 = moment(req.session.cookie.expires);
    const mo2 = moment(new Date());
    res.contentType('text/plain');
    res.write(req.session.cookie.expires.toString() + "\n");
    res.write(req.session.cookie.expires.constructor.name + "\n");
    res.write(new Date() + "\n");
    res.write(mo1.format(fm) + "\n");
    res.write(mo2.format(fm) + "\n");
    res.write('倫敦:' + mo1.tz('Europe/London').format(fm) + "\n");
    res.write(mo2.tz('Asia/Tokyo').format(fm) + "\n");
    res.end('');
});

app.get('/try-db', (req, res)=> {
    const sql = "SELECT * FROM `address_book` WHERE `name` LIKE ? ";
    db.query(sql, ["%李小名%"],(error, results, fields)=>{
        console.log(error);
        console.log(results);
        console.log(fields);
        // res.json(results);

        for(let r of results){
            r.birthday2 = moment(r.birthday).format('YYYY-MM-DD');
        }

        res.render('try-db',{
            rows: results
        })

    });
});
app.get('/try-db2/:page?', (req, res)=> {
    let page = req.params.page || 1
    let perPage = 5
    const output = {}

    db.queryAsync("SELECT COUNT(1) total FROM `address_book`")
        .then(results =>{
            // res.json(results)
            output.total = results[0].total
            return db.queryAsync(`SELECT* FROM address_book LIMIT ${(page-1)*perPage}, ${perPage}`)
        })
        .then(results=>{
            output.rows =results
            res.json(output)
        })
        .catch(error=>{
            console.log(error);
            res.send(error)
        })
});

app.get('/try-session2', (req, res)=> {
    req.session.views = req.session.views || 0;
    req.session.views++;

    res.json({views: req.session.views});
});


app.use((req, res)=>{
    res.type('text/plain')
    res.status(404)
    res.send('404-找不到頁面')
})

app.listen(3000, ()=>{
    console.log('start server');
    
})