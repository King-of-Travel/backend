const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/session', require('./session'));

module.exports = router;
