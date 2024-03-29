"use strict";
// Using the database design described in the MEAN stack:
// https://www.mongodb.com/blog/post/the-modern-application-stack-part-2-using-mongodb-with-nodejs

const MongoClient = require('mongodb').MongoClient;


class Database {
    constructor(uri) {
        this.client = null;
        this.db = null;
        this.uri = uri;
    }
    async connect() {
        try {
            this.client = await MongoClient.connect(this.uri);
            this.db = this.client.db('test');
        } catch (err) {
            console.error("Failed to connect to database: " + err.message);
            throw(err);
        }
    }
    async close() {
        if (this.client && this.client.isConnected()) {
            try {
                 return this.client.close();
            } catch(err) {
                console.error("Failed to close database: " + err.message);
                throw(err);
            }
        }
    }
    async createIndex(coll, field) {
        try {
            let collection = this.db.collection(coll);
            await collection.createIndex(field);
        } catch (err) {
            console.error(`Failed to create index: ${err.message}`);
            throw(err);
        }
    }
    async dropCollection(coll) {
        try {
            let collection = this.db.collection(coll);
            return await collection.drop();
        } catch (err) {
            console.error('Failed to drop collection: ' + err.message);
            throw(err);
        }
    }
    async getCollectionArray(coll) {
        try {
            let collection = this.db.collection(coll);
            let cursor = collection.find();
            return await cursor.toArray();
        } catch (err) {
            console.error('Failed to get collection array: ' + err.message);
            throw(err);
        }
    }
    async getDocumentById(coll, _id) {
        try {
            let collection = this.db.collection(coll);
            return await collection.findOne({_id});
        } catch (err) {
            console.error('Failed to get document: ' + err.message);
        }
    }
    async getDocumentsByValue(coll, key, value, sort=null) {
        try {
            let collection = this.db.collection(coll);
            let findDocuments = {};
            findDocuments[key] = value;
            let cursor = await collection.find(findDocuments);
            if (sort) {
                cursor = cursor.sort(sort);
            }
            return await cursor.toArray();
        } catch (err) {
            console.error('Failed to get documents: ' + err.message);
            throw(err);
        }
    }
    async addDocument(coll, document) {
        try {
            let collection = this.db.collection(coll);
            return await collection.insertOne(document, {w: "majority"});
        } catch (err) {
            console.error("Insert failed: " + err.message);
            throw(err);
        }
    }
    async addManyDocuments(coll, documents) {
        try {
            let collection = this.db.collection(coll);
            return await collection.insertMany(documents, {w: "majority"});
        } catch (err) {
            console.error("Insert failed: " + err.message);
            throw(err);
        }
    }
    async updateDocumentById(coll, id, update) {
        try {
            let collection = this.db.collection(coll);
            return await collection.updateOne({_id: id}, update);
        } catch (err) {
            console.error("Update failed: " + err.message);
            throw(err);
        }
    }
}

module.exports = Database;
