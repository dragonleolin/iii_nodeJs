module.exports = app =>{
    app.get('/admin1/:p1?/:p2?', (req, res)=>{
        res.send("admin1: " + JSON.stringify(req.params))
        // res.json(req.params)
    })
}