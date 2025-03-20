require("dotenv").config();
const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const winston = require("winston");
const app = express();
const port = process.env.PORT || 3000;
const fs = require("fs");

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.json(),
  defaultMeta: { service: "ofo-website" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// If not in production, log to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Validate required environment variables in production
if (process.env.NODE_ENV === "production") {
  const requiredEnvVars = [
    "MAIL_HOST",
    "MAIL_USER",
    "MAIL_PASS",
    "MAIL_PORT",
    "MAIL_FROM",
    "MAIL_SECURE",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    logger.error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
  }
}

// middleware to parse json request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP to HTTPS redirection in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    !req.secure &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Basic security headers
app.use(helmet());

// Custom Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "cdn.tailwindcss.com",
        "unpkg.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "*.webp"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      reportUri: "/csp-report",
    },
  })
);

// HSTS header
app.use(
  helmet.hsts({
    maxAge: 15552000, // 180 days in seconds
    includeSubDomains: true,
    preload: true,
  })
);

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
logger.info("Available HTML files:");
const htmlFiles = fs
  .readdirSync(path.join(__dirname, "public"))
  .filter((file) => file.endsWith(".html"));
logger.info(htmlFiles);

// Add case-studies routes
logger.info("Available case study files:");
const caseStudyFiles = fs.existsSync(
  path.join(__dirname, "public", "case-studies")
)
  ? fs
      .readdirSync(path.join(__dirname, "public", "case-studies"))
      .filter((file) => file.endsWith(".html"))
  : [];
logger.info(caseStudyFiles);

// Add explicit route for the case-studies directory
app.use(
  "/case-studies",
  express.static(path.join(__dirname, "public", "case-studies"))
);

// Add explicit route for server-status.json
app.get("/server-status.json", (req, res) => {
  // Remove logging to reduce overhead from frequent requests
  res.sendFile(path.join(__dirname, "public", "server-status.json"));
});

// define home route
app.get("/", (req, res) => {
  logger.debug("Serving home page");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add explicit routes for all HTML pages
htmlFiles.forEach((file) => {
  const route = `/${file}`;
  logger.debug(`Adding explicit route for: ${route}`);
  app.get(route, (req, res) => {
    logger.debug(`Serving file directly: ${file}`);
    res.sendFile(path.join(__dirname, "public", file));
  });
});

// Add explicit routes for case studies
caseStudyFiles.forEach((file) => {
  const route = `/case-studies/${file}`;
  logger.debug(`Adding explicit route for: ${route}`);
  app.get(route, (req, res) => {
    logger.debug(`Serving case study file directly: ${file}`);
    res.sendFile(path.join(__dirname, "public", "case-studies", file));
  });
});

// email template function
const emailTemplate = (name, email, message) => {
  const html = fs.readFileSync(path.join(__dirname, "email.html"), {
    encoding: "utf-8",
  });

  // Format current timestamp
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return html
    .replace("[name]", name)
    .replace("[email]", email)
    .replace("[message]", message)
    .replace("[timestamp]", formattedDate);
};

// Rate limiting for email endpoint
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CSP report endpoint
app.post("/csp-report", (req, res) => {
  if (req.body) {
    logger.warn("CSP Violation: ", req.body);
  } else {
    logger.warn("CSP Violation: No data received");
  }
  res.status(204).end();
});

// send email API route with rate limiting and validation
app.post("/send-email", emailLimiter, async (req, res) => {
  logger.info(`Email request received from: ${req.ip}`);

  // validate body
  if (!req.body.email || !req.body.message || !req.body.name) {
    logger.warn(`Invalid email request: Missing required fields`);
    return res
      .status(400)
      .json({ message: "Name, email and message are required" });
  }

  // Sanitize and validate email
  const email = validator.normalizeEmail(req.body.email);
  if (!validator.isEmail(email)) {
    logger.warn(`Invalid email address: ${req.body.email}`);
    return res.status(400).json({ message: "Invalid email address" });
  }

  // Sanitize name and message
  const name = validator.escape(req.body.name);
  const message = validator.escape(req.body.message);

  // send email using SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const mailOptions = {
      from: `"OFO New Message" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "New message from OFO Development",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: emailTemplate(name, email, message),
    };
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully from: ${email}`);
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
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
  logger.debug(`Attempting to serve PDF: ${filePath}`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    logger.warn(`PDF file not found: ${filePath}`);
    res.status(404).sendFile(path.join(__dirname, "404.html"));
  }
});

// catch-all route for unknown endpoints
app.use((req, res, next) => {
  logger.info(`404 for path: ${req.path}`);

  // Check if the requested path is an HTML file in the public directory
  const htmlFilePath = path.join(__dirname, "public", req.path);
  if (fs.existsSync(htmlFilePath)) {
    logger.warn(`File exists but not being served: ${htmlFilePath}`);
  }

  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  // Don't expose error details in production
  if (process.env.NODE_ENV === "production") {
    return res
      .status(err.status || 500)
      .sendFile(path.join(__dirname, "404.html"));
  }

  // In development, provide error details
  res.status(err.status || 500).json({
    message: err.message,
    error: err,
  });
});

// Update server-status.json with current timestamp - with improved error handling
const updateServerStatus = () => {
  try {
    const statusFilePath = path.join(__dirname, "public", "server-status.json");

    // Ensure the public directory exists
    if (!fs.existsSync(path.join(__dirname, "public"))) {
      logger.info("Creating public directory...");
      fs.mkdirSync(path.join(__dirname, "public"), { recursive: true });
    }

    // Create the file if it doesn't exist
    const statusData = {
      status: "online",
      timestamp: new Date().toISOString(),
    };

    // Write to a temporary file first, then rename to avoid partial writes
    const tempFilePath = `${statusFilePath}.tmp`;
    fs.writeFileSync(tempFilePath, JSON.stringify(statusData, null, 2));

    // On Windows, we need to unlink the destination file first
    if (fs.existsSync(statusFilePath)) {
      fs.unlinkSync(statusFilePath);
    }

    // Rename the temp file to the actual file
    fs.renameSync(tempFilePath, statusFilePath);

    // Verify the file was written correctly
    if (fs.existsSync(statusFilePath)) {
      const fileContent = fs.readFileSync(statusFilePath, "utf8");
      try {
        JSON.parse(fileContent); // Make sure it's valid JSON
        logger.debug("Updated server-status.json with current timestamp");
      } catch (jsonError) {
        logger.error(
          "Error: server-status.json contains invalid JSON:",
          jsonError
        );
        // Try to fix it
        fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2));
      }
    } else {
      logger.error("Error: Failed to create server-status.json");
      // Try direct write as fallback
      fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2));
    }
  } catch (error) {
    logger.error("Error updating server-status.json:", error);
    // Last resort - try a different approach
    try {
      const statusFilePath = path.join(
        __dirname,
        "public",
        "server-status.json"
      );
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({
          status: "online",
          timestamp: new Date().toISOString(),
        })
      );
    } catch (fallbackError) {
      logger.error(
        "Critical error: Could not update server-status.json even with fallback:",
        fallbackError
      );
    }
  }
};

// Update status file before starting server to ensure it's available immediately
logger.info("Initializing server-status.json before starting server...");
updateServerStatus();

// Double-check that the file exists and is valid before proceeding
try {
  const statusFilePath = path.join(__dirname, "public", "server-status.json");
  if (fs.existsSync(statusFilePath)) {
    const fileContent = fs.readFileSync(statusFilePath, "utf8");
    const data = JSON.parse(fileContent);
    logger.info("Verified server-status.json exists and is valid:", data);
  } else {
    logger.warn(
      "Warning: server-status.json does not exist after initialization"
    );
    // Try one more time
    updateServerStatus();
  }
} catch (error) {
  logger.error("Error verifying server-status.json:", error);
  // Try one more time
  updateServerStatus();
}

// Set up an interval to update the status file periodically
const statusUpdateInterval = setInterval(updateServerStatus, 30000); // Update every 30 seconds

// start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  // Update status again after server is fully started
  updateServerStatus();
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down server...");
  clearInterval(statusUpdateInterval);

  // Update status to offline
  try {
    const statusFilePath = path.join(__dirname, "public", "server-status.json");
    const statusData = {
      status: "offline",
      timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2));
    logger.info("Updated server-status.json to offline");
  } catch (error) {
    logger.error("Error updating server-status.json:", error);
  }

  process.exit(0);
});
