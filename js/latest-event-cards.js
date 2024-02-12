//The code handle the event card layout and detail. It generate the card 
//from the json file

// Execute the following code once the DOM is fully loaded
$(document).ready(function () {

  // Select the container element for event cards
  const cardContainer = $('#card-container');

  // Define the URL for the JSON data containing event details
  const jsonUrl = 'js/json/latest-event.json';

  // Function to create a card element based on event details
  function createCardElement(eventDetail) {
      // Create a div element with the 'cardLayout' class
      const cardLayout = $('<div>').addClass('cardLayout');

      // Create an image element for the event poster with appropriate attributes
      const poster = $('<img>').addClass('event-poster').attr({
          'src': eventDetail.posterDir,
          'alt': eventDetail.titleEvent
      });
      cardLayout.append(poster); // Append the poster to the card layout

      // Create an h2 element for the event title with the 'title-event' class
      const titleEvent = $('<h2>').addClass('title-event').text(eventDetail.titleEvent);
      cardLayout.append(titleEvent); // Append the title to the card layout

      // Create a p element for the event description with the 'desc-event' class
      const descEvent = $('<p>').addClass('desc-event').text(eventDetail.descEvent);
      cardLayout.append(descEvent); // Append the description to the card layout

      // Create an anchor element for the event registration link
      const linkEvent = $('<a>');

      // Check if the event has a registration link
      if (eventDetail.linkEvent.length == 0) {
          // Display 'Event Ended' if no registration link is present
          linkEvent.text('Event Ended').attr({
              'href': 'javascript:void(0)',
              'style': 'opacity: 0.4;'
          });
      } else {
          // Display 'Register Now' with the registration link
          linkEvent.text('Register Now').attr({
              'href': eventDetail.linkEvent,
              'target': '_blank'
          });
      }

      cardLayout.append(linkEvent); // Append the registration link to the card layout
      cardContainer.append(cardLayout); // Append the entire card layout to the container
  }

  // Function to load event cards from JSON data
  function loadCards(data) {
      // Iterate through each event detail and create corresponding card elements
      data.forEach(eventDetail => {
          createCardElement(eventDetail);
      });
  }

  // Fetch JSON data using jQuery's getJSON method
  $.getJSON(jsonUrl, function (data) {
      loadCards(data); // Call the loadCards function with the fetched data
  })
  .fail(function (error) {
      console.error('Error fetching JSON:', error);
  });
});
