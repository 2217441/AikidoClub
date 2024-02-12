// Selecting the form element and relevant components using document.querySelector
const form = document.querySelector("form"),
    nextBtn = form.querySelector(".nextBtn"),
    allInput = form.querySelectorAll(".first input");

// Adding an event listener to the 'Next' button for form validation and transition
nextBtn.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Initializing a variable to check if the form is valid
    let isFormValid = true;
    

    // Iterating through all input fields for validation
    allInput.forEach(input => {
        // Checking if the input value is empty
        if (input.value === "") {
            isFormValid = false;
            // Setting a red border for invalid input
            input.style.border = "2px solid red";
            return;
        } else if (!/^[a-zA-Z0-9\s\W]+$/.test(input.value)) {
            // Checking if the input value contains only letters, numbers, spaces, and special characters
            isFormValid = false;
            // Setting a red border for invalid input
            input.style.border = "2px solid red";
            return;
        } else {
            // Resetting the border to none for valid input
            input.style.border = "none";
        }
    });

    // Checking if the overall form is valid
    if (isFormValid) {
        // Adding a class to the form to activate the second part
        form.classList.add('secActive');
    } else {
        // Removing the class if the form is not valid
        form.classList.remove('secActive');
    }
});
