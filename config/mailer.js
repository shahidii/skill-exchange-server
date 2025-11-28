const { logger } = require('../utils/logger');
let nodemailer;
let transporter;

function isSmtpConfigured() {
    return (
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.MAIL_FROM
    );
}

function getTransporter() {
    if (transporter) return transporter;

    try {
        nodemailer = require('nodemailer');
    } catch (e) {
        logger.error('[MAIL] nodemailer not installed. Please install with: npm install nodemailer');
        const err = new Error('Nodemailer not installed');
        err.code = 'NODEMAILER_NOT_INSTALLED';
        err.statusCode = 500;
        throw err;
    }

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: String(process.env.SMTP_SECURE || 'false') === 'true',
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
}

module.exports = { getTransporter, isSmtpConfigured };
