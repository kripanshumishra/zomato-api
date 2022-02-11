let db;
const express = require("express")
const app = express()
// const {MongoClient} = require('mongodb');
const mongo= require('mongodb');
const MongoClient = mongo.MongoClient;
// const mongourl = "mongodb://localhost:27017"
const mongourl = "mongodb+srv://test:123@cluster0.qy83a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const df = require('dotenv').config()
let port= process.env.port || 5000;
const bodyParser = require('body-parser')
const cors= require('cors')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.get('/location',(req,res)=>{
    db.collection('location').find().toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})
app.get('/mealType',(req,res)=>{
    db.collection('mealType').find().toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})

app.get('/restaurants',(req,res)=>{
    let {stateid}=req.query
    let {mealid}=req.query
    let query = {}
    
    if (stateid && mealid){
        query={state_id:Number(stateid),
                "mealTypes.mealtype_id":Number(mealid)}
    }
    else if(mealid){        query = {"mealTypes.mealtype_id":Number(mealid)}
    }
    else if (stateid){
        query={state_id:Number(stateid)}
    }
    db.collection('restaurant').find(query).toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})


// restaurant details
app.get('/details/:id',(req,res)=>{
    let restId = Number(req.params.id)
    db.collection('restaurant').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})

//menu wrt resturant
app.get('/menu/:id',(req,res)=>{
    let restId = Number(req.params.id)
    db.collection('menu').find({restaurant_id:restId}).toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})
// filter api
app.get('/filter/:mealid',(req,res)=>{
    let sort = {cost:1}
    let skip =0;
    let limit=30
    let mealid = Number(req.params.mealid)
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    let query={}
    let cuisineId =Number( req.query.cuisine)
    if(req.query.sort){
        sort={cost:req.query.sort}
    }
    if(req.query.limit&req.query.skip){
        skip= Number(req.query.skip)
        limit= Number(req.query.limit)
    }
    if(cuisineId & lcost & hcost){
        query={"cuisines.cuisine_id":cuisineId,"mealTypes.mealtype_id":mealid}
    }
    else if(cuisineId){
        query={"cuisines.cuisine_id":cuisineId,"mealTypes.mealtype_id":mealid,$and:[{cost:{$gt:lcost,$lt:hcost}}]}
    }
    else if (lcost&hcost){
        query={$and:[{cost:{$gt:lcost,$lt:hcost}}],"mealTypes.mealtype_id":mealid}
    }
    db.collection('restaurant').find(query).sort(sort).skip(skip).limit(limit).toArray((err,result)=>{
        if(err) console.err(err)
        res.send(result)
    })
})

// get order
app.get('/orders',(req,res)=>{
    let {email}= req.query
    let query={}
    if(email){
        query= {"email":email}
    }
    db.collection('orders').find(query).toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})
// place the order (post request) here data will come from body instead of url
app.post('/placeOrder',(req,res)=>{
    // console.log(req.body)
    db.collection('orders').insertOne(req.body,(err,result)=>{
        if(err) throw err
        console.log(result)
        res.send('Order added')
    })
})

//with post call we can del update receive whatever we want
app.post('/menuItem', (req,res)=>{
    console.log(req.body)
    // console.log(req)
    db.collection('menu').find({menu_id:{$in:req.body}}).toArray((err,result)=>{
        if(err) console.log(err)
        res.send(result)
    })
})

// deleting the order req in database
app.delete('/deleteOrders',(req,res)=>{
    db.collection('orders').remove({},(err,result)=>{ // this will delete all the data if you want to delete specific data then pass the query
        if(err) throw err
        res.send(result)
    })
})

// update the order req in database
app.put('/updateOrders/:id',(req,res)=>{
    let oId = mongo.ObjectId(req.params.id)
    let status = req.query.status ? req.query.status:'Pending' // ternary operator
    let {bank_name, bank_status}=req.body
    db.collection('orders').updateOne({_id:oId},
        {$set:{
            "status":status,
            bank_name,
            bank_status
            
        }},
        (err,result)=>{
            console.log(status,"sasa")
        if(err) throw err
        res.send(` status updated to ${status}\n ${result}`)
    })
})


// console.log(db.collection('location').find())
MongoClient.connect(mongourl,(err,connection)=>{
    if(err)console.error(err)
    db = connection.db('novintern');
    app.listen(port,()=>{ 
        console.log(`${port} this is the port`)
    })
    
})

