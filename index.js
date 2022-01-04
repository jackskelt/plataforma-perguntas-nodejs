const Express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database/database');
const pergunta = require('./database/pergunta');
const resposta = require('./database/Resposta')

const app = Express();

// Database
connection
    .authenticate()
    .then(() => {
        console.log('Database conectada')
    })
    .catch(err => console.log(err))


app.set('view engine', 'ejs');
app.use(Express.static('public'));


// BodyPase
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    pergunta.findAll({ raw: true, order: [
        ['id', 'DESC']
    ]}).then(p => {
        res.render("index", {
            perguntas: p
        });
    })
});


app.get('/perguntar', (req, res) => {
    res.render("perguntar");
});


app.post('/salvarPergunta', (req, res) => {
    let titulo = req.body.titulo,
        descricao = req.body.descricao;
    pergunta.create({
        titulo,
        descricao
    }).then(() => {
        res.redirect("/")
    })
});


app.get('/pergunta/:id', (req, res) => {
    var id = req.params.id
    pergunta.findOne({
        where: {id}
    }).then(pergunta => {
        if(pergunta) {

            resposta.findAll({
                where: {PerguntaId: pergunta.id},
                order:[ ['id', 'DESC'] ]
            }).then(respostas => {

                
                res.render('pergunta', {
                    pergunta,
                    respostas
                })
            })
        }else {
            res.redirect('/')
        }
    })
});


app.post('/responder/:id', (req, res) => {
    var corpo = req.body.corpo
    var perguntaId = req.params.id
    resposta.create({
        corpo,
        perguntaId
    }).then(() => res.redirect(`/pergunta/${perguntaId}`))
})


app.listen(8080,() => {
    console.log('App iniciado');
});