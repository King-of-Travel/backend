const express = require('express');
const createError = require('http-errors');
const Op = require('sequelize').Op;

const models = require('../models');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(createError(404, res.__('no-username-password')));
  }

  models.user
    .findOne({
      where: { [Op.or]: [{ username }, { email: username }] },
      attributes: ['id', 'email', 'password', 'username']
    })
    .then(user => {
      if (!user || !user.isValidPassword(password)) {
        return next(createError(404, res.__('incorrect-username-password')));
      }

      const token = user.createToken();
      const { email, username } = user;

      res.status(201).json({
        token,
        user: { email, username }
      });
    })
    .catch(next);
});

module.exports = router;
