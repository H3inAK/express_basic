const HttpStatusCode = require("../utils/httpStatusCodes");
const Task = require("../models/task_model");

const { chat } = require("../ai_chat_bot/openaiChat");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// preset data
const tasks = [
    {
        id: 1,
        text: 'Doctor Appointment',
        day: 'Feb 5th at 2:30pm',
        reminder: true
    },
    {
        id: 2,
        text: 'Meeting at school',
        day: 'Feb 6th at 1:30pm',
        reminder: true
    },
    {
        id: 3,
        text: 'Food Shopping',
        day: 'Feb 5th at 2:30pm',
        reminder: true
    },
    {
        id:4,
        text:'Do Something',
        day: 'Feb 7th at 4:40pm',
        reminder: true
    },
];

// read all tasks
const getAllTasks = async (req, res) => {
    try { 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        
        const query = Task.find().skip(skip).limit(limit);  
        const results = await query.select('-__v');
        const total = await Task.countDocuments();
        const totalPages = Math.ceil(total / limit);
        const currentPage = page;

        if (page > totalPages) {
            return res.status(HttpStatusCode.BAD_REQUEST).json({
                status: 'fail',
                message: 'Page not found'
            });
        }
    
        res.status(HttpStatusCode.OK).json({
            status: 'success',
            requestTime: req.requestTime,
            results: results.length,
            total: total,
            totalPages: totalPages,
            currentPage: currentPage,
            data: {
                tasks: results
            }
        });
    } catch (error) {
        const err = new AppError(error, HttpStatusCode.NOT_FOUND);
        next(err);
    }
}

// read a task
const getTask = catchAsync (async (req, res, next) => {
    const taskId = req.params.id;
    const query = Task.findById(taskId);
    const task = await query.select('-__v');

    res.status(HttpStatusCode.OK).json({
        status: 'success',
        requestTime: req.requestTime,
        results: task ? 1 : 0,
        data:{
            task: task
        },
    });
    // try {
        
    // } catch (error) {
    //     const err = new AppError(error, HttpStatusCode.NOT_FOUND);
    //     next(err);
        
    // }
});

// create tasks
const createTasks = async (req, res, next) => {
    try {
        const tasks = req.body;
        const newTasks = await Task.create(tasks);
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            requestTime: req.requestTime,
            results: newTasks.length,
            data:{
                tasks: newTasks
            },
        });
    } catch (error) {
        const err = new AppError(error, HttpStatusCode.BAD_REQUEST);
        next(err);
    }
}

// create a task
const createTask = async (req, res, next) => {
    try {    
        const body = req.body;
        const newTask = await Task.create({
            ...body
        });
    
        res.status(HttpStatusCode.CREATED).json({
            status: 'success',
            requestTime: req.requestTime,
            data:{
                task: newTask
            },
        });
    } catch (error) {
        const err = new AppError(error, HttpStatusCode.BAD_REQUEST);
        next(err);
    }

}

// patch a task
const patchTask = catchAsync (async (req, res, next) => {
    const taskId = req.params.id;
    const query = Task.findByIdAndUpdate(
        taskId, 
        req.body, 
        {new: true}
    );
    const task = await query.select('-__v');

    if(!task){
        return res.status(HttpStatusCode.NOT_FOUND).json({
            status: 'fail',
            message: 'No task found'
        });
    }

    res.status(HttpStatusCode.OK).json({
        status: 'success',
        requestTime: req.requestTime,
        data:{
            task
        },
    });
});

// put a task
const putTask = async (req, res, next) => {
    const taskId = req.params.id;
    const taskData = req.body;

    try {
        // Find the task by ID and update it, or create it if it doesn't exist
        const task = await Task.findOneAndUpdate(
            { _id: taskId },
            taskData,
            {
                new: true, // Return the updated document
                upsert: true, // Create a new document if it doesn't exist
                runValidators: true // Validate the data before saving
            }
        );

        res.status(HttpStatusCode.OK).json({
            status: 'success',
            requestTime: req.requestTime,
            data: task,
        });
    } catch (error) {
        const err = new AppError(error, HttpStatusCode.NOT_FOUND);
        next(err);
    }
};


// delete a task
const deleteTask = catchAsync(async (req, res) => {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
     if (!task) {
         return res.status(HttpStatusCode.NOT_FOUND).json({
             status: 'fail',
             message: 'Task not found',
         });
     }

     // catch custom error if task is not found
     await Task.findByIdAndDelete(taskId);
               
     return res.status(HttpStatusCode.NO_CONTENT).json({
         status: 'success',
         requestTime: req.requestTime,
         data: null,
     });
});

module.exports = {
    getAllTasks,
    getTask,
    createTasks,
    createTask,
    patchTask,
    putTask,
    deleteTask
}