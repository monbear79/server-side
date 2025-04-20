'use strict'
const { BadRequestError } = require('../core/error.response');
const ProductModel = require('../models/product.model');

class ProductFactory {
  static productRegistry = {};
  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }
  static async updateProduct({ product_id, product_type, ...payload }) {
    if (product_id) {
      const exists = await ProductModel.findOne({ product_id });
      if (!exists) {
        const finalType = product_type || 'Glasses';
        return await ProductModel.create({ ...payload, product_type: finalType, product_id });
      } else {
        if (payload.product_type && payload.product_type !== exists.product_type) {
          throw new BadRequestError('Cannot change product type for an existing product. Please delete and create a new product if necessary.');
        }
        const updated = await ProductModel.updateOne({ product_id }, payload);
        if (updated.nModified === 0) throw new BadRequestError('Update failed or no changes made.');
        return updated;
      }
    } else {
      const finalType = product_type || 'Glasses';
      const ProductClass = ProductFactory.productRegistry[finalType];
      if (!ProductClass) throw new BadRequestError(`Invalid Product Type ${finalType}`);
      const productInstance = new ProductClass({ ...payload, product_type: finalType });
      const newId = await productInstance.generateProductId();
      return await ProductModel.create({ ...productInstance, product_id: newId });
    }
  }
  static async queryProducts(filters = {}) {
    const query = { ...filters, product_status: 'active' };
    return await ProductModel.find(query);
  }
  static async queryProductBySlug(product_slug) {
    const product = await ProductModel.findOne({ product_slug });
    if (!product) throw new BadRequestError('Product not found');
    return product;
  }

  static async queryProductById(product_id) {
    const prod = await ProductModel.findOne({ product_id });
    if (!prod) throw new BadRequestError('Product not found');
    return prod;
  }

  static async queryAllProducts()
  {
    return await ProductModel.find({});
  }

  static async deleteProduct(product_id) {
    const result = await ProductModel.deleteOne({ product_id });
    if (result.deletedCount === 0) throw new BadRequestError('Delete failed: Product not found.');
    return result;
  }
}

class Product {
  constructor({ product_name, product_image, product_type, product_price, product_description, product_genderOptions, product_status, product_id }) {
    this.product_name = product_name;
    this.product_image = product_image;
    this.product_type = product_type;
    this.product_price = product_price;
    this.product_description = product_description;
    this.product_genderOptions = product_genderOptions;
    this.product_status = product_status;
    if (product_id) this.product_id = product_id;
  }
  async generateProductId() {
    let classificationCode;
    switch (this.product_type) {
      case 'Optics':
        classificationCode = 'GL01';
        break;
      case 'Sunglasses':
        classificationCode = 'GL02';
        break;
      case 'Glasses':
        classificationCode = 'GL03';
        break;
      default:
        classificationCode = 'XXXX';
    }
    const prefix = 'GLAS' + classificationCode;
    const count = await ProductModel.countDocuments({ product_id: { $regex: `^${prefix}` } });
    const sequence = (count + 1).toString().padStart(4, '0');
    return prefix + sequence;
  }
}

class GlassesProduct extends Product {
  constructor(payload) {
    super({ ...payload, product_type: 'Glasses' });
  }
}

class SunglassesProduct extends Product {
  constructor(payload) {
    super({ ...payload, product_type: 'Sunglasses' });
  }
}

class OpticsProduct extends Product {
  constructor(payload) {
    super({ ...payload, product_type: 'Optics' });
  }
}

ProductFactory.registerProductType('Glasses', GlassesProduct);
ProductFactory.registerProductType('Sunglasses', SunglassesProduct);
ProductFactory.registerProductType('Optics', OpticsProduct);

module.exports = ProductFactory;
