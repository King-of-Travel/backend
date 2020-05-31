'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

const isDevelopment = process.env.NODE_ENV === 'development';

let sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_ROLE,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    logging: isDevelopment ? console.log : false,
  }
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user.hasMany(db.article, { as: 'articles' });
db.user.hasMany(db.trip, { as: 'trips' });

db.article.hasMany(db.articleLikes, { as: 'likes' });
db.article.hasMany(db.articleTags, { as: 'tags' });
db.article.belongsTo(db.user);

db.articleLikes.belongsTo(db.article);

db.articleTags.belongsTo(db.article);

db.trip.belongsTo(db.user);

module.exports = db;
