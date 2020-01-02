const nanoid = require('nanoid');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'trip',
    {
      id: {
        type: DataTypes.STRING(7),
        primaryKey: true,
        allowNull: false
      },
      author: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          max: {
            args: 150,
            msg: 'not-correct-trip-name-length'
          }
        }
      },
      countryCode: {
        type: DataTypes.STRING(2),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(2500),
        validate: {
          max: {
            args: 2500,
            msg: 'not-correct-trip-description-length'
          }
        }
      },
      city: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
          len: {
            args: [2, 300],
            msg: 'not-correct-trip-city-length'
          }
        }
      },
      startDate: {
        type: DataTypes.DATE
      },
      endDate: {
        type: DataTypes.DATE
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },

    {
      hooks: {
        beforeValidate: [
          function createId(trip) {
            trip.id = nanoid(7);
          },
          async function setUser(trip) {
            const user = trip.author;

            if (typeof user === 'number') return;

            await sequelize.models.user
              .findOne({
                where: { email: trip.author },
                attributes: ['id']
              })
              .then(user => {
                trip.author = user.id;
              });
          }
        ]
      }
    }
  );

  return user;
};
