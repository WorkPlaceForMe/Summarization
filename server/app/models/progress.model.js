module.exports = (sequelize, Sequelize) => {
  const Progress = sequelize.define('progress', {
    progress_value: {
      type: Sequelize.INTEGER
    },
    createdAt: {
      type: Sequelize.DATE
    },
    updatedAt: {
      type: Sequelize.DATE
    }
  }, {
    freezeTableName: true
  })

  return Progress
}
