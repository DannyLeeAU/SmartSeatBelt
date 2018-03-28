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
    async getCollection(coll) {
        this.db.collection(coll, {strict: true}, (err, collection) => {
            if (err) {
                console.log('Could not access collection: ' + err.message);
                throw(err);
            }
            return collection;
        });
    }
    async addDocument(coll, document) {
        try {
            return await this.getCollection(coll)
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
