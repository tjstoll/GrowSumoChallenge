module.exports = class Todo {
    constructor(title='', taskCompleted=false) {
        this.title = title;
        // Keep track of todo state of completion
        this.taskCompleted = taskCompleted;
    }
}
