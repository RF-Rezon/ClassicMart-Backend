import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const mailOptions = {
  from: process.env.EMAIL_USER, 
  replyTo: email, 
  to: process.env.EMAIL_USER,
  subject: `New Contact Message from ${name}`,
  text: `
Name: ${name}
Email: ${email}

Message:
${message}
  `,
};

    await transporter.sendMail(mailOptions);
    res.json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;
