module.exports = (sequelize, DataTypes) => {
  const articleTags = sequelize.define('articleTags', {
    articleId: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return articleTags;
};
