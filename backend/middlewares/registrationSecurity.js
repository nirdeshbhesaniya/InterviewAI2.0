/**
 * registrationSecurity.js
 * ──────────────────────────────────────────────────────────────────────────
 * Layered security checks applied BEFORE the registration controller runs.
 *
 * Layers:
 *  1. Field presence & length limits       – prevent oversized payloads
 *  2. Input sanitization                   – strip HTML/script tags
 *  3. Email format & disposable-email block– stop throwaway addresses
 *  4. Username reserved-word & profanity   – protect brand & platform safety
 *  5. Password strength                    – enforce meaningful passwords
 * ──────────────────────────────────────────────────────────────────────────
 */

const validator = require('validator');

// ── 1. DISPOSABLE EMAIL DOMAINS (common burner services) ──────────────────
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamailblock.com', 'grr.la', 'sharklasers.com', 'guerrillamailblock.com',
  'spam4.me', 'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.at',
  'trashmail.io', 'throwam.com', 'throwam.net', 'yopmail.com', 'yopmail.fr',
  'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc', 'nomail.xl.cx', 'mega.zik.dj',
  'speed.1s.fr', 'courriel.fr.nf', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'monmail.fr.nf', 'tempmail.com', 'temp-mail.org', 'fakeinbox.com',
  'maildrop.cc', 'dispostable.com', 'mailnesia.com', 'mailnull.com',
  'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org', 'spamex.com',
  'boxforspam.com', 'binkmail.com', 'bobmail.info', 'chammy.info', 'devnullmail.com',
  'deagot.com', 'discard.email', 'discardmail.com', 'discardmail.de',
  'emailondeck.com', 'fakemailgenerator.com', 'getnada.com', 'getonemail.com',
  'getonemail.net', 'incognitomail.com', 'mailexpire.com', 'mailfreeonline.com',
  'mailguard.me', 'mailhazard.com', 'mailimate.com', 'mailmetrash.com',
  'mailnew.com', 'mailscrap.com', 'mailshell.com', 'mailsiphon.com',
  'mailtemp.info', 'mailtome.de', 'mailzilla.com', 'mailzilla.org',
  'meltmail.com', 'mintemail.com', 'moncourrier.fr.nf', 'monemail.fr.nf',
  'mt2009.com', 'mt2014.com', 'mytempemail.com', 'noclickemail.com',
  'nowmymail.com', 'objectmail.com', 'oneoffemail.com', 'pookmail.com',
  'proxymail.eu', 'rcpt.at', 'rklips.com', 'rmqkr.net', 'rtrtr.com',
  's0ny.net', 'safe-mail.net', 'shortmail.net', 'smellfear.com', 'snkmail.com',
  'sofimail.com', 'sogetthis.com', 'soodonims.com', 'spam.la', 'spamavert.com',
  'spambob.com', 'spambob.net', 'spambob.org', 'spamcon.org', 'spamevader.com',
  'spamfree24.org', 'spamhole.com', 'spamify.com', 'spaminator.de', 'spamkill.info',
  'spaml.com', 'spaml.de', 'spammotel.com', 'spamobox.com', 'spamspot.com',
  'spamthis.co.uk', 'spamtroll.net', 'supergreatmail.com', 'supermailer.jp',
  'suremail.info', 'teewars.org', 'teleworm.com', 'teleworm.us', 'tempe-mail.com',
  'tempm.com', 'tempr.email', 'throwam.com', 'tilien.com', 'tmailinator.com',
  'tradermail.info', 'trash-amil.com', 'trash2009.com', 'trashdevil.com',
  'trashdevil.net', 'trashemail.de', 'trashimail.de', 'trashmail.at',
  'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmailer.com',
  'trashymail.com', 'trbvm.com', 'tyldd.com', 'uggsrock.com', 'uroid.com',
  'veryrealemail.com', 'viditag.com', 'viewcastmedia.com', 'viewcastmedia.net',
  'viewcastmedia.org', 'webm4il.info', 'wh4f.org', 'whyspam.me', 'willhackforfood.biz',
  'willselfdestruct.com', 'wilemail.com', 'winemaven.info', 'wronghead.com',
  'www.e4ward.com', 'wuzup.net', 'wuzupmail.net', 'xagloo.com', 'xemaps.com',
  'xents.com', 'xmaily.com', 'xoxy.net', 'xyzfree.net', 'yapped.net',
  'yeah.net', 'yodx.ro', 'yopmail.fr', 'yopmail.info', 'yourdomain.com',
  'ypmail.webarnak.fr.eu.org', 'yuurok.com', 'z1p.biz', 'za.com', 'zebins.com',
  'zebins.eu', 'zehnminuten.de', 'zehnminutenmail.de', 'zetmail.com', 'zippymail.info',
  'zoemail.com', 'zoemail.net', 'zoemail.org', 'zomg.info',
  // Extra popular ones
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemail.de',
  '20minutemail.com', '20minutemail.it', 'mohmal.com', 'tempinbox.com',
  'filzmail.com', 'throwam.com', 'mailnull.com', 'tempinbox.co.uk',
  'spamhereplease.com', 'temporaryemail.us', 'temporaryinbox.com',
  'tempomail.fr', 'throwam.com', 'throwamailaway.com', 'tmailinator.com',
]);

// ── 2. RESERVED / BLOCKED USERNAMES ──────────────────────────────────────
const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'root', 'superuser', 'system', 'sysadmin',
  'support', 'help', 'helpdesk', 'service', 'info', 'contact', 'team',
  'noreply', 'no-reply', 'noreply', 'donotreply',
  'security', 'abuse', 'postmaster', 'webmaster', 'hostmaster',
  'interviewai', 'interview_ai', 'interviewer', 'owner', 'mod', 'moderator',
  'api', 'null', 'undefined', 'anonymous', 'guest', 'test', 'testuser',
  'demo', 'example', 'sample', 'placeholder', 'user', 'users',
  'account', 'accounts', 'profile', 'profiles', 'settings', 'setup',
  'register', 'signup', 'login', 'logout', 'signin', 'signout',
  'password', 'pass', 'passwd', 'auth', 'oauth', 'token',
  'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard', 'cunt',
  'cock', 'dick', 'pussy', 'porn', 'sex', 'rape', 'kill', 'murder',
  'terrorist', 'jihad', 'hacker', 'hack', 'exploit', 'malware', 'virus',
  'spam', 'scam', 'phish', 'phishing', 'fraud', 'fake', 'nigger', 'nigga',
]);

// ── 3. PROFANITY PATTERN (regex) ─────────────────────────────────────────
const PROFANITY_PATTERN = /fuck|shit|bitch|asshole|cunt|cock|dick|pussy|nigger|nigga|whore|bastard|slut|porno|rape/i;

// ── 4. SIMPLE HTML / SCRIPT STRIPPER ─────────────────────────────────────
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')         // strip HTML tags
    .replace(/javascript:/gi, '')    // kill JS URIs
    .replace(/on\w+\s*=/gi, '')      // strip event handlers
    .trim();
};

// ─────────────────────────────────────────────────────────────────────────
// Main middleware export
// ─────────────────────────────────────────────────────────────────────────
const registrationSecurity = (req, res, next) => {
  // ── Destructure and sanitize all text fields up-front ──────────────────
  let { fullName, username, email, password } = req.body;

  // Sanitize strings
  fullName = sanitizeString(fullName || '');
  username = sanitizeString(username || '').toLowerCase();
  email    = sanitizeString(email || '').toLowerCase();
  // NOTE: Do NOT sanitize password – special chars are fine in passwords

  // Write sanitized values back so the controller gets clean data
  req.body.fullName = fullName;
  req.body.username = username;
  req.body.email    = email;

  // ── [A] Full Name checks ───────────────────────────────────────────────
  if (!fullName || fullName.length < 2) {
    return res.status(400).json({ message: 'Full name must be at least 2 characters.' });
  }
  if (fullName.length > 60) {
    return res.status(400).json({ message: 'Full name must not exceed 60 characters.' });
  }
  // Only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'\-\.]+$/.test(fullName)) {
    return res.status(400).json({
      message: "Full name may only contain letters, spaces, hyphens, and apostrophes."
    });
  }

  // ── [B] Username checks ────────────────────────────────────────────────
  if (!username || username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters.' });
  }
  if (username.length > 20) {
    return res.status(400).json({ message: 'Username must not exceed 20 characters.' });
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return res.status(400).json({
      message: 'Username may only contain lowercase letters, numbers, and underscores.'
    });
  }
  // Cannot start or end with underscore
  if (username.startsWith('_') || username.endsWith('_')) {
    return res.status(400).json({ message: 'Username cannot start or end with an underscore.' });
  }
  // No consecutive underscores
  if (/__/.test(username)) {
    return res.status(400).json({ message: 'Username cannot contain consecutive underscores.' });
  }
  if (RESERVED_USERNAMES.has(username)) {
    return res.status(400).json({ message: 'That username is reserved. Please choose a different one.' });
  }
  if (PROFANITY_PATTERN.test(username)) {
    return res.status(400).json({ message: 'Username contains inappropriate content.' });
  }

  // ── [C] Email checks ───────────────────────────────────────────────────
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  if (email.length > 254) {  // RFC 5321 limit
    return res.status(400).json({ message: 'Email address is too long.' });
  }
  const emailDomain = email.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.has(emailDomain)) {
    return res.status(400).json({
      message: 'Disposable or temporary email addresses are not allowed. Please use a real email.'
    });
  }

  // ── [D] Password strength checks ──────────────────────────────────────
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }
  if (password.length > 128) {
    return res.status(400).json({ message: 'Password must not exceed 128 characters.' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter.' });
  }
  if (!/[a-z]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter.' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number.' });
  }
  if (!/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return res.status(400).json({
      message: 'Password must contain at least one special character (e.g. @, #, $, !).'
    });
  }
  // Common weak passwords
  const COMMON_PASSWORDS = ['Password1!', 'Password@1', 'Admin@123', 'Qwerty@1', 'Welcome@1', '12345678A!'];
  if (COMMON_PASSWORDS.includes(password)) {
    return res.status(400).json({ message: 'Password is too common. Please choose a stronger one.' });
  }

  next();
};

module.exports = registrationSecurity;
