const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup',(req, res, next) => {
    User.findOne({ email: req.body.email }).then(
        user => {
            if(user){
                return res.status(409).json({
                    message: "Mail exists"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                        .then(result => {
                            console.log("create",result);
                            res.status(201).json({
                                message: "User created",
                                userId: result._id
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    }
                });
            }
        }
    )
});

router.post('/login', (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if(!user){
            return res.status(401).json({
                message: "Authentication failed or User does not exist"
            });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: "Authentication failed or User does not exist"
                });
            }
            if(result){
                const token = jwt.sign({email: user.email, userId: user._id},
                    process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE}
                );
                return res.status(200).json({
                    message: "Authentication Successful",
                    token:token
                });
            }
            res.status(401).json({
                message: "Authentication failed"
            });
        });
    })
    .catch(err => {
        console.log("error in login",err);
        res.status(500).json({error:err});
    });
});

router.delete('/:userId', (req, res, next) => {
    User.findByIdAndDelete({_id: req.params.userId})
    .then(result => {
        res.status(200).json({
            message: "User Deleted"
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;