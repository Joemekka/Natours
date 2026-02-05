// eslint-disable-next-line import/no-extraneous-dependencies
const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Emmanuel Joseph  <${process.env.EMAIL_FROM}>`;
  }

  // Create transport
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Brevo
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USERNAME,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      // With Gmail
      // service: 'Gmail',

      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Gmail?... Activate following in gmail: "less secure app" option
    });
  }

  // Send actual email
  async send(template, subject) {
    // 1. render HTML base on a pug template
    //const html = pug.renderFile(`${path.join(__dirname, 'views')}`);
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, { wordwrap: 130 }),
    };

    // 3. Create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to Natours Family, Glag to have you!');
  }

  async sendResetPassword() {
    await this.send(
      'passwordReset',
      'Your password reset token is valid for only 10 minutes!',
    );
  }
};
