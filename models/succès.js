const mongoose = require('mongoose');

const succèsSchema = mongoose.Schema({
    name: String,
    description: String,
    trigger: {type: Boolean, default: false}
});

const Succès = mongoose.model('succès', succèsSchema);

module.exports = Succès;