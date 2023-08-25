
var checkboxValues = {};

function repopulateCheckboxes(){
    var checkboxItems = JSON.parse($.cookie('checkboxValues'));
    if(checkboxItems){
        Object.keys(checkboxItems).forEach(function(element) {
            var checked = checkboxItems[element];
            $("#" + element).prop('checked', checked);
            checkboxValues[element] = checked;
        });
    }
}

$(document).ready(function () {

    try {
        repopulateCheckboxes();
    } catch (error) {
        console.log(error);
    }

    let delBtns = $('button[name="delete"]');

    delBtns.click(function (event) {
        event.preventDefault();
        let id;
        if ($(event.target).parent().attr('id') === undefined) {
            if (event.target.id.includes('delete')) {
                id = event.target.id.replace('delete', '');
            } else {
                id = $(event.target).parentsUntil('button').parent().attr('id').replace('delete', '');
            }
        } else {
            id = $(event.target).parent().attr('id').replace('delete', '');
        }
        $.ajax({
            url: '/deleteCatagory',
            type: 'POST',
            data: {catagoryName: id},
            success: function (data) {
                // `data` is the response from the server. It is the `index.ejs` file.
                location.reload();
            },
            failure: function (jqXHR, textStatus, errorThrown) {
                alert('Error: ' + jqXHR.responseText);
            }
        });
    });


    let editBtns = $('button[name="edit"]');

    editBtns.click(function (event) {
        event.preventDefault();
        let id;
        if ($(event.target).parent().attr('id') === undefined) {
            if (event.target.id.includes('edit')) {
                id = event.target.id.replace('edit', '');
            } else {
                id = $(event.target).parentsUntil('button').parent().attr('id').replace('edit', '');
            }
        } else {
            id = $(event.target).parent().attr('id').replace('edit', '');
        }
        $.ajax({
            url: '/editCatagory',
            type: 'POST',
            data: {catagoryName: id},
            success: function (POSTresponse) {
                // `POSTresponse` is the response from the server. It is the `editCatagory.ejs` file.
                // This function makes `/` route look like `/addCatagory` route, but does not redirect to `/addCatagory`
                // To redirect to `/addCatagory`:
                //      a. POSTresponse from server should just be a JS object [res.send(options);] with relavent attributes
                //      b. Here write: " window.location.href = `/addCatagory?` + encodeURIComponent(JSON.stringify(options)); "
                //      c. Google for more info on this method, of redirecting
                const insideHTML = POSTresponse.replace('<html lang="en">', '').replace('</html>', '').replace('<!DOCTYPE html>', '');
                document.querySelector('html').innerHTML = insideHTML;
            },
            failure: function (jqXHR, textStatus, errorThrown) {
                alert('Error: ' + jqXHR.responseText);
            }
        });
    });

    $(":checkbox").click(function(){
        checkboxValues[this.id] = this.checked;
        $.cookie('checkboxValues', JSON.stringify(checkboxValues), { expires: 7, path: '/' }); //expires in 7 days!
    });
});