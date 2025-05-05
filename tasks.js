let exp = require('express');
let parser = require('body-parser');
let app = exp()
const fs = require('fs');


app.use(parser.json())
app.use(parser.urlencoded())

app.get('/', (req, res) => {
    res.send("welcome to web page")
})
app.post('/in', (req, res) => {
    let {name,phone}=req.body
    res.send(req.body)
})

app.get('/home', (req, res) => {
    res.send("welcome to home page")
})


app.get('/Registration', (req, res) => {


    fs.readFile('./taxk.txt', (e, data) => {
        if (e) {
            res.send("file unreadable");
        } else {
            let jsonData = [];
            let t = req.query
            jsonData.push(t);
            let value = JSON.stringify(jsonData);

            fs.writeFile('./taxk.txt', value, (err) => {
                if (err) {
                    res.send("Error occurred");
                } else {
                    res.send(value);
                }

            });
        }
    });

})

app.get('/service/:cat',(req,res)=>{
    
    fs.readFile('./one.txt', (e, data) => {
        if (e) {
            res.send("file unreadable");
        } else {
            let jsonData = [];
            let t = req.params.cat                   //used to get one value
            jsonData.push(t);
            let values = JSON.stringify(jsonData);

            fs.writeFile('./one.txt', values, (err) => {
                if (err) {
                    res.send("Error occurred");
                } else {
                    res.send({msg:"welcome to service",values:values})
                }

            });
        }
    });

})
app.listen(9001, () => {
    console.log('Server is running on http://localhost:9001');
});





