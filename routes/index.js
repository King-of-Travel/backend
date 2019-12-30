const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/session', require('./session'));
router.use('/trip', require('./trip'));

module.exports = router;
