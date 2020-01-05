const nanoid = require('nanoid');

const AllCountries = require('./countries/en.json');

function validationCountriesName(value) {
  return AllCountries.find(country => country.code === value);
}

function validationDateFutureTrip(value) {
  if (isNaN(Date.parse(value))) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (value < yesterday) return false;

  return true;
}

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
      title: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
          len: {
            args: [0, 150],
            msg: 'incorrect-trip-title-length'
          },
          is: {
            args: ['[a-zA-Z0-9]+'],
            msg: 'forbidden-symbols-title-trip'
          }
        }
      },
      countryCode: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
          correctCode(code) {
            const validate = validationCountriesName(code);

            if (!validate) {
              throw new Error('incorrect-trip-country-code');
            }
          }
        }
      },
      city: {
        type: DataTypes.STRING(300),
        allowNull: false,
        validate: {
          len: {
            args: [2, 300],
            msg: 'incorrect-trip-city-field-length'
          }
        }
      },
      article: {
        type: DataTypes.STRING(2500),
        validate: {
          len: {
            args: [0, 2500],
            msg: 'incorrect-trip-article-length'
          }
        }
      },
      private: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: {
            args: true,
            msg: 'incorrect-start-date-trip-field'
          }
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: {
            args: true,
            msg: 'incorrect-end-date-trip-field'
          }
        }
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
