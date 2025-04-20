'use strict'
const express = require('express');
const router = express.Router();
const asyncHandler = require('../../helpers/asyncHandler.js');
const ProductController = require('../../controllers/product.controller.js');
const { authenticationV2 } = require('../../auth/authUtils.js');
const upload = require('../../helpers/upload.js');

router.use(authenticationV2);

router.post('', upload.single('product_image'), asyncHandler(ProductController.updateProduct));

router.post('/publish/glasses', asyncHandler(ProductController.getGlasses))
router.post('/publish/sunglasses', asyncHandler(ProductController.getSunglasses))
router.post('/publish/optics', asyncHandler(ProductController.getOptics))
router.post('/publish', asyncHandler(ProductController.getAllPublishProduct));
router.post('/publish/slug/:slug', asyncHandler(ProductController.publishProductBySlug))
router.post('/delete/:id', asyncHandler(ProductController.deleteProduct));

module.exports = router;
