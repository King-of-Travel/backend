const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        set(email) {
          this.setDataValue('email', email.toLowerCase());
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'not-email',
          },
          async unique(email) {
            await sequelize.models.user
              .findOne({ where: { email } })
              .then((user) => {
                if (user) throw new Error('not-unique-email');
              });
          },
        },
      },
      password: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          len: {
            args: [6, 64],
            msg: 'incorrect-password-field-length',
          },
        },
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          len: {
            args: [4, 16],
            msg: 'incorrect-length-username-length',
          },
          is: {
            args: ['^[a-zA-Z0-9]+$'],
            msg: 'forbidden-symbols-username',
          },
          async unique(username) {
            await sequelize.models.user
              .findOne({ where: { username } })
              .then((user) => {
                if (user) throw new Error('not-unique-username');
              });
          },
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },

    {
      hooks: {
        beforeCreate: [
          async function (user) {
            user.password = bcrypt.hashSync(user.password, 10);
          },
        ],
      },
    }
  );

  user.prototype.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };

  return user;
};
