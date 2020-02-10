const router = require('express').Router();

router.use('/user', require('./user'));
router.use('/session', require('./session'));
router.use('/trip', require('./trip'));
router.use('/check', require('./check'));
router.use('/article', require('./article'));
router.use('/articles', require('./articles'));

module.exports = router;
