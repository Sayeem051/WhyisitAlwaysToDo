"use strict";
let user = localStorage.getItem("user");
if (isNaN(user) || user === null) {
  user = Math.floor(Math.random() * 10);
  localStorage.setItem("user", user);
}

function getAddTaskFormHtml() {
  return `<div id="taskForm">
          <span class="formTitle">
            <label for="title">Title:</label>
            <input type="text" class="titleInp" />
          </span>
          <br />
          <span class="formTime">
            <label for="time">Time:</label>
            <input type="datetime-local" class="timeInp" />
          </span>
          <br />
          <span class="formDesc">
            <label for="description" id="newDesc">Description:</label>
            <input type="text" class="descInp" />
          </span>
        </div>
        <span>
          <button id="addTaskBtn">Add</button>
        </span>`;
}

function getTaskDetailHtml(data, full = false) {
  let content = `<div class="tick">
            <input type="checkbox" class="tickBtn" value="done" ${
              data.is_complete ? "checked=true" : ""
            }/>
          </div>
          <div class="task">
            <p class="title" style="font-weight: bolder">
              ${data.title}
              <span class="time">:at ${new Date(data.time).toLocaleDateString(
                "en-US",
                dateOptions
              )}</span>
            </p>
            <p class="desc">${
              full ? data.description : data.description.slice(0, 40)
            }${
    data.description.length > 40 && !full
      ? `<button class="seeMore" name=${data._id}>...</button></p>`
      : ""
  }
          </div>
          <div class="update"><button class="updateBtn" name=${
            data._id
          }>Update</button></div>
          <div class="delete">
            <button class="deleteBtn" name=${data._id}>
              <img
                src="https://img.icons8.com/?size=100&id=102315&format=png&color=000000"
                class="deleteIcon"
              />
            </button>
          </div>`;
  return full
    ? content
    : `<div class="taskContainer" name=${data._id}>
          ${content}
        </div>`;
}

function getUpdateTaskFormHtml(data, taskId) {
  return `<div class="updateForm" name=${taskId}>
          <span class="formTitle">
            <label for="title">Title:</label>
            <input type="text" class="titleInp" value="${data.title}"/>
          </span>
          <br />
          <span class="formTime">
            <label for="time">Time:</label>
            <input type="datetime-local" class="timeInp" value="${data.time}"/>
          </span>
          <br />
          <span class="formDesc">
            <label for="description" class="newDesc">Description:</label>
            <input type="text" class="descInp" value="${data.description}"/>
          </span>
        </div>
        <span>
          <button class="updateTaskBtn" name=${taskId}>update</button>
        </span>`;
}

function findActualIndex(elementClass, taskId, taskIds = []) {
  let taskContainers = document.getElementsByClassName(elementClass);
  for (let tc of taskContainers) {
    taskIds.push(parseInt(tc.getAttribute("name")));
  }
  return taskIds.indexOf(taskId);
}

let dateOptions = {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

document
  .getElementById("searchIcon")
  .addEventListener("click", openUpSearchBar);

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("callFormBtn")
    .addEventListener("click", openTaskAddForm);
});

function openTaskAddForm() {
  let actionDiv = document.getElementsByClassName("action")[0];
  actionDiv.innerHTML = getAddTaskFormHtml();
  document.getElementsByClassName("titleInp")[0].focus();
  document.getElementsByClassName("titleInp")[0].select();
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
}

async function addTask() {
  try {
    let title = document.getElementsByClassName("titleInp")[0].value;
    let time = document.getElementsByClassName("timeInp")[0].value;
    let description = document.getElementsByClassName("descInp")[0].value;
    const body = {
      title,
      user,
      time,
      description,
    };
    let added = await fetch("http://127.0.0.1:5555/task", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    added = await added.json();
    if (added.code !== 201) {
      throw Error(added.message);
    }
    alert("Task has been added successfully");
  } catch (error) {
    console.log(error);
  } finally {
    document.getElementsByClassName(
      "action"
    )[0].innerHTML = `<button id="callFormBtn">+ Add Task</button>`;
  }
}

async function updateTask(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  let taskIds = [];
  document.getElementById("taskForm") ? taskIds.push(null) : "";
  let updateIndex = findActualIndex("updateForm", taskId, taskIds);
  let title = document.getElementsByClassName("titleInp")[updateIndex].value;
  let time = document.getElementsByClassName("timeInp")[updateIndex].value;
  let description =
    document.getElementsByClassName("descInp")[updateIndex].value;
  const body = {
    title,
    user,
    time,
    description,
  };
  try {
    let updated = await fetch(
      `http://127.0.0.1:5555/task/${taskId}?user=${user}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    updated = await updated.json();
    if (updated.code !== 200) {
      throw Error(updated.message);
    }
    alert("Task has been updated successfully");
  } catch (error) {
    console.log(error);
  } finally {
    let index = findActualIndex("taskContainer", taskId);
    document.getElementsByClassName("taskContainer")[index].innerHTML =
      getTaskDetailHtml({ ...body, _id: taskId });
  }
}

async function seeMore(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  try {
    let response = await fetch(
      `http://127.0.0.1:5555/task/${taskId}?user=${user}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    response = await response.json();
    if (response.code !== 200) {
      throw Error(response.message);
    }
    let index = findActualIndex("taskContainer", taskId);
    document.getElementsByClassName("taskContainer")[index].innerHTML =
      getTaskDetailHtml(response.data, true);
  } catch (error) {
    console.log(error);
  }
}

function openUpSearchBar() {
  console.log("D");
}

async function loadList() {
  try {
    let response = await fetch(`http://127.0.0.1:5555/task?user=${user}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    if (response.code !== 200) {
      throw Error(response.message);
    }
    const { data } = response;
    let htmlString = "";

    for (let i = 0; i < data.results.length; i++) {
      htmlString += getTaskDetailHtml(data.results[i]);
    }
    return htmlString;
  } catch (error) {
    console.log(error);
    return `<p></p>`;
  }
}

async function callUpdateForm(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  let data = await fetch(`http://127.0.0.1:5555/task/${taskId}?user=${user}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  data = await data.json();
  if (data.code !== 200) {
    throw Error(data.message);
  }
  data = data.data;
  let index = findActualIndex("taskContainer", taskId);
  let actionDiv = document.getElementsByClassName("taskContainer")[index];
  actionDiv.innerHTML = getUpdateTaskFormHtml(data, taskId);
  let titleInput =
    document.getElementsByClassName("taskContainer")[index].children[0]
      .children[0].children[1];

  titleInput.focus();
  titleInput.select();
  document
    .getElementsByClassName("taskContainer")
    [index].children[1].children[0].addEventListener("click", updateTask);
}

document.getElementById("content").innerHTML += await loadList();

let updates = document.getElementsByClassName("update");
for (let update of updates) update.addEventListener("click", callUpdateForm);

let allSeeMores = document.getElementsByClassName("seeMore");
for (let sm of allSeeMores) sm.addEventListener("click", seeMore);
