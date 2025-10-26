const mongoose = require('mongoose');

const stateOfGaugesSchema = mongoose.Schema({
    food: Number,
    moral: Number,
    health: Number,
    security: Number,
    hunger: Number,
})

const gameSchema = mongoose.Schema({
    usedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'cartes' }],
    gameSave : {type: Boolean, default: false},
    currentScénarios: [String],
    numberDays: Number,
    tweet: { type: mongoose.Schema.Types.ObjectId, ref: 'tweets' },
    stateOfGauges: stateOfGaugesSchema
});

const Game = mongoose.model('games', gameSchema);

module.exports = Game;