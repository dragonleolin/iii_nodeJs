const express = require('express')
const router =  express.Router()

router.route('/member/edit/:id')
    .all((req, res, next)=>{
        res.locals.memberData = {
            name: 'bill',
            id: req.params.id
        }
        next()
    })
    .get((req, res)=>{
        res.send('GET:' + JSON.stringify(res.locals))
    })
    .post((req, res)=>{
        res.send('POST:' + JSON.stringify(res.locals))
    })



module.exports = router