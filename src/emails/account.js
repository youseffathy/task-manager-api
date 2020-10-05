/* using sendgrid API to send emails */
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: "youseffathy760@gmail.com", //must be equal the one we create an account on sendgrid with
      subject: "Welcome to Task Manager app",
      text: `Thank you for joining us, ${name}. We hope you enjoy our service.`,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const sendCancellationEmail = (email, name) => {
  try {
    sgMail.send({
      to: email,
      from: "youseffathy760@gmail.com",
      subject: "Sorry to see you go!",
      text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail,
};
