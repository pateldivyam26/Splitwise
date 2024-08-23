const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groups: [{
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
        groupName: String
    }],
    invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }]
});

module.exports = mongoose.model('User', userSchema);