import express from "express";
import fs from "fs";

const TaskRouter = express.Router();

TaskRouter.post("/", (req, res, next) => {
  try {
    let { title, user, description, time } = req.body;
    console.log(req.body);
    if ([null, ""].includes(title) || user == null)
      throw Error("Must provide title and user info");
    req.body.title = title.trim();
    let todolist = fs.readFileSync("./tododb.json").toString();
    todolist = JSON.parse(todolist == "" ? "[]" : todolist);
    let userTitleArr = todolist.map(({ title, user }) => ({ title, user }));
    let taskAlreadyExists = userTitleArr.some(
      (obj) => obj.title == req.body.title && obj.user == req.body.user
    );
    if (taskAlreadyExists) throw Error("Task already exists");
    todolist.push({
      _id: todolist.length ? todolist[todolist.length - 1]["_id"] + 1 : 0,
      is_complete: false,
      ...req.body,
    });
    fs.writeFileSync("./tododb.json", JSON.stringify(todolist));
    return res.status(201).json({
      code: 201,
      status: "success",
      message: "Successfully added task!",
      data: req.body,
    });
  } catch (error) {
    return res.status(400).json({
      code: 400,
      status: "failed",
      message: error.message,
    });
  }
})
  .get("/:taskId", (req, res, next) => {
    try {
      if (!req.query.user) throw Error("Must provide user");
      let todolist = fs.readFileSync("./tododb.json").toString();
      todolist = JSON.parse(todolist == "" ? "[]" : todolist);
      let userTitleArr = todolist.map(({ _id, user }) => ({ _id, user }));
      let taskIndex = userTitleArr.findIndex(
        (obj) => obj._id == req.params.taskId && obj.user == req.query.user
      );
      if (taskIndex == -1) {
        throw Error("Could not find task");
      }
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Successfully added task!",
        data: todolist[taskIndex],
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        status: "not found",
        message: error.message,
      });
    }
  })
  .get("/", (req, res, next) => {
    try {
      let currentPage = isNaN(parseInt(req.query.page))
        ? 1
        : parseInt(req.query.page);
      let limit = isNaN(parseInt(req.query.count))
        ? 15
        : parseInt(req.query.count);
      let offset = Math.max(0, currentPage - 1) * limit;
      if (!req.query.user) throw Error("Must provide user");
      let todolist = fs.readFileSync("./tododb.json").toString();
      todolist = JSON.parse(todolist == "" ? "[]" : todolist);
      if (!todolist.length) {
        throw Error("Could not find task");
      }
      let list = todolist
        .filter(({ user }) => user == req.query.user)
        .slice(offset)
        .slice(0, limit);
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Successfully added task!",
        data: {
          meta: {
            current_page: currentPage,
            next_page:
              todolist.length > offset + limit ? currentPage + 1 : null,
            previous_page: currentPage <= 1 ? null : currentPage - 1,
            total: todolist.length,
          },
          results: list,
        },
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        status: "not found",
        message: error.message,
        data: {
          results: [],
        },
      });
    }
  })
  .patch("/:taskId", (req, res, next) => {
    try {
      let { title, description, time, is_complete } = req.body;
      if (title == "") {
        throw Error("Title cannot be empty");
      }
      if (title) {
        title = title.trim();
        req.body.title = title;
      }
      if (!req.query.user) throw Error("Access Denied");
      let todolist = fs.readFileSync("./tododb.json").toString();
      todolist = JSON.parse(todolist == "" ? "[]" : todolist);
      let userTitleArr = todolist.map(({ _id, user }) => ({ _id, user }));
      let taskIndex = userTitleArr.findIndex(
        (obj) => obj._id == req.params.taskId && obj.user == req.query.user
      );
      if (taskIndex == -1) throw Error("Couldn't find task");
      req.body.is_complete = [true, false].includes(req.body.is_complete)
        ? req.body.is_complete
        : todolist[taskIndex].is_complete;
      todolist[taskIndex] = { ...todolist[taskIndex], ...req.body };
      fs.writeFileSync("./tododb.json", JSON.stringify(todolist));
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Successfully updated task!",
        data: todolist[taskIndex],
      });
    } catch (error) {
      return res.status(400).json({
        code: 400,
        status: "failed",
        message: error.message,
      });
    }
  })
  .delete("/:taskId", (req, res, next) => {
    try {
      if (!req.query.user) throw Error("Access Denied");
      let todolist = fs.readFileSync("./tododb.json").toString();
      todolist = JSON.parse(todolist == "" ? "[]" : todolist);
      let userTitleArr = todolist.map(({ _id, user }) => ({ _id, user }));
      let taskIndex = userTitleArr.findIndex(
        (obj) => obj._id == req.params.taskId && obj.user == req.query.user
      );
      if (taskIndex == -1) throw Error("Couldn't find task");
      todolist[taskIndex] = null;
      fs.writeFileSync(
        "./tododb.json",
        JSON.stringify(todolist.filter((el) => !!el))
      );
      return res.status(200).json({
        code: 200,
        status: "success",
        message: "Successfully added task!",
        data: null,
      });
    } catch (error) {
      return res.status(404).json({
        code: 404,
        status: "not found",
        message: error.message,
      });
    }
  });

export { TaskRouter };
