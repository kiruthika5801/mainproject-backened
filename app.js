let exp=require("express")
let db=require("mongoose")

let app=exp()
db.connect("mongodb://localhost:27017/kirthika")
.then(()=>{console.log("connected")})
.catch((e)=>{console.log("eerror : "+e)})

let user=db.Schema({                                          //schema is for structured format  object type
    name:{type:String, required:true, unique:false},
    phone:{type:String, required:true, unique:true},
})
let md = db.model("json", user, "json");

app.get("/",(req,res)=>{
    res.send("welcome")
})
app.get("/reg",async(req,res)=>{
    let data={
        name:"raja",
        phone:"465464"
    }
    await md.create(data)
    res.send("welcome to registration page")   ;
})

app.listen(4563);
