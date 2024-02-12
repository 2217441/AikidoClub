//This code provide an darken effect to cards in homepage and about us page

// Ensure that the document is fully loaded before executing the script
$(document).ready(function () {

    // Select all elements with the class 'card-link' and store them in the 'cardLinks' variable
    const cardLinks = $('.card-link');
    
    // Select all elements with the class 'card-overlay' and store them in the 'cardOverlays' variable
    const cardOverlays = $('.card-overlay');

    // Iterate through each 'card-link' element using the 'each' function
    cardLinks.each(function (index) {
        // Add mouseenter event listener to the current 'card-link' element
        $(this).on('mouseenter', function () {
            // Change the background color of the corresponding 'card-overlay' on mouseenter
            cardOverlays.eq(index).css({
                'background-color': 'rgba(0, 0, 0, 0.8)',
                'transition': 'background-color 0.7s ease'
            });
        });

        // Add mouseleave event listener to the current 'card-link' element
        $(this).on('mouseleave', function () {
            // Restore the background color of the corresponding 'card-overlay' on mouseleave
            cardOverlays.eq(index).css({
                'background-color': 'rgba(0, 0, 0, 0.5)',
                'transition': 'background-color 0.7s ease'
            });
        });
    });
});
