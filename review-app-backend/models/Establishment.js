const mongoose = require('mongoose');

const EstablishmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    logo: {
        data: Buffer, // Store binary image data
        contentType: String, // Store MIME type
    },
    photos: [{ type: String }], 
    menu: [{ type: String }], 
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    website: { type: String, default: "" },
    categories: [{ type: String }],
    hours: [{
        day: String,
        open: String,
        close: String
    }],
    facilities: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

const bcrypt = require("bcryptjs");

EstablishmentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


module.exports = mongoose.model('Establishment', EstablishmentSchema);
