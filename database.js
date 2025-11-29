const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// SQLite database setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'data', 'family_tree.db'),
  logging: false
});

// Person model
const Person = sequelize.define('Person', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true
  },
  birth_date: {
    type: DataTypes.STRING,
    allowNull: true
  },
  death_date: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_adopted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'persons',
  timestamps: true
});

// Relationship model
const Relationship = sequelize.define('Relationship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  person1_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Person,
      key: 'id'
    }
  },
  person2_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Person,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    // Types: 'spouse', 'ex_spouse', 'parent_child'
  }
}, {
  tableName: 'relationships',
  timestamps: true
});

// Initialize database
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('データベース接続成功');
    await sequelize.sync({ alter: true });
    console.log('データベーステーブル作成完了');
  } catch (error) {
    console.error('データベース接続エラー:', error);
  }
}

module.exports = {
  sequelize,
  Person,
  Relationship,
  initDatabase
};
