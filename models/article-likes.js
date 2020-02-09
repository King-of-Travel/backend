module.exports = (sequelize, DataTypes) => {
  const articleLikes = sequelize.define('articleLikes', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    articleId: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return articleLikes;
};
