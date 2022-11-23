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



const authenticate = (req, res, next) => {

  if (req.headers.authorization) {
    try {
      let decode = jwt.verify(req.headers.authorization, process.env.SECRETKEY)

      if (decode) {
        next();
      }

    } catch (error) {
      res.json({
        statusCode: 401,
        message: "unauthorized",
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


const roleAdmin = async(req,res,next)=>{
  if (req.headers.authorization) {
    try {
      let decode = jwt.verify(req.headers.authorization, process.env.SECRETKEY)
      console.log(decode);
      const connection = await mongoClient.connect(URL);

  
      const db = connection.db(DB);
      let user = await db.collection("users").findOne({ _id: mongodb.ObjectId(decode.id) });

       
        await connection.close();
      if (decode) {
        if(user.roll=='admin')
        {
            next()
        }
        else
        {
            res.send({
                statusCode:401,
                message:"Only Admin can access this resource"
            })
        }
      }

    } catch (error) {
      res.json({
        statusCode: 401,
        message: "unauthorized",
        error,
      })
    }

  } else {
    res.json({
      statusCode: 401,
      message: "unauthorized",
    })
  }
 
}


  router.post("/add-product",authenticate,roleAdmin, async (req, res) => {

    try {
   
      const connection = await mongoClient.connect(URL);
  
      
      const db = connection.db(DB);
  
      await db.collection("products").insertOne(req.body);
  
   
      await connection.close();
  
      res.json({
        statusCode: 201,
        message: "product Added Successfully"
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

  
  router.get("/products",authenticate,async (req, res) => {

    try {
      
      const connection = await mongoClient.connect(URL);
  
    
      const db = connection.db(DB);
  
 
  
      let products = await db.collection("products").find().toArray();
  
      
      await connection.close();
      res.json({
        statusCode: 200,
        products
      })
    } catch (error) {
     
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error
      })
    }
  });

 
  router.get("/product/:id",authenticate ,async (req, res) => {
    try {
    
      const connection = await mongoClient.connect(URL);
  

      const db = connection.db(DB);
  
   
  
      let product = await db.collection("products").findOne({ _id: mongodb.ObjectId(req.params.id) });
  
      await connection.close();
      res.json({
        statusCode: 200,
        product
      })
    } catch (error) {
      res.json({
        statusCode: 500,
        message: "Internal Server Error",
        error
      })
    }
  });



router.put("/edit-product/:id",authenticate,roleAdmin, async (req, res) => {
    try {
      
      const connection = await mongoClient.connect(URL);

      const db = connection.db(DB);
  
   
  
      await db.collection("products").findOneAndUpdate({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });
  
      await connection.close();
  
      res.json({
        statusCode: 200,
        message: "product Edited Successfully",
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


 
router.delete("/delete-product/:id",authenticate,roleAdmin, async (req, res) => {

    try {
     
      const connection = await mongoClient.connect(URL);
  
     
      const db = connection.db(DB);
  

  
      await db.collection("products").findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });
  
  
      await connection.close();
      res.json({
        statusCode: 200,
        message: "product Deleted Successfully",
  
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



  module.exports = router;