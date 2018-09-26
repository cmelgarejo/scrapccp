module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'member',
    {
      cpp_id: DataTypes.STRING,
      doc_no: DataTypes.STRING,
      name: DataTypes.TEXT,
      category: DataTypes.TEXT,
      state: DataTypes.TEXT,
      debt: DataTypes.TEXT,
      pic: DataTypes.TEXT,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['doc_no'],
        },
      ],
    },
  )
