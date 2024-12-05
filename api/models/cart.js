const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    products: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1, required: true } 
        }
    ],
    dateAdded: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Cart', cartSchema);

