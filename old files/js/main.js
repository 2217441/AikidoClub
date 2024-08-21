$(document).ready(function () {
  // Function to display current time
  function showTime() {
      // Get current time/date
      var date = new Date();

      // Make Variables to get hours, minute, and second
      var hours = date.getHours();
      var min = date.getMinutes();
      var sec = date.getSeconds();

      // AM, PM Setting
      var session = "AM";

      // Conditions for time behavior
      if (hours == 0) {
          hours = 12;
      }

      if (hours >= 12) {
          session = "PM";
      }

      if (hours > 12) {
          hours = hours - 12;
      }

      // Add leading zeros if necessary
      hours = hours < 10 ? "0" + hours : hours;
      min = min < 10 ? "0" + min : min;
      sec = sec < 10 ? "0" + sec : sec;

      // Set the variable to span elements with corresponding IDs
      $("#hours").text(hours);
      $("#min").text(min);
      $("#sec").text(sec);
      $("#period").text(session);

      // To update time every second
      setTimeout(showTime, 1000);
  }
  // Initial call to showTime function
  showTime();
});

  