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

    // client.emit('newConnection', () => {
    //
    // })

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

    // Go through the DB and delete the todo that matches
    client.on('deleted', (item) => {
      for (let i=0; i<DB.length; i++) {
        if (DB[i].title == item) {
          DB.splice(i, 1);
          server.emit('remove', item);
          break;
        } else {}
      }
    });

    // Go through the DB and delete the todo that matches
    client.on('completed', (item) => {
      for (let i=0; i<DB.length; i++) {
        if (DB[i].title == item) {
          server.emit('complete', item);
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
