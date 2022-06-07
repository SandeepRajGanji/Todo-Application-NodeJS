const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const app = express();

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertTodoDueDateToResponse = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusAndPriority = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};
const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  let todo = null;
  let getTodo = "";
  const { status, category, priority, search_q = "" } = requestQuery;
  switch (true) {
    case hasStatus(requestQuery):
      getTodo = `SELECT * FROM todo WHERE status = '${status}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      if (todo.length !== 0) {
        response.send(
          todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(requestQuery):
      getTodo = `SELECT * FROM todo WHERE priority = '${priority}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      if (todo.length !== 0) {
        response.send(
          todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusAndPriority(requestQuery):
      getTodo = `SELECT * FROM todo WHERE status = '${status}' and priority = '${priority}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      response.send(
        todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
      );
      break;
    case hasCategoryAndStatus(requestQuery):
      getTodo = `SELECT * FROM todo WHERE category = '${category}' and status = '${status}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      response.send(
        todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
      );
      break;
    case hasCategory(requestQuery):
      getTodo = `SELECT * FROM todo WHERE category = '${category}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      if (todo.length !== 0) {
        response.send(
          todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriority(requestQuery):
      getTodo = `SELECT * FROM todo WHERE category = '${category}' and priority = '${priority}' and todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      response.send(
        todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
      );
      break;
    default:
      getTodo = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
      todo = await db.all(getTodo);
      response.send(
        todo.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
      );
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `SELECT * FROM todo WHERE id = ${todoId};`;
  const getTodoResult = await db.get(getTodo);
  response.send(convertTodoDueDateToResponse(getTodoResult));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    // console.log(newDate);
    const requestQuery = `SELECT * FROM todo WHERE due_date='${newDate}';`;
    const responseResult = await db.all(requestQuery);
    // console.log(responseResult);
    if (responseResult.length !== 0) {
      response.send(
        responseResult.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
      );
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
  /*const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate(); 
  const getTodoDueDate = `
  SELECT * FROM todo 
  WHERE  CAST(strftime("%Y", due_date) AS INTEGER) = ${year} 
   AND
   CAST(strftime("%m", due_date) AS INTEGER) = ${month} 
   AND
   CAST(strftime("%d",due_date) AS INTEGER) = ${day};`;
  const getTodoDueDate = `
  SELECT * FROM todo 
  WHERE  due_date = '${result}';`;

  const todoDueDate = await db.all(getTodoDueDate);

  if (todoDueDate.length !== 0) {
    response.send(
      todoDueDate.map((eachTodo) => convertTodoDueDateToResponse(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }*/
});

app.get("/date/", async (request, response) => {
  let date = "2021-1-21";
  let tempDate = new Date(date);
  let result = format(new Date(date), "yyyy-MM-dd");
  let day = tempDate.getDate();
  let month = tempDate.getMonth();
  if (day > 0 && day < 32 && month >= 0 && month < 12) {
    console.log(month);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const bookDetails = request.body;
  const { id, todo, category, priority, status, dueDate } = bookDetails;
  let priorityArray = ["HIGH", "MEDIUM", "LOW"];
  let statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  let categoryArray = ["WORK", "HOME", "LEARNING"];

  let check;
  let tempDate = new Date(dueDate);
  let result = format(new Date(dueDate), "yyyy-MM-dd");
  let day = tempDate.getDate();
  let month = tempDate.getMonth();
  if (day > 0 && day < 32 && month >= 0 && month < 12) {
    check = true;
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }

  //let result = format(new Date(dueDate), "yyyy-MM-dd");
  if (
    categoryArray.includes(category) === true &&
    statusArray.includes(status) === true &&
    priorityArray.includes(priority) === true &&
    check === true
  ) {
    const addTodo = `
    INSERT INTO todo(id,todo,category,priority,status,due_date)
    VALUES(${id},'${todo}','${category}','${priority}','${status}','${result}');`;

    await db.run(addTodo);
    response.send("Todo Successfully Added");
  } else if (categoryArray.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (statusArray.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (priorityArray.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (request, response) => {
  let priorityArray = ["HIGH", "MEDIUM", "LOW"];
  let statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  let categoryArray = ["WORK", "HOME", "LEARNING"];
  let updatedCol = "";
  const { todoId } = request.params;
  const requestBody = request.body;
  let temp;
  let check = true;
  switch (true) {
    case requestBody.status !== undefined:
      updatedCol = "Status";
      temp = requestBody.status;
      check = statusArray.includes(temp);
      break;
    case requestBody.priority !== undefined:
      updatedCol = "Priority";
      temp = requestBody.priority;
      check = priorityArray.includes(temp);
      break;
    case requestBody.todo !== undefined:
      updatedCol = "Todo";
      check = true;
      break;
    case requestBody.category !== undefined:
      updatedCol = "Category";
      temp = requestBody.category;
      check = categoryArray.includes(temp);
      break;
    case requestBody.dueDate !== undefined:
      updatedCol = "Due Date";
      temp = requestBody.dueDate;

      break;
  }

  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;

  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;
  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category = '${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  if (check) {
    response.send(`${updatedCol} Updated`);
  } else {
    response.status(400);
    response.send(`Invalid Todo ${updatedCol}`);
  }
});

module.exports = app;
