Run using:

#### npm

```bash
npm run dev
```

#### pnpm

```bash
pnpm dev
```

#### bun

```bash
bun dev
```



# Todo API Documentation

This API allows you to manage a list of todos. Below are the available
routes, their methods, inputs, and outputs.

## GET /

Retrieve this documentation

- **Response** ` 200 OK ` with this api doc html page

## GET /todos

Retrieve all todos.

- **Response:** `200 OK` with JSON array of todo objects.

## GET /todo

Retrieve a random todo.

- **Response:** `200 OK` with a single todo object.
- **Error:** `404 Not Found` if no todos exist.

## POST /todo/upload

Create a new todo.

- **Request Body:** JSON with `title` (string) and `description`
  (string).
- **Response:** `200 OK` with the created todo object.
- **Error:** `400 Bad Request` if title or description is missing or
  invalid.

## GET /todo/:id

Retrieve a specific todo by its UUID.

- **URL Parameter:** `id` (UUID of the todo).
- **Response:** `200 OK` with the requested todo object.
- **Error:** `404 Not Found` if the todo does not exist.

## PATCH /todo/:id

Update an existing todo by its UUID.

- **URL Parameter:** `id` (UUID of the todo).
- **Request Body:** JSON with at least one of `title` or `description`.
- **Response:** `200 OK` with the updated todo object.
- **Error:** `400 Bad Request` if neither title nor description is
  provided.
- **Error:** `404 Not Found` if the todo does not exist.

## DELETE /todo/:id

Delete a todo by its UUID.

- **URL Parameter:** `id` (UUID of the todo).
- **Response:** `200 OK` with the deleted todo object.
- **Error:** `404 Not Found` if the todo does not exist.
