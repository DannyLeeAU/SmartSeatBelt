// Using the database design described in the MEAN stack:
// https://www.mongodb.com/blog/post/the-modern-application-stack-part-2-using-mongodb-with-nodejs

const MongoClient = require('mongodb').MongoClient;

class DB {
    constructor() {
        this.db = null;
    }
    async connect(uri) {
        if (this.db) { return; }
        try {
            this.db = await MongoClient.connect(uri);
        } catch(err) {
            console.log("Error connecting: " + err.message);
            throw(err);
        }
    }
    async close() {
        if (this.db) {
            try {
                this.db.close();
            } catch(err) {
                console.log("Failed to close the database: " + err.message);
                throw(err);
            }
        }
    }
    async addDocument(coll, document) {
        let collection;
        try {
            collection = await this.db.collection(coll, {strict: false});
        } catch(err) {
            console.log("Could not access collection: " + err.message);
            throw(err);
        }
        try {
            collection.insertOne(document, {w: "majority"});
        } catch(err) {
            console.log("Insert failed: " + err.message);
            throw(err);
        }
    }
}

module.exports = DB;
