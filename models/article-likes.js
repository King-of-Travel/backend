module.exports = (sequelize, DataTypes) => {
  const articleLikes = sequelize.define('articleLikes', {
    idUser: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idArticle: {
      type: DataTypes.STRING(7),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return articleLikes;
};
