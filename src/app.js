const dotenv = require('dotenv');
dotenv.config({
    path: './.env'
});

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const chatController = require('./controllers/aichatController');
const { getTask, getAllTasks, createTasks, createTask, patchTask, putTask, deleteTask } = require('./controllers/tasksControllers');
const HttpStatusCode = require('./utils/httpStatusCodes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./utils/globalErrorHandler');

// express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// morgan middleware
app.use(morgan('tiny'));
// express env
const PORT = process.env.PORT || 3000;

// application level custom middleware - logging each request
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(`${req.method} request for ${req.url}  at ${req.requestTime}`);
    next();
});

// app initial route
app.get('/', (req, res) => {
    res.send('Health Mate App is up and running!');
});

// chat bot route
app.post('/api/v1/ai-chat', chatController);

// get all tasks
app.get('/api/v1/tasks', getAllTasks);

// get individual task
app.get('/api/v1/tasks/:id/:dest?/:place?', getTask);

// create tasks
app.post('/api/v1/tasks', createTasks);

// create a task
app.post('/api/v1/tasks/', createTask);

// update a task
app.patch('/api/v1/tasks/:id', patchTask);

// replace a task if it exists, else create a new task
app.put('/api/v1/tasks/', putTask);

// detete a task
app.delete('/api/v1/tasks/:id', deleteTask);

// handle error for unknow routes
app.all('*', (req, res, next) => {
    // const err = new Error(`Can\'t find ${req.originalUrl} on the server`);
    // err.statusCode = HttpStatusCode.NOT_FOUND;
    // err.status = 'fail';
    const err = new AppError(`Can\'t find ${req.originalUrl} on the server`, HttpStatusCode.NOT_FOUND);
    next(err);
});

// error handler middleware
app.use(globalErrorHandler)

// setup database connection
const DB = process.env.MONGO_DB_CONNECTION.replace('<password>', process.env.MONGO_DB_PASSWORD);
mongoose.connect(DB)
    .then(() => console.log('Database connection successful!'))
    .catch((err) => console.log(err));

app.listen(PORT, () => console.log('Listening on port 3000'));