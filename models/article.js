const nanoid = require('nanoid');

const AllCountries = require('./countries/en.json');

function validationCountriesName(value) {
  return AllCountries.find(country => country.code === value);
}

module.exports = (sequelize, DataTypes) => {
  const article = sequelize.define('article', {
    id: {
      type: DataTypes.STRING(7),
      primaryKey: true,
      defaultValue: () => nanoid(7)
    },
    user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    body: {
      type: DataTypes.JSON,
      allowNull: false
    },
    countryCode: {
      type: DataTypes.STRING(2),
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
      validate: {
        len: {
          args: [2, 300],
          msg: 'incorrect-trip-city-field-length'
        }
      }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return article;
};
