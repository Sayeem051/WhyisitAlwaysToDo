"use strict";
import { getPaginationHtml, getTaskDetailHtml } from "./JS/helper.js";
import {
  openTaskAddForm,
  callUpdateForm,
  deleteTask,
  updateStatus,
  seeMore,
} from "./JS/crud.js";

// Setting up global variables
let user = localStorage.getItem("user");
if (isNaN(user) || user === null) {
  user = Math.floor(Math.random() * 10);
  let alreadyHas = await fetch("http://127.0.0.1:5555/task?user=" + user);
  if (alreadyHas.code == 200 && alreadyHas.data.results.length) {
    alert("Rare Easter Egg Moment!");
  }
  localStorage.setItem("user", user);
}

let selected = parseInt(localStorage.getItem("countSelected"));
if (!selected) {
  localStorage.setItem("countSelected", 3);
  selected = 3;
}
let current_page = parseInt(
  document.getElementById("pagination").getAttribute("name")
);
current_page = isNaN(current_page) ? 1 : current_page;

function initiateButtons(buttonsList, index = null) {
  /**buttonsList = ["update_buttons"
   * delete_buttons
   * checkboxes
   * see_more_buttons
   * prev
   * next
   * add
   * */

  // initiate update button
  if (!buttonsList || buttonsList.includes("update_buttons")) {
    let updates = document.getElementsByClassName("updateBtn");
    if (index == null) {
      for (let update of updates)
        update.addEventListener("click", callUpdateForm);
    } else {
      updates[index].addEventListener("click", callUpdateForm);
    }
  }

  // initiate delete button
  if (!buttonsList || buttonsList.includes("delete_buttons")) {
    let deletes = document.getElementsByClassName("deleteBtn");
    if (index == null) {
      for (let deletable of deletes)
        deletable.addEventListener("click", deleteTask);
    } else {
      deletes[index].addEventListener("click", deleteTask);
    }
  }

  // initiate checkbox
  if (!buttonsList || buttonsList.includes("checkboxes")) {
    let checkboxes = document.getElementsByClassName("tickBtn");
    if (index == null) {
      for (let cb of checkboxes) {
        cb.addEventListener("click", updateStatus);
      }
    } else {
      checkboxes[index].addEventListener("click", updateStatus);
    }
  }

  // initiate see more
  if (!buttonsList || buttonsList.includes("see_more_buttons")) {
    let allSeeMores = document.getElementsByClassName("seeMore");
    for (let sm of allSeeMores) sm.addEventListener("click", seeMore);
  }

  if (!buttonsList || buttonsList.includes("prev")) {
    let prevDisabled = document.getElementById("prev").getAttribute("disabled");
    if (!prevDisabled) {
      document
        .getElementById("prev")
        .addEventListener("click", async function () {
          document.getElementById("content").innerHTML = await loadList(
            current_page - 1,
            selected
          );
          initiateButtons();
        });
    }
  }

  if (!buttonsList || buttonsList.includes("next")) {
    let nextDisabled = document.getElementById("next").getAttribute("disabled");
    if (!nextDisabled) {
      document
        .getElementById("next")
        // .addEventListener("click", loadList(current_page + 1, selected));
        .addEventListener("click", async function () {
          document.getElementById("content").innerHTML = await loadList(
            current_page + 1,
            selected
          );
          initiateButtons();
        });
    }
  }
  if (!buttonsList || buttonsList.includes("add")) {
    document
      .getElementById("callFormBtn")
      .addEventListener("click", openTaskAddForm);
  }
}

async function loadList(page, count) {
  try {
    let response = await fetch(
      `http://127.0.0.1:5555/task?user=${user}&page=${page}&count=${count}`,
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
    const { data } = response;
    current_page = data.meta.current_page;
    let htmlString = "";

    for (let i = 0; i < data.results.length; i++) {
      htmlString += getTaskDetailHtml(data.results[i]);
    }
    document.getElementById("pagination").innerHTML = getPaginationHtml(
      data,
      current_page,
      count
    );
    document.getElementById("pagination").setAttribute("name", current_page);
    document.getElementById("count").addEventListener("change", changeList);
    return htmlString;
  } catch (error) {
    console.log(error);
    return `<p></p>`;
  }
}

async function changeList() {
  let newValue = document.getElementById("count").value;
  localStorage.setItem("countSelected", newValue);
  selected = newValue;
  let current_page = parseInt(
    document.getElementById("pagination").getAttribute("name")
  );
  document.getElementById("content").innerHTML = await loadList(
    current_page,
    newValue
  );
  initiateButtons();
}

document.getElementById("content").innerHTML = await loadList(
  current_page,
  selected
);
initiateButtons();

export { initiateButtons, user, selected };
