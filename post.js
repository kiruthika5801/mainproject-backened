let exp = require('express');
let parser = require('body-parser');
let app = exp()
const fs = require('fs');

pp.use(parser.json())
app.use(parser.urlencoded())

app.post('/in', (req, res) => {
    let {name,phone}=req.body
    res.send(req.body)
})




