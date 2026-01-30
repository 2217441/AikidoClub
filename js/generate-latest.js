// Code for generating structure for latest activities section in Activities
// Function : Auto generate the latest activities based on data in latest-club-activities.json

document.addEventListener('DOMContentLoaded', function() {
    // Only run on pages with the container
    const parentContainer = document.querySelector('.late-swiper-container');
    if (!parentContainer) return;

    // Fetch the JSON data
    fetch('latest-club-activities.json')
        .then(response => response.json())
        .then(data => {
            
            if (data.length != 0) {
                const swiperWrapper = document.createElement('div');
                swiperWrapper.className = 'swiper-wrapper';
    
    
                // Loop through the JSON data and generate slides
                data.forEach(activity => {
                    // Create a slide container
                    const slide = document.createElement('div');
                    slide.classList.add('swiper-slide', 'late-slide','scale-in-center');
    
                    // Create the image container and image element
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add('late-img-ctnr', 'color-change-3x');
                    const img = document.createElement('img');
                    img.classList.add('late-img');
                    img.src = activity.src;
                    img.alt = activity.lateTxt || "Activity Image"; // Fallback alt text
    
                    imgContainer.appendChild(img);
    
                    // Create the title element
                    const title = document.createElement('h1');
                    title.classList.add('late-txt','tracking-in-expand');
                    title.textContent = activity.lateTxt;
    
                    // Create the description element
                    const desc = document.createElement('p');
                    desc.classList.add('late-desc');
                    desc.textContent = activity.lateDesc;
    
                    // Create the button element
                    const link = document.createElement('a');
                    const button = document.createElement('button');
                    button.classList.add('late-btn');
                    button.textContent = 'Learn More';
                    if (activity.linkButton.length === 0) {
                        link.setAttribute('href', 'javascript:void(0)');
                    } else {
                        button.textContent = 'Learn more';
                        link.setAttribute('href', activity.linkButton);
                        link.setAttribute('target', '_blank');
                        link.appendChild(button);
                    }
    
                    slide.appendChild(imgContainer);
                    slide.appendChild(title);
                    slide.appendChild(desc);
                    slide.appendChild(link);
    
      
                    // Append the slide to the swiper wrapper
                    swiperWrapper.appendChild(slide);
                    
    
                });
                const swiper = document.createElement('div');
                swiper.classList.add('swiper', 'late-swiper');
                swiper.appendChild(swiperWrapper);
                
                const width = window.innerWidth;  // Get the width of the device in pixels

                const bulletContainer = document.createElement('div')
                bulletContainer.classList.add('bullet-container');
                // Add pagination and navigation buttons
                const swiperPagination = document.createElement('div');
                swiperPagination.classList.add('swiper-pagination', 'late-bullet');
                bulletContainer.appendChild(swiperPagination)
                swiper.appendChild(bulletContainer);



                if (width >= 1080) {
                    const swiperButtonPrev = document.createElement('div');
                    swiperButtonPrev.classList.add('swiper-button-prev','late-prev');
    
                    const swiperButtonNext = document.createElement('div');
                    swiperButtonNext.classList.add('swiper-button-next','late-next');
                    
                    swiper.appendChild(swiperButtonPrev);
                    swiper.appendChild(swiperButtonNext);
                }



                
                parentContainer.appendChild(swiper);
    
    
                // Initialize the Swiper (assuming you have Swiper.js included)
                const lateswiper = new Swiper('.late-swiper', {
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
                const noContent = document.createElement('h3');
                noContent.className = 'noContent-txt';
                noContent.textContent = 'No latest activitites.'
                parentContainer.appendChild(noContent)
            }
        })
        .catch(error => { 
            console.error('Error fetching JSON data:', error)
        
            const noContent = document.createElement('h3');
            noContent.className = 'noContent-txt';
            noContent.textContent = 'No latest activitites.'
            parentContainer.appendChild(noContent)
        
        });
});
