const express = require('express');
const BookController = require('../Controllers/BookController');
const router = express.Router();

router.get('/all', BookController.get);
router.post('/addToCart', BookController.addTocart);
router.get('/cart', BookController.getCart);
router.delete('/cartItem', BookController.removeFromCart);
router.post('/cart/checkout', BookController.checkoutCart);
router.get('/getOrders', BookController.getOrders);
router.post('/order', BookController.addOrder);

router.post('/add', BookController.add);

router.put('/update', BookController.update);

//router.post('/signup', UsersController.signup);
// router.get('/userProfile', auth, accountController.getUserProfile);
// router.put('/updateCountry', auth, accountController.updateCountry);
// router.put('/updateBio', auth, accountController.updateBio);
// router.put('updatePhoto',auth,)


module.exports = router;