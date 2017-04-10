'use strict';

module.exports = {
  forgot_password_email: function(email,mailOptions) {
    mailOptions.html = [
      'Hi',
      'Your account has been approvd'

    ].join('\n\n');
    mailOptions.subject = 'Your account is approved';
    return mailOptions;
  }
};
