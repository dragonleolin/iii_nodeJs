const express = require('express')
const router =  express.Router()

router.get('/admin2/:a1?/:a2?', (req, res)=>{
    res.send("admin2: " + JSON.stringify(req.params))
    // res.json(req.params)
})



module.exports = router