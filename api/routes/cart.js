const express = require('express');
const Cart = require('../models/cart');
const Product = require('../models/product');
const { mongoose } = require('mongoose');
const auth = require('../middleware/authenticate');

const router = express.Router();

// Route to get the cart
router.get('/', auth, (req, res) => {
    Cart.findOne({user: req.userData.userId})
    .populate('products.product')
        .then(cart => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart is empty or not found' });
            }
            res.status(200).json(cart);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving the cart' });
        });
});

router.post('/', auth, (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
        return res.status(400).json({ message: "ProductID and quantity are required" });
    }

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            // if we want to fetching the cart for the logged-in user, you can add a user check here
            Cart.findOne({ user: req.userData.userId }) 
                .then(cart => {
                    if (!cart) {
                        cart = new Cart({
                            _id: new mongoose.Types.ObjectId(), 
                            user: req.userData.userId,
                            products: [],
                        });
                    }
                    const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);
                    if (existingProductIndex >= 0) {
                        cart.products[existingProductIndex].quantity += quantity;
                    } else {
                        cart.products.push({
                            product: productId,
                            quantity: quantity,
                        });
                    }
                    return cart.save(); 
                })
                .then(updatedCart => {
                    res.status(200).json(updatedCart);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ message: 'Error handling the cart' });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error fetching product from the Products collection' });
        });
});

router.delete('/:productId', auth, (req, res) => {
    const { productId } = req.params;  
    Cart.findOne({ user: req.userData.userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }
            cart.products.splice(productIndex, 1);
            return cart.save();
        })
        .then(updatedCart => {
            res.status(200).json(updatedCart); 
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error handling the cart' });
        });
});

router.patch('/:productId', auth, (req, res) => {
    const { productId } = req.params;  
    const { quantity } = req.body;     

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive number" });
    }
    Cart.findOne({ user: req.userData.userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            // Find the product in the cart
            const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }
            cart.products[productIndex].quantity = quantity;
            return cart.save();
        })
        .then(updatedCart => {
            res.status(200).json(updatedCart); 
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error handling the cart' });
        });
});

router.delete('/', auth, (req, res) => {
    Cart.findOne({ user: req.userData.userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            // Clear all products from the cart
            cart.products = [];  // Set products array to empty
            
            return cart.save();  // Save the updated cart
        })
        .then(updatedCart => {
            res.status(200).json(updatedCart);  
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Error clearing the cart' });  
        });
});

module.exports = router;
