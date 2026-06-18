const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'customer'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    cvData: {
        name: String,
        role_applied: String,
        education: [String],
        skills: [String],
        projects: [{
            name: String,
            description: String,
            technologies: [String]
        }],
        experience: [{
            company: String,
            role: String,
            duration: String,
            responsibilities: String
        }],
        summary: String
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User; // ← changed from export default