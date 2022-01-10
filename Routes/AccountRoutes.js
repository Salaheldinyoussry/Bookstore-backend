const express = require('express');
const UsersController = require('../Controllers/UsersController');
const router = express.Router();

router.post('/login', UsersController.login);
router.post('/signup', UsersController.signup);
router.get('/get', UsersController.get);
router.put('/update', UsersController.update);
router.post('/logout', UsersController.logout);

router.get('/all', UsersController.getAll);

router.post('/promote', UsersController.promote);
router.post('/confirm', UsersController.confirmOrder);

router.get('/analytics', UsersController.getanalytics);



//

// router.get('/userProfile', auth, accountController.getUserProfile);
// router.put('/updateCountry', auth, accountController.updateCountry);
// router.put('/updateBio', auth, accountController.updateBio);
// router.put('updatePhoto',auth,)


module.exports = router;