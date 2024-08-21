// Code for toggling state of page navigation
// Function : Respond to user device and change the state of navigation part
  
  $('.menu-toggle').click(function(){
     $(".nav").toggleClass("mobile-nav");
     $(this).toggleClass("is-active");
     $("body").toggleClass("no-scroll");
  });
  