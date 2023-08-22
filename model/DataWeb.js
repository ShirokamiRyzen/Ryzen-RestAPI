const mongoose = require('mongoose');

const dataweb = mongoose.Schema({
    RequestToday: { type: Number },
    RequestTotal: { type: Number }
},
 { versionKey: false });
module.exports = mongoose.model('Website Database', dataweb);