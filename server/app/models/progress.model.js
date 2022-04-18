module.exports = (sequelize, Sequelize) => {
  const Progress = sequelize.define('progress', {
    input_file_path: {
      type: Sequelize.STRING
    },
    output_file_path: {
      type: Sequelize.STRING
    },
    client_id: {
      type: Sequelize.STRING
    },
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
