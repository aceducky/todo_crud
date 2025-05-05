import { todos } from "./todos.js";

function test_todo_with_uuid_route() {
  const urlWithUUIDRegex =
    /^\/todo\/\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b\/?$/;
  let found_invalid = 0;
  let found_valid = 0;
  todos.forEach((todoItem) => {
    const isValidURL = urlWithUUIDRegex.test(`/todo/${todoItem.id}`);
    if (isValidURL) {
      found_valid++;
      console.log(`VALID ID: ${todoItem.id}`);
    } else {
      found_invalid++;
      console.error(
        `\n**************************************************************
Error: INVALID ID: ${todoItem.id}
***************************************************************\n
      `,
      );
    }
  });
  console.log(`Valid IDs: ${found_valid}`);
  console.log(`Invalid IDs: ${found_invalid}`);
  console.log(`Total IDs: ${todos.length}`);
}

test_todo_with_uuid_route();
