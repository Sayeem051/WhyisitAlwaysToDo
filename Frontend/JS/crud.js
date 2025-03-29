import {
  getAddTaskFormHtml,
  getUpdateTaskFormHtml,
  getTaskDetailHtml,
  findActualIndex,
} from "./helper.js";

import {
  initiateButtons,
  user,
  selected,
  current_page,
  api,
} from "../index.js";

async function getTask(taskId) {
  try {
    let data = await fetch(`${api}/task/${taskId}?user=${user}`);
    data = await data.json();
    if (data.code != 200) {
      throw Error(data.message);
    }
    return data.data;
  } catch (error) {
    alert(error.message);
  }
}

function openTaskAddForm() {
  let actionDiv = document.getElementsByClassName("action")[0];
  actionDiv.innerHTML = getAddTaskFormHtml();
  document.getElementsByClassName("titleInp")[0].focus();
  document.getElementsByClassName("titleInp")[0].select();
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document
    .getElementsByClassName("cancel")[0]
    .addEventListener("click", cancel);
}

async function cancel(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  if (isNaN(taskId)) {
    document.getElementsByClassName(
      "action"
    )[0].innerHTML = `<button id="callFormBtn">+ Add Task</button>`;
    initiateButtons(["add"]);
  } else {
    let data = await getTask(taskId);
    let index = findActualIndex("taskContainer", taskId);
    document.getElementsByClassName("taskContainer")[index].innerHTML =
      getTaskDetailHtml(data, true);
    initiateButtons(
      ["update_buttons", "delete_buttons", "see_more_buttons", "checkboxes"],
      index
    );
  }
}

async function addTask() {
  let err = false;
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
      err = true;
      throw Error(added.message);
    }
    alert("Task has been added successfully");
  } catch (error) {
    alert(error.message);
  } finally {
    document.getElementsByClassName(
      "action"
    )[0].innerHTML = `<button id="callFormBtn">+ Add Task</button>`;
    document
      .getElementById("callFormBtn")
      .addEventListener("click", openTaskAddForm);
    if (!err) location.reload();
  }
}

async function callUpdateForm(event) {
  try {
    let taskId = parseInt(event.target.getAttribute("name"));
    let data = await getTask(taskId);
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
      [index].children[1].addEventListener("click", updateTask);
    console.log(
      index,
      document.getElementsByClassName("taskContainer")[index].children[2]
    );
    document
      .getElementsByClassName("taskContainer")
      [index].children[2].addEventListener("click", cancel);
  } catch (error) {
    alert(error.message);
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
  let err = false;
  const body = {
    title,
    user,
    time,
    description,
  };
  try {
    if (title == "") {
      err = true;
      throw Error("Title cannot be empty!");
    }
    let updated = await fetch(`${api}/task/${taskId}?user=${user}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    updated = await updated.json();
    if (updated.code !== 200) {
      err = true;
      throw Error(updated.message);
    }
    alert("Task has been updated successfully");
  } catch (error) {
    alert(error.message);
  } finally {
    let index = findActualIndex("taskContainer", taskId);
    let data = err ? await getTask(taskId) : body;
    document.getElementsByClassName("taskContainer")[index].innerHTML =
      getTaskDetailHtml({ ...data, _id: taskId }, true);
    initiateButtons(
      ["update_buttons", "delete_buttons", "see_more_buttons", "check"],
      index
    );
  }
}

async function deleteTask(event) {
  let value = confirm("Are you sure you want to delete this task?!");
  if (!value) return;
  let taskId = parseInt(event.target.getAttribute("name"));
  try {
    let deleted = await fetch(`${api}/task/${taskId}?user=${user}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    deleted = await deleted.json();
    if (deleted.code !== 200) {
      throw Error(deleted.message);
    }
    alert("Task has been deleted successfully");
    location.reload();
  } catch (error) {
    alert(error.message);
  } finally {
    // document.getElementById("content").innerHTML += await loadList();
  }
}

async function seeMore(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  console.log(taskId);
  try {
    let response = await getTask(taskId);
    let index = findActualIndex("taskContainer", taskId);
    console.log(index);
    document.getElementsByClassName("taskContainer")[index].innerHTML =
      getTaskDetailHtml(response, true, true);
    initiateButtons(
      ["update_buttons", "delete_buttons", "see_more_buttons", "checkboxes"],
      index
    );
  } catch (error) {
    alert(error.message);
  }
}

async function updateStatus(event) {
  let taskId = parseInt(event.target.getAttribute("name"));
  try {
    let index = findActualIndex("tickBtn", taskId);
    let checkedStatus = document
      .getElementsByClassName("tickBtn")
      [index].getAttribute("checked");
    let completed = await fetch(`${api}/task/${taskId}?user=${user}`, {
      method: "PATCH",
      body: JSON.stringify({ is_complete: checkedStatus ? false : true }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    completed = await completed.json();
    if (completed.code !== 200) {
      throw Error(completed.message);
    }
    if (!checkedStatus) {
      document
        .getElementsByClassName("tickBtn")
        [index].setAttribute("checked", true);
      alert("Congratulations on completing your task!");
    } else {
      document
        .getElementsByClassName("tickBtn")
        [index].removeAttribute("checked");
    }
  } catch (error) {
    alert(error.message);
  }
}

export {
  openTaskAddForm,
  addTask,
  callUpdateForm,
  updateTask,
  updateStatus,
  deleteTask,
  seeMore,
  cancel,
};
