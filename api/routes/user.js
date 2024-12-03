const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

//
// router.get('/',(req, res, next) => {
//     User.find().then(docs => {
//         const response = {
//             count: docs.length,
//             users: docs.map(doc => {
//                 return {
//                     _id: doc._id,
//                     email: doc.email,
//                     request: {
//                         type: 'DELETE',
//                         url: 'http://localhost:3000/user/' + doc._id
//                     }
//                 }
//             })
//         };
//         res.status(200).json(response)
//     }) .catch(err => {
//         console.log(err);
//         res.status(500).json({error: err});
//     });
// })

router.post('/signup',(req, res, next) => {
    User.find({ email: req.body.email }).then(
        user => {
            if(user.length >= 1){
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
                                message: "User created"
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