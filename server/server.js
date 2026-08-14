const express = require("express");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
// ==========================
// ADMIN LOGIN DETAILS
// ==========================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "luxe123";

// ==========================
// MIDDLEWARE
// ==========================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: "luxe-salon-secret",
    resave: false,
    saveUninitialized: false
}));

// ==========================
// WEBSITE FILES
// ==========================

app.use(express.static(
    path.join(__dirname, "..", "client")
));

// ==========================
// ADMIN FILES
// ==========================

const adminFolder = path.join(
    __dirname,
    "admin"
);

// ==========================
// DATA
// ==========================

const dataFolder = path.join(
    __dirname,
    "data"
);

const appointmentsFile = path.join(
    dataFolder,
    "appointments.json"
);

// Create data folder

if (!fs.existsSync(dataFolder)) {

    fs.mkdirSync(dataFolder, {
        recursive: true
    });

}

// Create appointments.json

if (!fs.existsSync(appointmentsFile)) {

    fs.writeFileSync(
        appointmentsFile,
        JSON.stringify([], null, 2)
    );

}

// ==========================
// ADMIN LOGIN PAGE
// ==========================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            adminFolder,
            "index.html"
        )
    );

});

// ==========================
// ADMIN LOGIN
// ==========================

app.post("/admin/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        req.session.loggedIn = true;

        res.json({
            success: true,
            message: "Login successful"
        });

    } else {

        res.status(401).json({
            success: false,
            message: "Invalid username or password"
        });

    }

});

// ==========================
// CHECK LOGIN
// ==========================

function requireLogin(req, res, next) {

    if (req.session.loggedIn) {

        next();

    } else {

        res.redirect("/admin");

    }

}

// ==========================
// ADMIN DASHBOARD
// ==========================

app.get(
    "/admin/dashboard.html",
    requireLogin,
    (req, res) => {

        res.sendFile(
            path.join(
                adminFolder,
                "dashboard.html"
            )
        );

    }
);

// ==========================
// SAVE APPOINTMENT
// ==========================

app.post("/appointments", (req, res) => {

    const {
        name,
        phone,
        service,
        date,
        time
    } = req.body;

    if (
        !name ||
        !phone ||
        !service ||
        !date ||
        !time
    ) {

        return res.status(400).json({
            message:
                "Please fill in all appointment details."
        });

    }

    const appointments = JSON.parse(
        fs.readFileSync(
            appointmentsFile,
            "utf8"
        )
    );

    const newAppointment = {

        id: Date.now(),

        name: name,

        phone: phone,

        service: service,

        date: date,

        time: time,

        status: "Pending"

    };

    appointments.push(
        newAppointment
    );

    fs.writeFileSync(
        appointmentsFile,
        JSON.stringify(
            appointments,
            null,
            2
        )
    );

    res.json({
        success: true,
        message:
            "Appointment booked successfully!"
    });

});

// ==========================
// GET APPOINTMENTS
// ==========================

app.get(
    "/api/appointments",
    requireLogin,
    (req, res) => {

        const appointments = JSON.parse(
            fs.readFileSync(
                appointmentsFile,
                "utf8"
            )
        );

        res.json(
            appointments
        );

    }
);

// ==========================
// UPDATE APPOINTMENT STATUS
// ==========================

app.put(
    "/api/appointments/:id/status",
    requireLogin,
    (req, res) => {

        const {
            status
        } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Completed",
            "Cancelled"
        ];

        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid appointment status."
            });

        }

        const appointments = JSON.parse(
            fs.readFileSync(
                appointmentsFile,
                "utf8"
            )
        );

        const appointment =
            appointments.find(
                appointment =>
                    String(
                        appointment.id
                    ) === String(
                        req.params.id
                    )
            );

        if (!appointment) {

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });

        }

        appointment.status =
            status;

        fs.writeFileSync(
            appointmentsFile,
            JSON.stringify(
                appointments,
                null,
                2
            )
        );

        res.json({
            success: true,
            message:
                "Appointment status updated.",
            appointment:
                appointment
        });

    }
);

// ==========================
// DELETE APPOINTMENT
// ==========================

app.delete(
    "/api/appointments/:id",
    requireLogin,
    (req, res) => {

        const appointments = JSON.parse(
            fs.readFileSync(
                appointmentsFile,
                "utf8"
            )
        );

        const appointmentId =
            String(
                req.params.id
            );

        const updatedAppointments =
            appointments.filter(
                appointment =>
                    String(
                        appointment.id
                    ) !== appointmentId
            );

        if (
            updatedAppointments.length ===
            appointments.length
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Appointment not found."
            });

        }

        fs.writeFileSync(
            appointmentsFile,
            JSON.stringify(
                updatedAppointments,
                null,
                2
            )
        );

        res.json({
            success: true,
            message:
                "Appointment deleted successfully."
        });

    }
);

// ==========================
// LOGOUT
// ==========================

app.post(
    "/logout",
    (req, res) => {

        req.session.destroy(
            () => {

                res.json({
                    success: true
                });

            }
        );

    }
);

// ==========================
// START SERVER
// ==========================

app.listen(
    PORT,"0.0.0.0"
    () => {

        console.log(
            `Luxe Salon server running at http://localhost:${PORT}`
        );

    }
);