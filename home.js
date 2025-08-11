// Show popup after 10 seconds
window.addEventListener('load', function () {
  setTimeout(function () {
    document.getElementById('newsletterPopup').style.display = 'flex';
  }, 10000);
});

// Close popup function
function closePopup() {
  document.getElementById('newsletterPopup').style.display = 'none';
}


  document.getElementById("sign-in-btn").onclick = function () {
    window.location.href = "Contact_us.html"; // change to your desired page
  };


