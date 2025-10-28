var express = require('express');
var router = express.Router();
const Game = require('../models/games')
const authenticateToken = require('../middlewares/authMiddleWare');;
const User = require('../models/users')
const Card = require('../models/cards')
const { checkBody } = require('../modules/checkBody')
const { applyEffects } = require('../modules/applyEffects')


/* nouvelle games */
router.post('/new', authenticateToken, async (req, res) => {
 try {
    //console.log('User du middleWare: ', req.user)
const userId = req.user.userId

const activeGame = await Game.findOne({ player: userId , ended: false });
const cards = await Card.find();
const cardSelect = cards[Math.floor(Math.random() * (cards.length))];

// verifie si une partie est en court et la transforme en partie terminer
    if(activeGame) {
        activeGame.ended = true
        await activeGame.save()
    }
// crée une nouvelle partie
    const newGame = await new Game({

    player: userId,
    currentCard: cardSelect._id,
    })
    await newGame.save()

    const populatedGame= await Game.findById(newGame._id).populate('currentCard')

    // MAJ historique avec verif de doublon + currentGame
    const user = await User.findById(userId)

   //console.log('User de la bd : ' ,user)
        if(!user) {
            return res.json({ result : false , error: ' Utilisateur non trouvé'})
        }
        if(!user.historicGames.includes(newGame._id)){
            user.historicGames.push(newGame._id)
        }

        user.currentGame = newGame._id

        await user.save()

        

    return res.json({ result: true, message: 'Nouvelle partie crée', game: populatedGame})

} catch (err) {
    return res.json({ result:false, error: err.message})
}
})

/* historique game */

router.get('/', authenticateToken, async (req,res) => {

    try {

    const userId = req.user.userId
    const userGame = await Game.find({ player: userId , ended: true });
        
    return res.json({ result: true, games: userGame})

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

/* current game */

router.get('/current', authenticateToken, async (req,res) => {

    try {
    const userId = req.user.userId
    const user = await User.findById(userId)
        .populate({
            path: 'currentGame',
            populate: 'currentCard'
        })
    if (!user.currentGame) {
        return res.json({ result:false , error: 'Aucune game en cours'})
    }

    currentCard = await user.currentGame.currentCard
    console.log( 'current card: ' , currentCard)
    return res.json({ result: true , currentGame: user.currentGame})
    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})

/*  choix du joueur " gauche: non / droite: oui "*/

router.post('/choice', authenticateToken, async (req,res) => {
    try {
        const userId = req.user.userId
        const { choice } = req.body;
        
        if (!checkBody(req.body,['choice'])) {
            return res.json({ result: false, error: 'Missing or empty fields'})
            ;
        }
        
        const user = await User.findById(userId)
        .populate({
            path: 'currentGame',
            populate: 'currentCard'
        })
        
        if(!user.currentGame.currentCard) {
            return res.json({ result:false , error : 'Aucune carte selectionner !'})
        }
            console.log(choice, 'current game :', user.currentCard)
            const effects = choice === 'right' ? user.currentGame.currentCard.right.effect : user.currentGame.currentCard.left.effect;

            /*console.log('effects =' ,effects)
        
            const game = await Game.findById(user.currentGame._id);

        for (const key in effects){



                    game.stateOfGauges[key] += effects[key]

            }
        game.markModified('stateOfGauges');

        await game.save();


        */
        // ICI push et changement de card selectionner
        user.currentGame.usedCards.push(user.currentGame.currentCard._id)
            await user.save()

            //const updateGame = await Game.findById(user.currentGame._id).populate('currentCard')
        const exludedIds =  user.currentGame.usedCards  
        // <-- Find de card en excluant les IDs regroupés dans "exclude" grâce à $nin JE NE CONNAISSAIS PAS ! -->
        const cardsFiltred = await Card.find({ _id: { $nin: exludedIds } });  

        if(cardsFiltred.length === 0) {
            return res.json({ result : false, error: 'Aucune carte disponible'})
        }
        const cardSelect = cardsFiltred[Math.floor(Math.random() * (cardsFiltred.length))];


        await user.currentGame.save()

        //console.log(' filter card: ',cardsfilter)


    return res.json({ result : true , gameMAJ: user.currentGame })

    } catch (err) {
        return res.json({ result: false, error: err.message})
    }
})



module.exports = router;
