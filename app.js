let express = require('express');
let app = express();
/// for reading value form .env 
let dotenv = require('dotenv');
dotenv.config()
// for logging purposes
let morgan = require('morgan');
let fs = require('fs');
let port = process.env.PORT || 9800;
let cors = require('cors');
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl = "mongodb+srv://altamash:altamash123@cluster0.brx6f0g.mongodb.net/Amazon?retryWrites=true&w=majority";
let bodyParser = require('body-parser')
let db;


// middleware
app.use(morgan('short',{stream:fs.createWriteStream('./app.logs')}))
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send('This is From Express App code')
})

//LIST OF QUICK SEARCH
app.get('/category',(req,res) => {
    db.collection('category').find().toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//LIST OF ITEMS WRT QUICK SEARCH
app.get('/category/:category_id',(req,res) => {
    let category_id =Number(req.params.category_id)
    db.collection('products').find({category_id:category_id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})


//DETAILS OF THE ITEM SELECTED(Based on ID)
app.get('/details/:product_id',(req,res) => {
    let product_id =Number(req.params.product_id)
    db.collection('electronic').find({product_id:product_id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//OTHER PRODUCTS OF THE SAME COMPANY
app.get('/similar_products/:seller_id',(req,res) => {
    let seller_id =Number(req.params.seller_id)
    db.collection('electronic').find({seller_id:seller_id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//LIST OF ORDERS
app.get('/orders',(req,res) => {
    let email = req.query.email
    let query ={};
    if(email){
        query={email}
    }
    db.collection('orders').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//LIST OF ORDERS WRT TO EMAIL
app.get('/orders/:email_id',(req,res) => {
    let email_id = req.params.email_id
    db.collection('orders').find({email_id:email_id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//PLACE ORDER(POST)
app.post('/placeorder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('Order Placed')
    })
})

//ORDER DETAILS - SELECTED ITEMS(POST)
app.post('/selectedItem',(req,res) => {
    if(Array.isArray(req.body.id)){
        db.collection('electronic').find({product_id:{$in:req.body.id}}).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Inavlid Input')
    }
})

//UPDATE ORDER DETAILS(PUT)
app.put('/updateOrder/:order_id',(req,res) => {
    let oid = Number(req.params.order_id);
    db.collection('orders').updateOne(
        {order_id:oid},
        {
            $set:{
                "status":req.body.status,
                "bank_name":req.body.bank_name,
                "date":req.body.date
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Order Updated')
        }
    )
})

//DELETE ORDER(DELETE)
app.delete('/deleteOrder/:id',(req,res) => {
    let _id = mongo.ObjectId(req.params.id);
    db.collection('orders').deleteOne({_id},(err,result) => {
        if(err) throw err;
        res.send('Order Deleted')
    })
})


//connection with mongo
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) console.log(`Error while connecting`);
    db = client.db('Amazon')
    app.listen(port,() => {
        console.log(`Listing to port ${port}`)
    })
})
