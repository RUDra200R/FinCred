const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: false },
    email: { type: String, required: true, unique: true },
    jobProfile: { type: String, required: true, unique: false },
    salary: { type: String, required: true, unique: false},
    password: { type: String, required: true },
    resetPasswordOtp: String,
    otpExpires: Date

});
const User = mongoose.model('User', userSchema);
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = User;
