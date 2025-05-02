import { randomUUID } from "node:crypto";
import { todos } from "./todos.js";
import http from "node:http";
import {
  parseBody,
  sendJson,
  sendJsonMethodNotAllowed,
  sendJsonNoTodosFound,
} from "./utils.js";

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, DELETE, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { method, url } = req;
  const normalizedUrl = url === "/" ? url : url.replace(/\/+$/, "");
  if (normalizedUrl === "/todos") {
    if (method !== "GET") sendJsonMethodNotAllowed(res);
    switch (method) {
      case "GET":
        return sendJson(res, 200, todos);
    }
  } else if (normalizedUrl === "/todo") {
    if (method !== "GET") sendJsonMethodNotAllowed(res);
    switch (method) {
      case "GET":
        if (!todos.length) {
          return sendJsonNoTodosFound(res);
        }
        const randomTodo = todos[Math.floor(Math.random() * todos.length)];
        return sendJson(res, 200, randomTodo);
    }
  } else if (normalizedUrl === "/todo/upload") {
    if (method !== "POST") sendJsonMethodNotAllowed(res);
    switch (method) {
      case "POST":
        let parsedTodo;
        try {
          parsedTodo = await parseBody(req);
        } catch (err) {
          return sendJson(res, 400, err);
        }
        if (!parsedTodo || !parsedTodo.title || !parsedTodo.description) {
          return sendJson(res, 400, {
            error: `Invalid todo title or description. Recieved: ${parsedTodo}`,
          });
        }
        const new_id = randomUUID();
        const new_todo = {
          id: new_id,
          title: parsedTodo.title,
          description: parsedTodo.description,
        };
        todos.push(new_todo);
        return sendJson(res, 200, { message: "Success", data: new_todo });
    }
  } else if (
    /^\/todo\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.test(
      normalizedUrl
    )
  ) {
    if (method !== "GET" && method !== "PATCH" && method !== "DELETE")
      sendJsonMethodNotAllowed(res);
    const parsedTodoId = normalizedUrl.slice(6); //TODO)) this can be checked later, it works. Not validating here because its already being validated
    const todoIndex = todos.findIndex((t) => t.id === parsedTodoId);
    if (todoIndex === -1) {
      return sendJson(res, 404, {
        error: `Todo with id: ${parsedTodoId} not found`,
      });
    }
    switch (method) {
      case "GET":
        return sendJson(res, 200, todos[todoIndex]);
      case "PATCH":
        let parsedTodo;
        try {
          parsedTodo = await parseBody(req);
        } catch (err) {
          return sendJson(res, 400, err);
        }
        if (!parsedTodo.title && !parsedTodo.description) {
          return sendJson(res, 400, {
            error: `At least one of title or description must be provided for PATCH. Recieved: ${parsedTodo}`,
          });
        }
        if (parsedTodo.title) {
          todos[todoIndex].title = parsedTodo.title;
        }
        if (parsedTodo.description) {
          todos[todoIndex].description = parsedTodo.description;
        }
        return sendJson(res, 200, todos[todoIndex]);
      case "DELETE":
        const removed_todo = todos.splice(todoIndex, 1);
        return sendJson(res, 200, removed_todo);
    }
  } else {
    return sendJson(res, 404, { error: "Route not found" });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
