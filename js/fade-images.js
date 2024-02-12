//This code handle the behavior of selected image container that will have fade in/out effect. The code has been improved using Chatgpt

// Wait for the document to be fully loaded before executing the script
$(document).ready(function() {
  // Function to handle fading images in the 'image-container'
  function fadeImages() {
      // Select all elements with the class 'fade-in' inside '.image-container'
      var $images = $('.image-container .fade-in');
      
      // Initialize the index of the current visible image
      var currentImageIndex = 0;

      // Function to fade in the next image in a loop
      function fadeNextImage() {
          // Fade out the current image over a duration of 2500 milliseconds
          $images.eq(currentImageIndex).fadeOut(2500, function() {
              // Update the index to the next image in a circular manner(make it loop)
              currentImageIndex = (currentImageIndex + 1) % $images.length;

              // Fade in the next image over a duration of 2500 milliseconds and recursively call the function
              $images.eq(currentImageIndex).fadeIn(2500, fadeNextImage);
          });
      }

      // Start the initial call to fade the images
      fadeNextImage();
  }

  // Start the image fading animation when the document is ready
  fadeImages();
});

  