const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });

    // Clear the input
    input.value = '';
    // TODO: refocus the element
    input.focus();
}

// Complete or delete all of the items in the list
function bulkAction(action) {
  items = list.getElementsByTagName('li');

  for (let i=0; i<items.length; i++) {
      completeDelete(items[i], action);
    }
}

// Complete or delete a single item in the list
function completeDelete (elem, action) {
  server.emit('completeDelete', {
    info: elem.innerHTML,
    action: action
  });
}

function render(todo) {
    console.log(todo);
    const listItem = document.createElement('li');
    listItem.setAttribute('onclick', 'completeDelete(this, "complete")');
    listItem.setAttribute('ondblclick', 'completeDelete(this, "delete")');
    const listItemText = document.createTextNode(todo.title);
    listItem.appendChild(listItemText);

    if (todo.taskCompleted) {
      listItem.style.background = '#66ff66';
      listItem.style.color = 'white';
    }
    list.append(listItem);
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    todos.forEach((todo) => render(todo));
});

server.on('render', (item) => {
  render(item);
});

// Highlight or remove the item that has been completed or deleted
server.on('highlightRemove', (item) => {
  items = list.getElementsByTagName('li');
  if (item.action == 'complete') {
    items[item.index].style.background = '#66ff66';
    items[item.index].style.color = 'white';
  } else {
    list.removeChild(list.childNodes[item.index]);
  }
});
