const AllCountries = require('./countries/en.json');

function validationCountriesName(value) {
  return AllCountries.find(country => country.code === value);
}

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('trip', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
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
  });

  return user;
};
