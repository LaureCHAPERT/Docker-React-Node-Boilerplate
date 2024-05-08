const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.NODE_ENV  === 'production' ?
    `mongodb://${ process.env.MONGO_USERNAME }:${ process.env.MONGO_PWD }@db` :
    `mongodb://db`

let count;

const client = new MongoClient(uri);
async function run() {
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('CONNEXION DB OK !');
        count = client.db('test').collection('count');
    } catch (err) {
        console.log(err.stack);
    }
}
run().catch(console.dir);


const app = express();

app.get('/api/count', (req, res) => {
    console.log(count);
    count.findOneAndUpdate({}, { $inc: { count: 1 } }, { returnNewDocument: true }).then((doc) => {
        const count = doc.count
        res.status(200).json(`Compteur: ${count}`)
    })
})

app.all('*', (req, res) => {
    res.status(404).end()
})

const server = app.listen(80);

process.on('SIGINT', () => {
    server.close((err) => {
        if (err) {
            process.exit(1);
        } else {
            if (client) {
                console.log('coucou')
                client.close((err) => {
                    process.exit(err ? 1 : 0);
                });
            } else {
                console.log('coucou2')
                process.exit(0);
            }
        }
    });
});