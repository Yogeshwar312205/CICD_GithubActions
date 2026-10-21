const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("node:http");
const app = require("./app");

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function get(serverPort, path) {
  return new Promise((resolve, reject) => {
    request.get({ hostname: "localhost", port: serverPort, path }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        resolve({ statusCode: response.statusCode, body });
      });
    }).on("error", reject);
  });
}

test("GET / returns the homepage", async () => {
  const { server, port } = await startTestServer();

  try {
    const response = await get(port, "/");
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Hello from the Node\.js CI\/CD demo!/);
  } finally {
    server.close();
  }
});

test("GET /health returns a healthy status", async () => {
  const { server, port } = await startTestServer();

  try {
    const response = await get(port, "/health");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: "ok" });
  } finally {
    server.close();
  }
});
