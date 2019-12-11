require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

var MailListener = require("mail-listener2");
var mailListener = new MailListener({
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.IMAP_HOST,
    port: 993, // imap port
    tls: true,
    connTimeout: 10000, // Default by node-imap
    authTimeout: 5000, // Default by node-imap,
    // debug: console.log, // Or your custom function with only one incoming argument. Default: null
    tlsOptions: {
        rejectUnauthorized: false
    },
    mailbox: process.env.MAILBOX, // mailbox to monitor
    // searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
    markSeen: true, // all fetched email will be marked as seen and not fetched next time
    fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
    attachments: false, // download attachments as they are encountered to the project directory
});
mailListener.start(); // start listening

mailListener.on("server:connected", function() {
    console.log("imapConnected");
});

mailListener.on("server:disconnected", function() {
    console.log("imapDisconnected");
});

mailListener.on("error", function(err) {
    console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes) {
    // console.log("emailParsed", mail);

    arrayOfLines = mail.text.match(/[^\r\n]+/g);
    var start = 2 + arrayOfLines.indexOf("A new discussion thread was created in:")
    var end = arrayOfLines.indexOf("--")
    var email_body = arrayOfLines.slice(start, end).join("\n")


    var embed = {
        embed: {
            color: 255186000,
            title: mail.subject,
            url: "",
            description: email_body,
            timestamp: new Date()
        }
    }
    client.channels.get(process.env.DEFAULT_CHANNEL).send(embed = embed)
});
