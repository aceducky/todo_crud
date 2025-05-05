export const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (data) => (body += data));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid Json"));
      }
    });
  });

export const sendJson = (res, httpCode, data) => {
  res.writeHead(httpCode, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
};

export const sendJsonNoTodosFound = (res) => {
  sendJson(res, 400, { error: "No todos found" });
};

export const sendJsonMethodNotAllowed = (res) => {
  sendJson(res, 400, { error: "Method Not Allowed" });
};
