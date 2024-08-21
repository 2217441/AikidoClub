//The code manage the behaviour of big slideshow. Control the event for buttons,
//Create slides structure and how it will be animated

// Wait for the DOM content to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', function () {
  // Get the slides container element
  const slides = document.getElementById('slides-group');

  // JSON link for slide images data
  const jsonLink = '/js/json/slides-image.json';

  // Function to create a slide image element structure using the data in json file
  function createSlideImage(slideInfo) {
      const image = document.createElement('img');
      image.classList.add('slide');
      image.src = slideInfo.imageSrc;
      image.alt = slideInfo.altName;
      image.width = '100%';

      // Append the image to the slides container
      slides.appendChild(image);
  }

  // Function to load slides using data from JSON
  function loadSlide(data) {
      data.forEach(slideInfo => {
          createSlideImage(slideInfo);
      });
  }

  // Get elements related to slide navigation
  const slideGroup = document.getElementById('slides-group');
  let slideIndex = 0;
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Attach event listeners for next and previous buttons
  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  // Function to handle next slide button click(can make it loop)
  function nextSlide() {
      slideIndex = (slideIndex + 1) % slideGroup.children.length;
      updateSlider();
  }

  // Function to handle previous slide button click(can make it loop)
  function prevSlide() {
      slideIndex = (slideIndex - 1 + slideGroup.children.length) % slideGroup.children.length;
      updateSlider();
  }

  // Function to update the slider position based on the current slide index
  function updateSlider() {
      const translateValue = -slideIndex * 100 + '%';
      slideGroup.style.transform = 'translateX(' + translateValue + ')';
  }

  // Automatically change slide every 5 seconds (adjust as needed)
  setInterval(nextSlide, 5000);

  // Fetch JSON data for slide images
  fetch(jsonLink)
      .then(response => response.json())
      .then(data => {
          loadSlide(data);
      })
      .catch(error => console.error('Error fetching JSON slide image', error));
});
