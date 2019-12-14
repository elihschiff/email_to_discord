require('dotenv').config();

// var config = require('./config.json');
var config = JSON.parse(process.env.CONFIG)

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

const match_course_code = /.*?\[Submitty ([a-zA-Z]+\d+)\]:.*/;
const match_message_type = /.*?\[Submitty [a-zA-Z]+\d+\]: (.+?):.+/;
mailListener.on("mail", function(mail, seqno, attributes) {
    // console.log("emailParsed", mail);

    var course_code = match_course_code.exec(mail.subject)[1];
    if (!config.hasOwnProperty(course_code)) {
        client.channels.get(process.env.DEFAULT_CHANNEL).send("Unknown class: " + course_code);
        return;
    }

    var channel_id = config[course_code].channel_id;

    var message_type = match_message_type.exec(mail.subject);
    if (message_type) {
        message_type = message_type[1];
    } else {
        message_type = "";
    }


    var title_text = "New message for " + config[course_code].name;
    if (message_type == "New Thread") {
        title_text = "Thread posted in " + config[course_code].name;
    } else if (message_type == "New Announcement") {
        title_text = "Announcement posted in " + config[course_code].name;
    } else if (message_type == "New Reply") {
        channel_id = process.env.DEFAULT_CHANNEL;
        title_text = "Reply posted in " + config[course_code].name;
    }

    var url = config[course_code].default_url
    if (false) {
        url = "URL FROM EMAIL";
    }

    var embed = {
        embed: {
            color: 2551860,
            title: title_text,
            url: url,
            description: "",
            timestamp: new Date()
        }
    }


    client.channels.get(channel_id).send(embed = embed);
});
