const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from the Node.js CI/CD demo!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
