var mongoose = require('mongoose');

var fooditemSchema = mongoose.Schema({
  id: String,
  name: String,
  price: String,
  description: String,
  nutrition: String,
  ingredients: String,
  availability: String,
  tags: String,
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
fooditemSchema.index({name: 'text', description: 'text', tags: 'text', ingredients: 'text'}, {weights: {name: 3, tags: 2, ingredient: 1, description:1 }});


module.exports = mongoose.model('fooditem', fooditemSchema);
