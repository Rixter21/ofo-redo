require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 3000;
const fs = require("fs");

// middleware to parse json request bodies
app.use(express.json());

// Configure static assets with compression and caching
const compression = require("compression");
app.use(compression());
app.use(
  express.static(path.join(__dirname, "public"), {
    extensions: ["html"],
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
  })
);

// Add more debugging information
console.log("Available HTML files:");
const htmlFiles = fs
  .readdirSync(path.join(__dirname, "public"))
  .filter((file) => file.endsWith(".html"));
console.log(htmlFiles);

// define home route
app.get("/", (req, res) => {
  console.log("Serving home page");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add explicit routes for all HTML pages
htmlFiles.forEach((file) => {
  const route = `/${file}`;
  console.log(`Adding explicit route for: ${route}`);
  app.get(route, (req, res) => {
    console.log(`Serving file directly: ${file}`);
    res.sendFile(path.join(__dirname, "public", file));
  });
});

// email template function
const emailTemplate = (name, email, message) => {
  const html = fs.readFileSync(path.join(__dirname, "email.html"), {
    encoding: "utf-8",
  });
  return html
    .replace("[name]", name)
    .replace("[email]", email)
    .replace("[message]", message);
};

// send email API route
app.post("/send-email", async (req, res) => {
  // validate body
  if (!req.body.email || !req.body.message || !req.body.name) {
    return res
      .status(400)
      .json({ message: "Name, email and message are required" });
  }

  // send email using SMTP (replace with your own SMTP server details)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"OFO New Message" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "New message from OFO Development",
      text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`,
      html: emailTemplate(req.body.name, req.body.email, req.body.message),
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add route for directly accessing PDF files
app.get("/assets/pdf/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    "public",
    "assets",
    "pdf",
    req.params.filename
  );
  console.log(`Attempting to serve PDF: ${filePath}`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.log(`PDF file not found: ${filePath}`);
    res.status(404).sendFile(path.join(__dirname, "404.html"));
  }
});

// catch-all route for unknown endpoints
app.use((req, res, next) => {
  console.log(`404 for path: ${req.path}`);

  // Check if the requested path is an HTML file in the public directory
  const htmlFilePath = path.join(__dirname, "public", req.path);
  if (fs.existsSync(htmlFilePath)) {
    console.log(`File exists but not being served: ${htmlFilePath}`);
  }

  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
