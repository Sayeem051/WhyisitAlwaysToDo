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

function getTaskDetailHtml(data, index) {
  console.log(data);
  return `<div class="taskContainer">
          <div class="tick">
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
            <p class="desc">${data.description.slice(0, 40)}${
    data.description.length > 40
      ? `<button class="seeMore">...</button></p>`
      : ""
  }
          </div>
          <div class="update"><button class="updateBtn" name=${
            data._id
          } index=${index}>Update</button></div>
          <div class="delete">
            <button class="deleteBtn" name=${data._id} index=${index}>
              <img
                src="https://img.icons8.com/?size=100&id=102315&format=png&color=000000"
                class="deleteIcon"
              />
            </button>
          </div>
        </div>
        <p style="margin-top: 30px"></p>`;
}

function getUpdateTaskFormHtml(data, taskId, index) {
  return `<div class="updateForm" name=${taskId} index=${index}>
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
          <button class="updateTaskBtn" name=${taskId} index=${index}>update</button>
        </span>`;
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
    console.log(body);
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
  let index = parseInt(event.target.getAttribute("index"));
  let updateForms = document.getElementsByClassName("updateForm");
  let taskIds = [];
  for (let uform of updateForms) {
    taskIds.push(uform.getAttribute("name"));
  }
	console.log(taskIds)
  // let updateIndex = taskIds.indexOf(taskId.toString());
  // let title = document.getElementsByClassName("titleInp")[updateIndex].value;
  // let time = document.getElementsByClassName("timeInp")[updateIndex].value;
  // let description =
  //   document.getElementsByClassName("descInp")[updateIndex].value;
  // const body = {
  //   title,
  //   user,
  //   time,
  //   description,
  // };
  // console.log(body);
  // try {
  //   let updated = await fetch(
  //     `http://127.0.0.1:5555/task/${taskId}?user=${user}`,
  //     {
  //       method: "PATCH",
  //       body: JSON.stringify(body),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  //   updated = await updated.json();
  //   if (updated.code !== 201) {
  //     throw Error(updated.message);
  //   }
  //   alert("Task has been updated successfully");
  // } catch (error) {
  //   console.log(error);
  // } finally {
  //   document.getElementsByClassName("taskContainer")[index].innerHTML =
  //     getTaskDetailHtml({ ...body, _id: taskId }, index);
  // }
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

    console.log(data.results[0]);
    for (let i = 0; i < data.results.length; i++) {
      htmlString += getTaskDetailHtml(data.results[i], i);
    }
    return htmlString;
  } catch (error) {
    console.log(error);
    return `<p></p>`;
  }
}

async function callUpdateForm(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  let index = parseInt(event.target.getAttribute("index"));
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
  let actionDiv = document.getElementsByClassName("taskContainer")[index];
  actionDiv.innerHTML = getUpdateTaskFormHtml(data, taskId, index);
  // console.log(
  //   document
  //     .getElementsByClassName("taskContainer")
  //     [index].children[1].children[0].addEventListener("click")
  // );
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
