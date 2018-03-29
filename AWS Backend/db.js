"use strict";
// Using the database design described in the MEAN stack:
// https://www.mongodb.com/blog/post/the-modern-application-stack-part-2-using-mongodb-with-nodejs

const MongoClient = require('mongodb').MongoClient;

class DB {
    constructor() {
        this.client = null;
        this.db = null;
    }
    async connect(uri) {
        if (this.db) { return; }
        try {
            this.client = await MongoClient.connect(uri);
            this.db = this.client.db('test');
        } catch (err) {
            console.log("Error connecting to database: " + err.message);
            throw(err);
        }
        return this;
    }
    async close() {
        if (this.client) {
            try {
                 return this.client.close();
            } catch(err) {
                console.log("Failed to close the database: " + err.message);
                throw(err);
            }
        }
    }
    async getCollectionArray(coll) {
        try {
            let collection = this.db.collection(coll);
            let cursor = collection.find();
            return await cursor.toArray();
        } catch (err) {
            console.log('Failed to get collection array: ' + err.message);
            throw(err);
        }
    }
    async getDocumentById(coll, id) {
        try {
            let collection = this.db.collection(coll);
            return await collection.findOne({'_id': id});
        } catch (err) {
            console.log('Failed to get document: ' + err.message);
        }
    }
    async addDocument(coll, document) {
        try {
            return await this.db.collection(coll)
                .insertOne(document, {w: "majority"});
        } catch (err) {
            console.log("Insert failed: " + err.message);
            throw(err);
        }
    }
    async addManyDocuments(coll, documents) {
        try {
            return await this.getCollection(coll)
                .insertMany(documents, {w: "majority"});

        } catch (err) {
            console.log("Insert failed: " + err.message);
            throw(err);
        }
    }
}

module.exports = DB;
