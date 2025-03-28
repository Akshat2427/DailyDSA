const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fetch = require('node-fetch');
const Email = require('./models/email'); 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error);
    process.exit(1);
  }
};
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/email', require('./routes/email'));


let dailyQuestion = {
  title: 'No question fetched yet',
  titleSlug: '',
};
let trashTalk = "";




const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.PASSWORD, 
  },
});

async function trashTalkByai() {
   

    const prompt = `You have to make a ruthkess trash talk reagarding this question of leetcoden"${dailyQuestion.title}  , i have to send it as an email , just send me the reply in quotes so send it direct back to hin"`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([prompt]);

        const responseText = result?.response?.text?.() || "No response generated.";
       
        trashTalk = responseText;
    } catch (err) {
        console.error("Error generating AI response:", err.message);
       
    }
}

const fetchRandomLeetCodeQuestion = async () => {
    try {
        const query = {
            query: `
                query {
                    randomQuestion(categorySlug: "", filters: {}) {
                        title
                        titleSlug
                    }
                }
            `
        };

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query),
        });

        const data = await response.json();

        if (data?.data?.randomQuestion) {
            const { title, titleSlug } = data.data.randomQuestion;
            console.log(`LeetCode Question: ${title}`);
            console.log(`Link: https://leetcode.com/problems/${titleSlug}/`);
            dailyQuestion.title = title;
            dailyQuestion.titleSlug = titleSlug;
        } else {
            console.log("Failed to fetch question.");
        }
    } catch (error) {
        console.error('Error fetching question:', error.message);
    }
};




const sendDailyEmails = async () => {
  try {
    const emailList = await Email.find({}, 'email'); 
    if (!emailList.length) {
      console.log('No emails found in the database.');
      return;
    }

    for (const recipient of emailList) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: recipient.email,
        subject: 'Daily LeetCode Challenge - Stay Sharp!',
        text: ` ${trashTalk}.\nLink: https://leetcode.com/problems/${dailyQuestion.titleSlug}/\n\n`,
      };

       transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Error sending email to ${recipient.email}:`, error.message);
        } else {
          console.log(`Email sent to ${recipient.email}: ${info.response}`);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching emails or sending messages:', error.message);
  }
};


cron.schedule(
  '0  0 0 * * *',
  async () => {
    console.log('Sending emails with the daily LeetCode question...');
    await fetchRandomLeetCodeQuestion(); 
    await trashTalkByai();
    await sendDailyEmails();
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata',
  }
);

app.get('/', async (req, res) => {
  await fetchRandomLeetCodeQuestion();
  res.send('Hello World!');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Cron job scheduled to fetch a LeetCode question at 12:00 AM IST every day.');
 
});
