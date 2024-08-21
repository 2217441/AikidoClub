//This code control behaviour of floating navigation/navigation for phone layout.

// Wait for the document to be fully loaded before executing the script
$(document).ready(function() {
  // Select the menu icon(three bar icon) and floating navigation container
  var menuIcon = $("#menu-icon");
  var nav = $("#floatingNavContainer");

  // Set the initial display of the floating navigation container to none
  nav.css("display", "none");

  // Attach a click event listener to the menu icon
  menuIcon.on("click", function() {
    // Toggle the 'change' class on the menu icon(user click the button)
    menuIcon.toggleClass("change");

    // Check if the floating navigation container is currently hidden(user not click the nav icon before current event)
    if (nav.css("display") === "none") {
      // If hidden, display the container and animate its entrance
      nav.css("display", "block");
      animateElement(nav, 0.3);
    } else {
      // If visible, hide the container(user close the nav container)
      nav.css("display", "none");
    }
  });

  // Function to animate the entrance of an element with a given duration
  function animateElement(element, duration) {
    // Set the initial style properties
    element.css({
      "transition": `transform ${duration}s`,
      "transform": "translateX(100%)"
    });

    // Set the final style properties after a small delay
    setTimeout(function() {
      element.css("transform", "translateX(0)");
    }, 10);
  }
});
