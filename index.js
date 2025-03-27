"use strict";
let user = localStorage.getItem("user");
if (isNaN(user)) {
  user = Math.floor(Math.random() * 10);
  localStorage.setItem("user", user);
}

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
  actionDiv.innerHTML = `<div id="taskForm">
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
  document.getElementById("titleInp").focus();
  document.getElementById("titleInp").select();
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
}

async function addTask() {
  try {
    let title = document.getElementById("titleInp").value;
    let time = document.getElementById("timeInp").value;
    let description = document.getElementById("descInp").value;
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
  console.log(taskId, index)
  let title = document.getElementsByClassName("titleInp")[index].value;
  let time = document.getElementsByClassName("timeInp")[index].value;
  let description = document.getElementsByClassName("descInp")[index].value;
  const body = {
    title,
    user,
    time,
    description,
  };
  console.log(body);
  try {
    let added = await fetch(
      `http://127.0.0.1:5555/task/${taskId}?user=${user}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    added = await added.json();
    if (added.code !== 201) {
      throw Error(added.message);
    }
    alert("Task has been added successfully");
  } catch (error) {
    console.log(error);
  } finally {
    let dateOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    document.getElementsByClassName("taskContainer")[
      index
    ].innerHTML = `<div class="taskContainer">
          <div class="tick">
            <input type="checkbox" class="tickBtn" value="done" ${
              body.is_complete ? "checked=true" : ""
            }/>
          </div>
          <div class="task">
            <p class="title" style="font-weight: bolder">
              ${body.title}
              <span class="time">:at ${new Date(body.time).toLocaleDateString(
                "en-US",
                dateOptions
              )}</span>
            </p>
            <p class="desc">${body.description}${
      body.description.length > 40
        ? `<button class="seeMore">...</button></p>`
        : ""
    }
          </div>
          <div class="update"><button class="updateBtn" name=${taskId} index=${index}>Update</button></div>
          <div class="delete">
            <button class="deleteBtn" name=${taskId} index=${index}>
              <img
                src="https://img.icons8.com/?size=100&id=102315&format=png&color=000000"
                class="deleteIcon"
              />
            </button>
          </div>
        </div>
        <p style="margin-top: 30px"></p>`;
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
    let dateOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    for (let i = 0; i < data.results.length; i++) {
      let res = data.results[i];
      htmlString += `<div class="taskContainer">
          <div class="tick">
            <input type="checkbox" class="tickBtn" value="done" ${
              res.is_complete ? "checked=true" : ""
            }/>
          </div>
          <div class="task">
            <p class="title" style="font-weight: bolder">
              ${res.title}
              <span class="time">:at ${new Date(res.time).toLocaleDateString(
                "en-US",
                dateOptions
              )}</span>
            </p>
            <p class="desc">${res.description}${
        res.description.length > 40
          ? `<button class="seeMore">...</button></p>`
          : ""
      }
          </div>
          <div class="update"><button class="updateBtn" name=${
            res._id
          } index=${i}>Update</button></div>
          <div class="delete">
            <button class="deleteBtn" name=${res._id} index=${i}>
              <img
                src="https://img.icons8.com/?size=100&id=102315&format=png&color=000000"
                class="deleteIcon"
              />
            </button>
          </div>
        </div>
        <p style="margin-top: 30px"></p>`;
    }
    return htmlString;
  } catch (error) {
    console.log(error);
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
  actionDiv.innerHTML = `<div class="updateForm">
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
