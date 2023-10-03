
///////////////////////////////////////////////////////////////////////////////////////////////// Requirements //

// 3rd Party Modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Custom Modules
const utilityFunctions = require(path.join(__dirname, '/utilityFunctions'));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////// Global Variables and Constants //

const PORT = process.env.PORT; // || 3000;
const ServerURL = process.env.SERVER_URL || 'https://todotype-mes.netlify.app' || 'http://localhost:3000/';
const app = express();

var count = 0;
var catagory = "";
var tasks = [];
var submitRoute = '';
var submitRouteCaller = '';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////// Middleware //

// bodyParser middleware
app.use(bodyParser.urlencoded({extended: true}));

// static files
// app.use(express.static(__dirname + '/public'));

// view engine
app.set('view engine','ejs');
app.set('views', path.join(__dirname, '../functions', 'views'));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////// Utility Functions //

const grabDay = utilityFunctions.grabDay;
const grabCatagories = utilityFunctions.grabCatagories;
const checkAndUpdateCatagoryList = utilityFunctions.checkAndUpdateCatagoryList;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////// Get Routes //

// Home Page
app.get('/', function (req, res) {
    let today = grabDay();
    let catagoryList = grabCatagories();
    res.render('index', {day: today, taskList: tasks, catagoryList: catagoryList});
    tasks = [];
});

// Add Catagory Page
app.get('/addCatagory', function (req, res) {
    submitRoute = 'submitCatagory';
    submitRouteCaller = 'submitCatagory';
    count = 0;
    res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////// Post Routes //

// Add Task
app.post('/addTask', function (req, res) {
    catagory = req.body.catagoryName;
    let item = {
        inputId: `${catagory}Task${++count}`,
        inputValue: req.body.newTask
    };
    if (item.inputValue !== '') {
        tasks.push(item);
    }

    if (submitRoute === 'finalizeEdit') {
        res.render('editCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
    } else if (submitRoute === 'submitCatagory') {
        res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
    }
});

// Remove Task
app.post('/removeTask', function (req, res) {
    let removeItemId = req.body.removeItem;
    tasks = tasks.filter(function (task) {
        return task.inputId !== removeItemId;
    });

    // Reset inputIDs to proper order
    let i = 1;
    tasks.forEach(function (task) {
        task.inputId = task.inputId.slice(0, task.inputId.length - 1) + `${i}`;
        i++;
    });

    count = tasks.length;
    catagory = req.body.catagoryName;
    if (submitRoute === 'finalizeEdit') {
        res.render('editCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
    } else if (submitRoute === 'submitCatagory') {
        res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
    }
});

// Submit Catagory
app.post('/submitCatagory', function (req, res) {
    let error = checkAndUpdateCatagoryList(req.body, tasks, submitRouteCaller);
    if(error === 0) {
        count = 0;
        catagory = "";
        res.redirect('/');
    } else if(error === 1) {
        error = {
            code: 1, 
            message: "Catagory already exists. Please re-enter tasks with a new catagory name or edit the existing catagory"
        };
        res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: error, submit: submitRoute});
    } else if(error === 2) {
        error = {
            code: 2,
            message: "Please enter a catagory name and corresponding tasks."
        };
        res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: error, submit: submitRoute});
    } else if(error === 3) {
        error = {
            code: 3,
            message: "Please enter tasks for the catagory."
        };
        res.render('addCatagory', {taskList: tasks, catagoryName: catagory, err: error, submit: submitRoute});
    }
});

// Delete Catagory
app.post('/deleteCatagory', function (req, res) {
    let catagoryName = req.body.catagoryName;
    let catagories = grabCatagories();
    console.log(catagories);
    let file = fs.openSync('catagoryList.txt', 'w');
    console.log(`File (ID:${file}) opened.`);

    catagories.forEach(function (catagory) {
        if (catagory.catagoryName !== catagoryName) {
            fs.appendFileSync('catagoryList.txt', JSON.stringify(catagory) + '\n', function (err) {
                if (err) throw err;
                console.log(`File (ID:${file}) updated.`);
            });
        }
    });

    fs.closeSync(file, function (err) {
        if (err) throw err;
        console.log(`File (ID:${file}) closed!`);
    });

    res.redirect('/');
});

// Edit Catagory
app.post('/editCatagory', function (req, res) {
    let catagories = grabCatagories();
    catagories.forEach((catagoryItem) => {
        if (catagoryItem.catagoryName === req.body.catagoryName) {
            tasks = catagoryItem.taskList;
            catagory = catagoryItem.catagoryName;
            prevCatagoryName = catagory;
            submitRoute = 'finalizeEdit';
            submitRouteCaller = 'finalizeEdit';
            count = tasks.length;
            res.render('editCatagory', {taskList: tasks, catagoryName: catagory, err: "NaN", submit: submitRoute});
        }
    });
});

// Finalize Edit
app.post('/finalizeEdit', function (req, res) {
    let error = checkAndUpdateCatagoryList(req.body, tasks, submitRouteCaller);
    if(error === 0) {
        count = 0;
        catagory = "";
        res.redirect('/');
    } else if(error === 2) {
        error = {
            code: 2,
            message: "Please enter a catagory name and corresponding tasks."
        };
        res.render('editCatagory', {taskList: tasks, catagoryName: catagory, err: error, submit: submitRoute});
    } else if(error === 3) {
        error = {
            code: 3,
            message: "Please enter tasks for the catagory."
        };
        res.render('editCatagory', {taskList: tasks, catagoryName: catagory, err: error, submit: submitRoute});
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////// Start Server //

app.listen(PORT, function () {
    console.log(`Server is running on Port ${PORT}`);
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////// For netlify deployment //

const awsServerlessExpress = require('aws-serverless-express');

const server = awsServerlessExpress.createServer(app);

// NOTE: No need to serve static files using express.static

// export.handlers for netlify:
exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
