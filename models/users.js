const mongoose = require('mongoose');

const paramètresSchema = mongoose.Schema({
 volume: Number,
 son: {type: Boolean, default: false},
 difficulté: String,
});


const userSchema = mongoose.Schema({
    email: {type:String, required:true},
    password: {type:String, required:true},
    token: String,
    currentGame: { type: mongoose.Schema.Types.ObjectId, ref: 'games' },
    paramètres: paramètresSchema,
    historicGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'games' }],
    UnlockedAchievements : [{ type: mongoose.Schema.Types.ObjectId, ref: 'succès' }]
})

const User = mongoose.model('users', userSchema);

module.exports = User;