'use strict'
const ProductService = require("../services/product.service");
const { SuccessResponse } = require('../core/success.response');

class ProductController {
  updateProduct = async (req, res, next) => {
    const { product_id, product_type } = req.body;
    const payload = { ...req.body };
    if (req.file) {
      payload.product_image = req.file.path;
    }
    let result;
    if (product_id) {
      const exists = await ProductService.queryProductById(product_id).catch(() => null);
      result = await ProductService.updateProduct({ product_id, product_type, ...payload });
      if (exists) {
        new SuccessResponse({ message: 'Update Product Success!', metadata: result }).send(res);
      } else {
        new SuccessResponse({ message: 'Create New Product Success!', metadata: result }).send(res);
      }
    } else {
      result = await ProductService.updateProduct({ product_type, ...payload });
      new SuccessResponse({ message: 'Create New Product Success!', metadata: result }).send(res);
    }
  }

  getAllPublishProduct = async (req, res, next) => {
    const result = await ProductService.queryAllProducts();
    new SuccessResponse({ message: 'Get all published products success!', metadata: result }).send(res);
  }

  publishProductBySlug = async (req, res, next) => {
    const { slug } = req.params;
    const result = await ProductService.queryProductBySlug(slug);
    new SuccessResponse({ message: 'Query Product By Slug Success!', metadata: result }).send(res);
  }

  getGlasses = async (req, res, next) => {
    const list = await ProductService.queryProducts({ product_type: 'Glasses' })
    new SuccessResponse({
      message: 'List Glasses Success!',
      metadata: list
    }).send(res)
  }

  getSunglasses = async (req, res, next) => {
    const list = await ProductService.queryProducts({ product_type: 'Sunglasses' })
    new SuccessResponse({
      message: 'List Sunglasses Success!',
      metadata: list
    }).send(res)
  }

  getOptics = async (req, res, next) => {
    const list = await ProductService.queryProducts({ product_type: 'Optics' })
    new SuccessResponse({
      message: 'List Optics Success!',
      metadata: list
    }).send(res)
  }

  deleteProduct = async (req, res, next) => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    new SuccessResponse({ message: 'Delete Product Success!', metadata: result }).send(res);
  }
}

module.exports = new ProductController();
