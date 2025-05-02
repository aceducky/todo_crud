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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  const { method, url } = req;
  const normalizedUrl = url === "/" ? url : url.replace(/\/+$/, "");
  
  if (normalizedUrl === "/") {
  
    if (method !== "GET") sendJsonMethodNotAllowed(res);
  
    switch (method) {
      case "GET":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Todo API Documentation</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                h1, h2 { color: #333; }
                pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
                code { color: #c7254e; background: #f9f2f4; padding: 2px 4px; border-radius: 4px; }
              </style>
            </head>
            <body>
              <h1>Todo API Documentation</h1>
              <p>This API allows you to manage a list of todos. Below are the available routes, their methods, inputs, and outputs.</p>
              <h2>GET /</h2>
              <p>Retrieve this documentation</p>
              <ul>
              <li><strong>Response</strong> <code> 200 OK </code> with this api doc html page</li>
              </ul>
              <h2>GET /todos</h2>
              <p>Retrieve all todos.</p>
              <ul>
                <li><strong>Response:</strong> <code>200 OK</code> with JSON array of todo objects.</li>
              </ul>
              <h2>GET /todo</h2>
              <p>Retrieve a random todo.</p>
              <ul>
                <li><strong>Response:</strong> <code>200 OK</code> with a single todo object.</li>
                <li><strong>Error:</strong> <code>404 Not Found</code> if no todos exist.</li>
              </ul>
              <h2>POST /todo/upload</h2>
              <p>Create a new todo.</p>
              <ul>
                <li><strong>Request Body:</strong> JSON with <code>title</code> (string) and <code>description</code> (string).</li>
                <li><strong>Response:</strong> <code>200 OK</code> with the created todo object.</li>
                <li><strong>Error:</strong> <code>400 Bad Request</code> if title or description is missing or invalid.</li>
              </ul>
              <h2>GET /todo/:id</h2>
              <p>Retrieve a specific todo by its UUID.</p>
              <ul>
                <li><strong>URL Parameter:</strong> <code>id</code> (UUID of the todo).</li>
                <li><strong>Response:</strong> <code>200 OK</code> with the requested todo object.</li>
                <li><strong>Error:</strong> <code>404 Not Found</code> if the todo does not exist.</li>
              </ul>
              <h2>PATCH /todo/:id</h2>
              <p>Update an existing todo by its UUID.</p>
              <ul>
                <li><strong>URL Parameter:</strong> <code>id</code> (UUID of the todo).</li>
                <li><strong>Request Body:</strong> JSON with at least one of <code>title</code> or <code>description</code>.</li>
                <li><strong>Response:</strong> <code>200 OK</code> with the updated todo object.</li>
                <li><strong>Error:</strong> <code>400 Bad Request</code> if neither title nor description is provided.</li>
                <li><strong>Error:</strong> <code>404 Not Found</code> if the todo does not exist.</li>
              </ul>
              <h2>DELETE /todo/:id</h2>
              <p>Delete a todo by its UUID.</p>
              <ul>
                <li><strong>URL Parameter:</strong> <code>id</code> (UUID of the todo).</li>
                <li><strong>Response:</strong> <code>200 OK</code> with the deleted todo object.</li>
                <li><strong>Error:</strong> <code>404 Not Found</code> if the todo does not exist.</li>
              </ul>
            </body>
          </html>
        `);
        return;
    }
  } 
  else if (normalizedUrl === "/todos") {

    if (method !== "GET") sendJsonMethodNotAllowed(res);

    switch (method) {
      case "GET":
        return sendJson(res, 200, todos);
    }
  } 
  else if (normalizedUrl === "/todo") {

    if (method !== "GET") sendJsonMethodNotAllowed(res);

    switch (method) {
      case "GET":
        if (!todos.length) {
          return sendJsonNoTodosFound(res);
        }

        const randomTodo = todos[Math.floor(Math.random() * todos.length)];
        return sendJson(res, 200, randomTodo);
    }
  } 
  else if (normalizedUrl === "/todo/upload") {

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
        return sendJson(res, 200, new_todo);
    }
  } 
  else if (
    /^\/todo\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/
      .test(
        normalizedUrl,
      )
  ) {

    if (method !== "GET" && method !== "PATCH" && method !== "DELETE") {
      sendJsonMethodNotAllowed(res);
    }

    const parsedTodoId = normalizedUrl.slice(6);
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
            error:
              `At least one of title or description must be provided for PATCH. Recieved: ${parsedTodo}`,
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
  } 
  else {
    return sendJson(res, 404, { error: "Route not found" });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
