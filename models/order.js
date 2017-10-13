var mongoose = require('mongoose');

var orderSchema = mongoose.Schema({
  id: String,
  fooditems: [{
    fooditem : String,
    instruction : String
     }], /* {
             "lat": 50.3293714,
             "lng": 6.9389939
           }
           */
  price: String,
  location: String,
  orderby: String,
  phone: Number,
  revoked: {type: Boolean, default: false},
  deliverystate: {type: Boolean, default:false},
  orderdate: {
    type: Date,
    default: Date.now
  },
  deliverytime: {
    type: Date,
    default: Date.now
  },
});

/**
 *Schema methods
 */
orderSchema.index({name: 'text'}, { weights: {name: 1 }});


module.exports = mongoose.model('order', orderSchema);
