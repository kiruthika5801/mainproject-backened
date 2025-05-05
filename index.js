let exp=require('express')

// to initialize express 
let app=exp()

app.get('/',(req,res)=>{
    res.send("welcome")
})
app.get('/home',(req,res)=>{
    res.send({msg:"welcome to home"})
})
app.get('/service',(req,res)=>{
    let t= req.query                       //to get full value as object 
    res.send({msg:"welcome to service",values:t})
})
app.get('/services/:cat',(req,res)=>{
    let t= req.params.cat                  //used to get one value
    res.send({msg:"welcome to services",values:t})
})

app.listen(9000, () => {
    console.log('Server is running on http://localhost:9000');
});