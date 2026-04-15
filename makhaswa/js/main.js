document.addEventListener("DOMContentLoaded", () => {
    const mobileBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");
    const navLinks = document.querySelectorAll(".mobile-menu a");

    // Toggle Mobile Menu
    function toggleMenu() {
        mobileMenu.classList.toggle("active");
        if (mobileMenu.classList.contains("active")) {
            menuIcon.innerText = "close";
        } else {
            menuIcon.innerText = "menu";
        }
    }

    mobileBtn.addEventListener("click", toggleMenu);

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (mobileMenu.classList.contains("active")) {
                toggleMenu();
            }
        });
    });

    // Optional: Add shadow to nav on scroll
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });
});