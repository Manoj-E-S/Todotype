const fs = require('fs');
const path = require('path');

var dateVar = new Date();
var prevCatagoryName = '';

// Grab Day of the Week as a string
module.exports.grabDay = function () {
    let today = dateVar.getDay();
    switch (today) {
        case 0:
            today = "Sunday";
            break;
        case 1:
            today = "Monday";
            break;
        case 2:
            today = "Tuesday";
            break;
        case 3:
            today = "Wednesday";
            break;
        case 4:
            today = "Thursday";
            break;
        case 5:
            today = "Friday";
            break;
        case 6:
            today = "Saturday";
            break;
        default:
            console.log("Error: today is equal to: " + today);
    }
    return today;
};

// Grab Catagories from catagoryList.txt
var grabCatagories = function () {
    let catagories = [];
    let file = fs.readFileSync(path.join(__dirname, '../catagoryList.txt'), 'utf8');
    let lines = file.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
        catagories.push(JSON.parse(lines[i]));
    }
    return catagories;
};
module.exports.grabCatagories = grabCatagories;

// Check and Update Catagory List
exports.checkAndUpdateCatagoryList = function (data, tasks, submitRouteCaller) {
    let catagories = grabCatagories();
    let returnFlag = 0;

    // returnFlag values:
    // Return 1 if catagory already exists
    // Return 2 if catagory name or tasks or both are empty
    // Return 3 if no task is entered
    // Return 4 if catagory name is changed (during edit)
    // Return 0 if no errors

    // Check if catagory name is empty (check for returnFlag = 2)
    data.newTask = "NaN";
    const isEmpty = Object.values(data).some((x) => x === null || x === '');

    if (isEmpty) {
        console.log("Please enter a Catagory Name");
        returnFlag = 2;
        return returnFlag;
    }

    // Check if catagory already exists (check for returnFlag = 1) when user is creating a new catagory
    if(submitRouteCaller !== 'finalizeEdit') {
        catagories.forEach(function (catagory) {
            if (catagory.catagoryName === data.catagoryName) {
                console.log("Catagory already exists\nPlease provide a new name.");
                returnFlag = 1;
            }
        });
    }

    if (returnFlag) {
        return returnFlag;
    }
    
    // Check if tasks are empty (check for returnFlag = 3)
    object = {
        catagoryName: data.catagoryName,
        taskList: tasks,
    };

    if (object.taskList.length === 0) {
        console.log("Please enter tasks for the catagory");
        returnFlag = 3;
        return returnFlag;
    }

    // Add catagory or Edit catagory and update catagoryList.txt (returnFlag = 0, so do the intended task)
    let file = fs.openSync(path.join(__dirname, '../catagoryList.txt'), 'a');
    console.log(`File (ID:${file}) opened.`);

    if(submitRouteCaller === 'finalizeEdit') {

        fs.writeFileSync(path.join(__dirname, '../catagoryList.txt'), '', function (err) {
            if (err) throw err;
            console.log(`File (ID:${file}) updated.`);
        });

        let isNameChanged = true;
        catagories.forEach(function (catagory) {
            if (catagory.catagoryName === data.catagoryName) {
                isNameChanged = false;
                catagory.taskList = tasks;
            }
            fs.appendFileSync(path.join(__dirname, '../catagoryList.txt'), JSON.stringify(catagory) + '\n', function (err) {
                if (err) throw err;
                console.log(`File (ID:${file}) updated.`);
            });
        });

        if(isNameChanged) {
            fs.writeFileSync(path.join(__dirname, '../catagoryList.txt'), '', function (err) {
                if (err) throw err;
                console.log(`File (ID:${file}) updated.`);
            });
            catagories.forEach(function (catagory) {
                if (catagory.catagoryName !== prevCatagoryName) {
                    fs.appendFileSync(path.join(__dirname, '../catagoryList.txt'), JSON.stringify(catagory) + '\n', function (err) {
                        if (err) throw err;
                        console.log(`File (ID:${file}) updated.`);
                    });
                }
            });
            fs.appendFileSync(path.join(__dirname, '../catagoryList.txt'), JSON.stringify(object) + '\n', function (err) {
                if (err) throw err;
                console.log(`File (ID:${file}) updated.`);
            });
            prevCatagoryName = '';
        }

    } else if(submitRouteCaller === 'submitCatagory') {
        fs.appendFileSync(path.join(__dirname, '../catagoryList.txt'), JSON.stringify(object) + '\n', function (err) {
            if (err) throw err;
            console.log(`File (ID:${file}) updated.`);
        });
    }

    fs.closeSync(file, function (err) {
        if (err) throw err;
        console.log(`File (ID:${file}) closed!`);
    });

    return returnFlag;
};