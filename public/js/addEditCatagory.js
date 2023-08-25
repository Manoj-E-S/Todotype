
const enterKey = 13;
const deleteKey = 46;

$(document).ready(function() {

    $(document).keydown(function(event) {
        if (event.keyCode === enterKey && !event.shiftKey) {
            event.preventDefault();
            $('#catagoryForm').attr('action', '/addTask');
            $('#catagoryForm').submit();
        }
        else if (event.keyCode === deleteKey) {
            event.preventDefault();
            let removeItemBtn = $('input[name=removeItemDesc]:focus').next('button');
            if (removeItemBtn.length === 1) {
                removeItemBtn.trigger('click');
            } else {
                window.alert('No item selected');
                console.log('No item selected');
            }
        }
        else if (event.keyCode === enterKey && event.shiftKey) {
            event.preventDefault();
            const actionRoute = $('#submitCatagory').attr('formaction');
            $('#catagoryForm').attr('action', `${actionRoute}`);
            $('#catagoryForm').submit();
        }
    });

});