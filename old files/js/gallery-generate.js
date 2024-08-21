//The code manage the gallery. It generate gallery-container structure,  add images to it 
//and handle events go next and previous image. It also handle the number gallery-container in page(default is 2)
//and create button to generate more gallery-container. ChatGPT improve the code functioning
//Some part in gallery-container was designed based on https://www.w3docs.com/tools/code-editor/3718#google_vignette

// Execute the following code once the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // Select the gallery parent container
  const gallery = document.getElementById('gallery-parent');

  // Initialize variables for gallery generation
  let dataLength = 0;
  let numGallery = 2; // Number of the gallery-container structure will be generated by default, if there is more, button to load more will be added
  let i = 0;
  let dataGenerated = 0;

  // Fetch data from gallery-pic.json using the Fetch API
  fetch('/js/json/gallery-pic.json')
      .then(response => response.json())
      .then(data => {
          dataLength = data.length; // Store the length of the data array
          generateGallery(data); // Call the function to generate the gallery
      })
      .catch(error => console.error('Error fetching data:', error));

  // Function to generate the gallery based on the provided data
  function generateGallery(data) {
      // Loop through the data array using a for loop
      for (i; i < numGallery; i++, dataGenerated++) {
          const item = data[i];
          const galleryContainer = document.createElement('div');
          galleryContainer.className = 'gallery-container';

          // Create eventDetail div
          const eventDetail = document.createElement('div');
          eventDetail.className = 'eventDetail';
          galleryContainer.appendChild(eventDetail);

          // Create eventTitle paragraph
          const eventTitle = document.createElement('p');
          eventTitle.className = 'eventTitle';
          eventTitle.textContent = item.eventTitle;
          eventDetail.appendChild(eventTitle);

          // Create eventDate paragraph
          const eventDate = document.createElement('p');
          eventDate.className = 'eventDate';
          eventDate.textContent = item.eventDate;
          eventDetail.appendChild(eventDate);

          // Create slideshow-container div
          const slideshowContainer = document.createElement('div');
          slideshowContainer.className = 'slideshow-container';
          galleryContainer.appendChild(slideshowContainer);

          // Loop through the images array to create image slides
          for (let j = 0; j < item.images.length; j++) {
              const img = item.images[j];

              // Create mySlides div
              const mySlides = document.createElement('div');
              mySlides.className = 'mySlides fade';
              slideshowContainer.appendChild(mySlides);

              // Create img-wrapper div
              const imgWrapper = document.createElement('div');
              imgWrapper.className = 'img-wrapper';
              mySlides.appendChild(imgWrapper);

              // Create img-el image
              const imgEl = document.createElement('img');
              imgEl.className = 'img-el';
              imgEl.src = img.src;
              imgEl.alt = img.alt;
              imgEl.loading = 'lazy'; // Enable lazy loading
              imgWrapper.appendChild(imgEl);
          }

          // Create navigation buttons for the slideshow
          const prevBtn = document.createElement('a');
          prevBtn.className = 'prev';
          prevBtn.innerHTML = '&#10094;';
          slideshowContainer.appendChild(prevBtn);

          const nextBtn = document.createElement('a');
          nextBtn.className = 'next';
          nextBtn.innerHTML = '&#10095;';
          slideshowContainer.appendChild(nextBtn);

          //Separate the image slider with button / dot indicators
          const br = document.createElement('br');
          galleryContainer.appendChild(br);

          // Create dot-group div for slide indicators
          const dotGroup = document.createElement('div');
          dotGroup.className = 'dot-group';
          dotGroup.style = 'text-align:center';
          galleryContainer.appendChild(dotGroup);

          // Loop to create dots for each image slide
          for (let d = 0; d < item.images.length; d++) {
              const dot = document.createElement('span');
              dot.className = 'dot';
              let methodName = 'currentSlide(' + (d + 1) + ')';
              dot.onclick = methodName;
              dotGroup.appendChild(dot);
          }

          gallery.appendChild(galleryContainer); // Append the entire gallery container to the parent
      }

      slideControl(); // Call the function to control the slideshow

      // Check if there are more data to load and if the current gallery count is even
      if (dataGenerated != dataLength && i % 2 == 0) {
          loadMoreGallery(data); // Call the function to load more gallery items
      }
  }

  // Function to load more gallery items.
  function loadMoreGallery(data) {
      const loadMore = document.createElement('button'); //Button for user to load more gallery container
      gallery.appendChild(loadMore);
      loadMore.textContent = "Load More";
      let numLeftData = dataLength - dataGenerated;//Get number of gallery container that not displayed at the page

      let addNumGallery = 0;
      // Determine how many gallery container to add based on the remaining data
      if (numLeftData == 1) { //If there are only one left
          addNumGallery = 1;//Show last gallery-container
      } else {//If there are more than one, 2 and above
          addNumGallery = 2;//Show 2 more gallery container. Note that the button load more only generate 2 container only
          //If there are more than 2, the load more button will created again until no more gallery container can be generate.
      }

      // Attach a click event to the 'Load More' button
      loadMore.addEventListener('click', function () {
          numGallery += addNumGallery;//add number of gallery container will be displayed at the page
          generateGallery(data);//generate again but with new numGallery
          slideControl();//Make sure the button and dot function  still work after adding new content
          gallery.removeChild(loadMore);//remove button after user clicked
      });
  }

  // Function to control the slideshow for each gallery item
  function slideControl() {
      // Select all gallery containers with the 'gallery-container' class
      const galleryContainers = document.querySelectorAll('#gallery-parent .gallery-container');

      // Iterate through each gallery container
      galleryContainers.forEach((galleryContainer) => {
          // Find elements inside each gallery-container
          const eventDetail = galleryContainer.querySelector('.eventDetail');
          const slideshowContainer = galleryContainer.querySelector('.slideshow-container');
          const prevButton = galleryContainer.querySelector('.prev');
          const nextButton = galleryContainer.querySelector('.next');
          const dots = [...galleryContainer.querySelectorAll('.dot')];

          // Initialize slideIndex for each gallery-container
          let slideIndex = 1;

          // Create a closure function to handle the current gallery-container
          const showSlides = (n) => {
              const slides = slideshowContainer.getElementsByClassName("mySlides");

              // Adjust the slide index if it goes beyond the total number of slides
              if (n > slides.length) {
                  slideIndex = 1;
              }

              //  Stop showing any visible slides when we move to another set of images
              if (n < 1) {
                  slideIndex = slides.length;
              }

              //  Show the image in the slide that corresponds to the slide index, hide others
              for (let i = 0; i < slides.length; i++) {
                  slides[i].style.display = "none";
              }

              //  Add/remove active class from buttons and dots
              for (let i = 0; i < dots.length; i++) {
                  dots[i].className = dots[i].className.replace(" active", "");
              }
              slides[slideIndex - 1].style.display = "block";
              dots[slideIndex - 1].className += " active";
          }

          // Add event listeners for each gallery-container
          prevButton.addEventListener('click', () => {
              plusSlides(-1, galleryContainer);//go back prev slide
          });

          nextButton.addEventListener('click', () => {
              plusSlides(1, galleryContainer);//go next slide
          });

          //Add event listener to each dot. the dot  that is clicked will be highlighted and the corresponding image will be shown.
          dots.forEach((dot, index) => {
              dot.addEventListener('click', () => {
                  currentSlide(index + 1, galleryContainer);
              });
          });

          // Modify the plusSlides and currentSlide functions to accept a galleryContainer parameter
          function plusSlides(n, galleryContainer) {
              showSlides(slideIndex += n, galleryContainer);
          }

          //  Call showSlides with the initial slide index and the gallery container that was clicked on
          function currentSlide(n, galleryContainer) {
              showSlides(slideIndex = n, galleryContainer);
          }

          // Initialize the first gallery-container
          showSlides(slideIndex, galleryContainer);
      });
  };

});