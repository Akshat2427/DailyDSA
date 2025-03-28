const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const VerificationToken = require('../models/verificationToken');
const Email = require('../models/email');

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  // Validate that pitiful email
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      message: "That email’s a joke. Stop embarrassing yourself and send a real one.",
    });
  }

  try {
    // Check if the email’s already subscribed, punk
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        message: "Already subscribed, genius. Quit wasting our time.",
      });
    }

    // Check if a verification token already exists - no double-dipping
    const existingToken = await VerificationToken.findOne({ email });
    if (existingToken) {
      await VerificationToken.deleteOne({ email }); // Clear the old trash
    }

    // Generate a ruthless verification token
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({ email, token }); // Store it in MongoDB, no mercy

    // Nodemailer setup - only the strong survive
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Verify Your Worth, Weakling',
      html: `
        <h2>Think You’re Tough Enough?</h2>
        <p>Prove it. Click the link below to verify your email, or crawl away like the coward you are:</p>
        <a href="${process.env.BASE_URL}/email/verify?email=${encodeURIComponent(email)}&token=${token}" style="display: inline-block; padding: 10px 20px; background-color: #teal-900; color: red; text-decoration: none; border-radius: 5px;">Verify Now, Punk</a>
        <p>DailyDSA doesn’t wait for losers. Challenges drop at 12:00 AM IST. Be ready or be forgotten.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Email error:', error);
        return res.status(500).json({
          message: "Something broke, and it’s probably your fault. Try again, failure.",
        });
      }
      console.log('Verification email sent:', info.response);
      return res.status(200).json({
        message: "Check your inbox, rookie. Verify or get wrecked.",
      });
    });
  } catch (err) {
    console.log('Server error:', err);
    return res.status(500).json({
      message: "The system’s laughing at you. Fix your crap and try again.",
    });
  }
});

router.get('/verify', async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    return res.status(400).json({
      message: "Missing email or token, idiot. What’s wrong with you?",
    });
  }

  try {
    const storedToken = await VerificationToken.findOne({ email });

    if (!storedToken || storedToken.token !== token) {
      return res.status(403).json({
        message: "Nice try, faker. That token’s trash. Start over, loser.",
      });
    }

    
    await VerificationToken.deleteOne({ email }); 
    await Email.create({ email }); // Lock them into the elite

    return res.status(200).json({
      message: "Verified, tough guy. Challenges start at 12:00 AM IST. Don’t choke.",
    });
  } catch (err) {
    console.log('Verification error:', err);
    return res.status(500).json({
      message: "You broke something, clown. Try again if you dare.",
    });
  }
});

module.exports = router;