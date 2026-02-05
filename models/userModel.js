/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: [true, 'User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },

  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confrim your password'],
    validate: {
      // This only works on save()
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpiry: Date,
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
});

userSchema.pre('save', async function () {
  // Only run if pass is modifeid
  if (!this.isModified('password')) return;

  // Has pass with cost 12
  this.password = await bcrypt.hash(this.password, 10);

  // Delete pass
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

userSchema.pre(/^find/, function () {
  // This points to the current document
  this.find({ active: { $ne: false } });
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
