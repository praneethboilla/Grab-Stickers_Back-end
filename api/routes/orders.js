const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const auth = require('../middleware/authenticate');

router.get('/', auth ,(req, res, next) => {
    Order.find({user: req.userData.userId})
        .populate('products.product')
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        products: doc.products.map(item => ({
                            product: item.product, 
                            quantity: item.quantity
                        })),
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }
                    };
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', auth ,(req, res, next) => {
    const orderItems = req.body.products; 
    const productPromises = orderItems.map(item => 
        Product.findById(item.productId)
            .then(product => {
                if (!product) {
                    return Promise.reject({ message: `Product with ID ${item.productId} not found` });
                }
                return {
                    product: product._id,
                    quantity: item.quantity
                };
            })
    );

    Promise.all(productPromises)
        .then(validItems => {
            // If all products are valid, create the order
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                user: req.userData.userId,
                products: validItems
            });

            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Created Order successfully',
                createdOrder: {
                    _id: result._id,
                    products: result.products,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


router.get('/:orderId', auth ,(req, res, next) => {
    Order.findOne({ _id: req.params.orderId, user: req.userData.userId })
    .populate('products.product')
    .then(order => {
        if (!order) {
            res.status(404).json({
                message: "Order not found"
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        });
    })
    .catch(err => {
        res.status(500).json({error: err});
    });
});

router.delete('/:orderId', auth ,(req, res, next) => {
    Order.findOneAndDelete({ _id: req.params.orderId, user: req.userData.userId })
    .then(result => {
        if (!result) {
            return res.status(404).json({
                message: "Order not found or you don't have permission to delete it"
            });
        }
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: {productId: 'ID', quantity: 'Number'}
            }
        });
    })
    .catch(err => {
        res.status(500).json({error: err});
    })
});

module.exports = router;