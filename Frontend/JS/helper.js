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
            <button class="cancel">Cancel</button>
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

function getTaskDetailHtml(data, insideContainer = false, full = false) {
  let content = `<div class="tick">
              <input type="checkbox" class="tickBtn" name=${data._id} ${
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
      : `` // `<button class="seeMore" name=${data._id}>See Less</button></p>`
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
  return insideContainer
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
            <button class="updateTaskBtn" name=${taskId}>Update</button>
            <button class="cancel" name=${taskId}>Cancel</button>
          `;
}

function getPaginationHtml(data, page, count) {
  let selectables = [3, 5, 10];
  let optStr = "";
  let total = data.meta.total;
  selectables.forEach(
    (opt, i) =>
      (optStr += `<option value="${opt}"${
        count == opt ? `selected=true` : ""
      }>${opt}</option>`)
  );
  return `<p>
            Rows per page:
            <select name="" id="count">
              ${optStr}
            </select>
          </p>
          <p>${!total ? 0 : Math.max(0, page - 1) * count + 1} - ${
    !total ? 0 : Math.min(data.meta.total, page * count)
  } of ${data.meta.total}</p>
          <button id="prev" ${data.meta.previous_page ? "" : "disabled=true"}>
            <img src="./static/left-chevron.png" alt="" />
          </button>
          <button id="next" ${data.meta.next_page ? "" : "disabled=true"}>
            <img src="./static/chevron.png" alt="" />
          </button>`;
}

function findActualIndex(elementClass, taskId, taskIds = []) {
  let taskContainers = document.getElementsByClassName(elementClass);
  for (let tc of taskContainers) {
    taskIds.push(parseInt(tc.getAttribute("name")));
  }
  return taskIds.indexOf(taskId);
}

export {
  getAddTaskFormHtml,
  getTaskDetailHtml,
  getUpdateTaskFormHtml,
  getPaginationHtml,
  findActualIndex,
};
