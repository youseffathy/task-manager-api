const mongoose = require("mongoose");
const chalk = require("chalk");

//establishing a connection to mongoDB server
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//test connection
const connection = mongoose.connection;
connection.on("error", console.error.bind(console, chalk.red.bold("Connection Error !!")));
connection.once("open", () => {
  console.log(chalk.bold.rgb(22, 159, 6)("Database Connection Opened"));
});
