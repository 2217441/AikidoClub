// Code for generating structure for past activities section in Activities
// Function : Get selection from dropdown part and generate the content using 
// past-club-activities.json

document.addEventListener('DOMContentLoaded', function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const activitiesContainer = document.querySelector('.activities');


    
    // Fetch JSON data
    fetch('past-club-activities.json') // Replace with the correct path to your JSON file
        .then(response => response.json())
        .then(data => {
            // Initial load
            updateActivities(dropdownMenu.value, data);

            // Update activities whenever dropdown changes
            dropdownMenu.addEventListener('change', function() {
                updateActivities(this.value, data);
            });
        });

    // Function to update the activities container based on dropdown selection
    function updateActivities(selectedOption, data) {
        const selectedData = data[selectedOption];
        console.log(selectedOption)
        if (selectedData) {
            // Clear previous content
            activitiesContainer.innerHTML = '';

            // acts-slide
            const actsSlide = document.createElement('div');
            actsSlide.className = 'acts-slide';


            // Create the slide title and slide head
            const slideHead = document.createElement('div')
            const slideTitle = document.createElement('h1');
            slideHead.className = 'slide-head';
            slideTitle.className = 'slide-title tracking-in-expand';
            slideTitle.textContent = selectedData.title;
            slideHead.appendChild(slideTitle)
            actsSlide.appendChild(slideHead);

            // Create the swiper structure
            const swiperWrapper = document.createElement('div');
            swiperWrapper.className = 'swiper-wrapper';

            // Loop through the content array to create slides
            selectedData.content.forEach(item => {
                const swiperSlide = document.createElement('div');
                swiperSlide.className = 'swiper-slide past-slide scale-in-center';

                // Create the image container
                const pastImgCtnr = document.createElement('div');
                pastImgCtnr.className = 'past-img-ctnr';

                const pastImg = document.createElement('img');
                pastImg.className = 'past-img';
                pastImg.src = item["image-path"];
                pastImg.alt = item["act-name"];

                pastImgCtnr.appendChild(pastImg);

                const actName = document.createElement('h1');
                actName.className = 'act-name';
                actName.textContent = item["act-name"];

                const actDetails = document.createElement('p');
                actDetails.className = 'act-details';
                actDetails.textContent = item["act-desc"];

                if (item["act-desc"].length == 0) {
                    actDetails.textContent = "No extra details...";
                } else {
                    actDetails.textContent = item["act-desc"];
                }



                const actDate = document.createElement('p');
                actDate.className = 'act-date';
                actDate.textContent = "Date: " + item["act-date"];

                swiperSlide.appendChild(pastImgCtnr);
                swiperSlide.appendChild(actName);
                swiperSlide.appendChild(actDate);
                swiperSlide.appendChild(actDetails);

                if (item["act-file"].length !== 0) {
                    const actFileButton = document.createElement('a');
                    const actFile = document.createElement('button');
                    actFile.className = 'act-file';
                    actFileButton.href = item["act-file"];
                    actFile.textContent = 'Browse Taken Pictures';
                    actFileButton.setAttribute('target', '_blank');
                    actFileButton.appendChild(actFile);
                    swiperSlide.appendChild(actFileButton);
                }

                swiperWrapper.appendChild(swiperSlide);
            });

            // Add swiper structure to the container
            const swiperContainer = document.createElement('div');
            swiperContainer.className = 'swiper past-swiper';
            swiperContainer.appendChild(swiperWrapper);

            // Add pagination and navigation buttons
            const bulletContainer = document.createElement('div')
            bulletContainer.classList.add('bullet-container');
            // Add pagination and navigation buttons
            const swiperPagination = document.createElement('div');
            swiperPagination.classList.add('swiper-pagination', 'late-bullet');
            bulletContainer.appendChild(swiperPagination)

            swiperContainer.appendChild(bulletContainer);

            const width = window.innerWidth;  // Get the width of the device in pixels

            if (width >= 1080) {
                const swiperButtonPrev = document.createElement('div');
                swiperButtonPrev.classList.add('swiper-button-prev','past-prev');

                const swiperButtonNext = document.createElement('div');
                swiperButtonNext.classList.add('swiper-button-next','past-next');
                
                swiperContainer.appendChild(swiperButtonPrev);
                swiperContainer.appendChild(swiperButtonNext);
            }



            actsSlide.appendChild(swiperContainer);
            activitiesContainer.appendChild(actsSlide);

            // Initialize Swiper (make sure to include the Swiper JS library in your project)
            new Swiper('.past-swiper', {
                slidesPerView: 1, 
                spaceBetween: 20,         // Show one slide at a time
                loop: false,

            
                breakpoints: {
                    // when window width is >= 480px
                    481: {
                      slidesPerView: 2,
                      spaceBetween: 20
                    },
                    1081: {
                      slidesPerView: 3,
                      spaceBetween: 40,
                    }
                  },


                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true, // Makes pagination bullets clickable
                },
            });
        } else {
            activitiesContainer.innerHTML = 'No activities available for this option.';
        }
    }
});

