const app = require('express')();
const http = require('http').Server(app);
const server = require('socket.io')(http);

const firstTodos = require('./data');
const Todo = require('./todo');

// Serve the home page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Initiate the database for this server
const DB = firstTodos.map((t) => {
    // Form new Todo objects
    return new Todo(t.title);
});

console.log(DB);

server.on('connection', (client) => {
    // This is going to be our fake 'database' for this application
    // Parse all default Todo's from db

    // FIXME: DB is reloading on client refresh. It should be persistent on new client
    // connections from the last time the server was run...

    // Need to move the DB creation outside of the connection
    // Otherwise DB will be overwritten on new connection

    // Sends a message to the client to reload all todos
    const reloadTodos = () => {
        client.emit('load', DB);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);

        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        // FIXME: This sends all todos every time, could this be more efficient?
        // Only render the newest item
        server.emit('render', newTodo);
    });

    // Iterate through the  database and delete or grab completed items
    client.on('completeDelete', (item) => {
      for (let i = 0; i < DB.length; i++) {
        if (DB[i].title == item.info) {
          if (item.action == 'complete') {
            DB[i].taskCompleted = true;
            server.emit('highlightRemove', {index: i, action: 'complete'});
          } else {
            DB.splice(i, 1);
            server.emit('highlightRemove', {index: i, action: 'delete'});
          }
          break;
        } else {}
      }
    });

    // Send the DB downstream on connect
    reloadTodos();
});

console.log('Waiting for clients to connect');
http.listen(3003, () => {
  console.log('Serving on localhost:3003');
});
