var express = require('express');
var router = express.Router();
const mongodb = require("mongodb")
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const mongoClient = mongodb.MongoClient
const URL = process.env.DB;
const DB = "rental_database";




router.post("/register", async (req, res) => {

  try {
    
    const connection = await mongoClient.connect(URL);

 
    const db = connection.db(DB);


    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);

    req.body.password = hash

 
    await db.collection("users").insertOne(req.body);

    
    await connection.close();

    res.json({
      statusCode: 201,
      message: " user Register Successfully"
    })
  } catch (error) {
    console.log(error);
    
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});


router.post("/login", async (req, res) => {

  try {

    const connection = await mongoClient.connect(URL);

    const db = connection.db(DB);


    let user = await db.collection("users").findOne({ email: req.body.email })

    if (user) {
      
      let compare = await bcrypt.compare(req.body.password, user.password)
      if (compare) {
        let token = jwt.sign({ id: user._id },process.env.SECRETKEY, { expiresIn: "1h" });
        res.json({
          statusCode:201,
          message: "login successfully",
          token,
          user,
        })
      } else {
        res.json({
          statusCode: 401,
          message: "Invaild Email / Password"
        })
      }
    } else {
      res.json({
        statusCode: 401,
        message: "Invaild Email / Password"
      })
    }

    await connection.close();
  } catch (error) {
    console.log(error);
  
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});


router.post("/reset-sendmail", async (req, res) => {



  try {



const connection = await mongoClient.connect(URL);


const db = connection.db(DB);


let user = await db.collection("users").findOne({ email: req.body.email })


if(user){
  let token = jwt.sign({ id: user._id },process.env.SECRETKEY, { expiresIn: "10m" });

  let url = `${process.env.BASE_URL}/password/${user._id}/${token}`

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 993,
      secure: false, 
      auth: {
        user: process.env.EMAILUSE, 
        pass: process.env.EMAILPASS, 
      },
    }); 
  let details = {
  from: "sivanathanv36@gmail.com",
  to: user.email,
  subject: "Hello ✔", 
  text: `Reset link`, 
  html: `<a href=${url}>Password Reset Link Click here !!!</a>`
  }
  
    await transporter.sendMail(details,(err)=>{
         if(err){
          res.json({
              statusCode: 200,
              message:"it has some error for send a mail",
            })
         
         }else{
          res.json({
              statusCode: 200,
              message:"Password Reset link send in your mail",
            })
         }
    });


}else{
  res.json({
      statusCode: 401,
      message: "Invaild Email",
      
    })
}


await connection.close();
   
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
      error
    })
  }
});





const authenticate = (req, res, next) => {
 
  if (req.body.token) {
    try {
     
      let decode = jwt.verify(req.body.token, process.env.SECRETKEY)
      if (decode) {
        next();
      }

    } catch (error) {
      res.json({
        statusCode: 401,
        message: "Your token is expiry",
        error,
      })
    }

  } else {
    res.json({
      message: 401,
      statusbar: "unauthorized"
    })
  }

}





router.post("/password-reset",authenticate, async(req,res)=>{
try {


 const connection = await mongoClient.connect(URL);


 const db = connection.db(DB);

 let salt = await bcrypt.genSalt(10);
 let hash = await bcrypt.hash(req.body.password, salt);

 req.body.password = hash


 await db.collection("users").updateOne({ _id: mongodb.ObjectId(req.body.id)},{$set:{ password: req.body.password }})
res.json({
  statusCode: 201,
  message:"Password Reset successfully",
})
  
} catch (error) {
  
}

})




module.exports = router;
