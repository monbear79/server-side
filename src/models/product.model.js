'use strict'

const { model, Schema } = require('mongoose');
const slugify = require('slugify');
const DOCUMENT_NAME = 'Glasses';
const COLLECTION_NAME = 'Glasses';

const productSchema = new Schema({
  product_id: { type: String, required: true, unique: true },
  product_name: { type: String, required: true },
  product_image: { type: String, required: true },
  product_slug: { type: String },
  product_type: { type: String, required: true, enum: ['Glasses', 'Sunglasses', 'Optics'] },
  product_price: { type: Number, required: true },
  product_description: { type: String },
  product_genderOptions: { type: String, required: true, enum: ['male', 'female', 'unisex'] },
  product_status: { type: String, required: true, enum: ['active', 'inactive'] }
}, {
  collection: COLLECTION_NAME,
  timestamps: true
});

productSchema.pre('save', function(next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

module.exports = model(DOCUMENT_NAME, productSchema);
