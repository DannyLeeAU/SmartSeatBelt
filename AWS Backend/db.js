"use strict";
// Using the database design described in the MEAN stack:
// https://www.mongodb.com/blog/post/the-modern-application-stack-part-2-using-mongodb-with-nodejs

const MongoClient = require('mongodb').MongoClient;

class DB {
    constructor() {
        this.client = null;
        this.db = null;
    }
    async connect(uri, dbName) {
        if (this.db) { return; }
        try {
            this.client = await MongoClient.connect(uri);
            this.db = this.client.db(dbName);
        } catch (err) {
            console.log("Error connecting: " + err.message);
            throw(err);
        }
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
    async addDocument(coll, document) {
        let collection;
        try {
            collection = this.db.collection(coll, {strict: false});
        } catch (err) {
            console.log("Could not access collection: " + err.message);
            throw(err);
        }
        try {
            return await collection.insertOne(document, {w: "majority"});
        } catch (err) {
            console.log("Insert failed: " + err.message);
            throw(err);
        }
    }
}

module.exports = DB;
