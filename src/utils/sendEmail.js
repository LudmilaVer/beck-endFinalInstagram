import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendEmail({ to, subject, text }) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    
    if (accessToken.token) {
      console.log("Access token получен успешно");
    } else {
      throw new Error("Не удалось получить access token");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: `Ваше приложение <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Письмо отправлено успешно:", result);
    return result;
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    throw new Error('Ошибка отправки email');
  }
}

export default sendEmail;
