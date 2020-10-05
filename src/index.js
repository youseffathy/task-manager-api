const app = require("./app");

const port = process.env.PORT;

/* A method to start the server up at specific port */
app.listen(port, () => {
  console.log("Server is up on port ", port);
});
