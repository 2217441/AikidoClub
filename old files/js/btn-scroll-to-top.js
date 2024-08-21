//The code control the behaviour of the scrolltotop button. Button appear when user scroll to main section of the page

// Wait for the document to be fully loaded before executing the script
$(document).ready(function () {
    // Select the 'scrollToTop' button and the 'main' section
    var scrollToTopButton = $("#scrollToTop");
    var scrBtnSection = $("main");

    // Function to check the scroll position and adjust the button's opacity accordingly
    function checkScroll() {
        // Get the offset of the 'main' section
        var scrollTriggerOffset = scrBtnSection.offset().top;

        // Check if the current scroll position is below the offset
        if ($(window).scrollTop() > scrollTriggerOffset) {
            // If true, set the button's opacity to 1
            scrollToTopButton.css("opacity", "1");
        } else {
            // If false, set the button's opacity to 0
            scrollToTopButton.css("opacity", "0");
        }
    }

    // Function to scroll to the top of the page when the button is clicked
    function scrollToTop() {
        // Animate the 'html' and 'body' elements to have scrollTop: 0 over a 'slow' duration
        $("html, body").animate({
            scrollTop: 0
        }, "slow");
    }

    // Attach the 'checkScroll' function to the window's scroll event
    $(window).scroll(checkScroll);
    
    // Attach the 'scrollToTop' function to the button's click event
    scrollToTopButton.click(scrollToTop);
});
