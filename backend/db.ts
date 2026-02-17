
import { Sequelize } from 'sequelize';

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:wdm@localhost:3306/true_money_gold";

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MariaDB Connection established via Sequelize.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    // Fixed: Cast process to any to avoid "Property 'exit' does not exist on type 'Process'" error
    (process as any).exit(1);
  }
};
