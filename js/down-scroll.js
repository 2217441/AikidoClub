// Code for handling down arrow at the headline section
// Function : User clicks the arrow and it will scroll to page highlight

document.getElementById('downarrow').addEventListener('click', function() {
    document.getElementById('head-scroll').scrollIntoView({
        behavior: 'smooth',

    });
});