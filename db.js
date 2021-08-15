const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = connectDataBase = async () => {
  try {
    const databaseConnection = await mongoose.connect(process.env.DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log(`Database connected ::: ${databaseConnection.connection.host}`);
  } catch (error) {
    console.error(`Error::: ${error.message}`);
    process.exit(1);
  }
};