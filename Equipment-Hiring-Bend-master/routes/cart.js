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




 
  router.post("/addToCart", async (req, res) => {

    try {
      
      const connection = await mongoClient.connect(URL);
  console.log(req.body);
     
      const db = connection.db(DB);
  
    
     let data =  await db.collection("carts").insertOne(req.body);
      
      await connection.close();
  
      res.json({
        statusCode: 201,
        message: "Added Successfully",
        data
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



  router.post("/send_mail", async (req, res) => {
 
    try {

      console.log(req.body);
      
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
        to: req.body.email, 
        subject: "Hello ✔", 
        text:"Equipment Hiring", 
     
        html: `<div className="email" style="border: 1px solid black;padding: 20px;font-family: sans-serif;line-height: 2;font-size: 20px; ">
               
                          <h2> Hello ${req.body.name} your order Amount paid......... </h2>
                          <p> Your Order Id = ${req.body.orderid}</p>
                          <p> Your Payment Id = ${req.body.paymentid}</p>
                          <p>All the best ${req.body.name} Vist for next time </p>
      
               </div>`
      }
      
          let info = await transporter.sendMail(details,(err)=>{
               if(err){
                res.json("it has some error")
               }else{
                res.json({
                  val : "Mail send successfully",
                  statusCode : 200
                  
                })
               }
          });
      
        } catch (error) {
          res.json({
            statusCode: 500,
            message: "Internal Server Error",
            error
          })
        }
  
  
  
  
  
  });









module.exports = router;
