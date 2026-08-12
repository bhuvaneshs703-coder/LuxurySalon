// =========================================
// NAVIGATION / SMOOTH SCROLL
// =========================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const targetId = this.getAttribute("href");

        if (targetId === "#" || targetId === "#top") {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }

        const target = document.querySelector(targetId);

        if (target) {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


const navbar = document.querySelector("nav");

window.addEventListener("scroll", function () {

    if (window.scrollY > 100) {

        navbar.style.background = "#ffffff";
        navbar.style.backdropFilter = "none";
        navbar.style.webkitBackdropFilter = "none";
        navbar.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.12)";

        document.querySelectorAll("nav ul li a").forEach(link => {
            link.style.color = "#222";
        });

    } else {

        navbar.style.background =
            "rgba(20,20,20,0.35)";

        navbar.style.backdropFilter =
            "blur(18px)";

        navbar.style.webkitBackdropFilter =
            "blur(18px)";

        navbar.style.boxShadow =
            "0 8px 32px rgba(0,0,0,0.25)";

        document.querySelectorAll("nav ul li a").forEach(link => {
            link.style.color = "white";
        });

    }

});

// =========================================
// SCROLL ANIMATION
// =========================================

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

            }

        });

    },
    {
        threshold: 0.15
    }
);


document.querySelectorAll(
    ".card, .about-image, .about-text"
).forEach(element => {

    element.classList.add("hidden");

    observer.observe(element);

});


// =========================================
// REVEAL SECTIONS
// =========================================

function reveal() {

    const reveals =
        document.querySelectorAll(".reveal");

    reveals.forEach(element => {

        const windowHeight =
            window.innerHeight;

        const revealTop =
            element.getBoundingClientRect().top;

        if (revealTop < windowHeight - 100) {

            element.classList.add("active");

        }

    });

}

window.addEventListener("scroll", reveal);

reveal();


// =========================================
// APPOINTMENT BOOKING
// =========================================

const appointmentForm =
    document.getElementById("appointmentForm");


if (appointmentForm) {

    appointmentForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const name =
                appointmentForm
                    .querySelector('input[type="text"]')
                    .value;

            const phone =
                appointmentForm
                    .querySelector('input[type="tel"]')
                    .value;

            const service =
                appointmentForm
                    .querySelector("select")
                    .value;

            const date =
                appointmentForm
                    .querySelector('input[type="date"]')
                    .value;

            const time =
                appointmentForm
                    .querySelector('input[type="time"]')
                    .value;


            const appointment = {

                name: name,
                phone: phone,
                service: service,
                date: date,
                time: time

            };


            try {

                const response =
                    await fetch(
                        "http://localhost:3000/appointments",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    appointment
                                )
                        }
                    );


                const result =
                    await response.json();


                if (response.ok) {

                    alert(
                        "✅ " +
                        (
                            result.message ||
                            "Appointment booked successfully!"
                        )
                    );

                    appointmentForm.reset();

                } else {

                    alert(
                        "❌ " +
                        (
                            result.message ||
                            "Something went wrong."
                        )
                    );

                }


            } catch (error) {

                console.error(
                    "Appointment error:",
                    error
                );

                alert(
                    "❌ Could not connect to the salon server. Please make sure the server is running."
                );

            }

        }
    );

}