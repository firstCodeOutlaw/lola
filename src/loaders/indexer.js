'use strict';

const EventEmitter = require('events');
const { Client } = require('@elastic/elasticsearch');
const config = require('../config/database');

class ElasticsearchIndexer extends EventEmitter {
    /**
     * Constructor
     *
     * @param destinationIndex {string}
     * @param redisClient {Object}
     */
    constructor(destinationIndex, redisClient) {
        super();
        this.destinationIndex = destinationIndex;
        this.elastic = new Client({node: config.elasticsearchUrl});
        this.redis = redisClient;
    }

    /**
     * Takes an array of SQL rows and recursively dispatches each to
     * Elasticsearch engine for indexing using Elasticsearch client
     * for NodeJS
     *
     * @param rows {Array<Object>}
     * @param batch {number}
     */
    async dispatch(rows, batch) {
        // Notify on console for every 100 indexed records per batch
        if (rows.length % 100 === 0) {
            console.log(`Rows left to index in BATCH ${batch}:`, rows.length);
        }

        const row = rows.pop();

        await this.elastic.indices.exists({index: this.destinationIndex})
            .then(({ statusCode }) => {
                if (statusCode === 200) this._indexRowIfNotAlreadyIndexedOrModified(row);
                else this._reactToNonExistentIndex(row);
            });

        if (rows.length < 1) return console.log(`All rows in BATCH ${batch} dispatched for indexing!`);
        await this.dispatch(rows, batch);
    }

    /**
     * Takes one SQL row and sends it to Elasticsearch for indexing.
     *
     * @param row {Object}
     * @private
     */
    async _sendToElasticSearchForIndexing(row) {
        await this.elastic.index({id: row.id, index: this.destinationIndex, body: row})
            .then(({ statusCode }) => {
                if (statusCode === 200 || statusCode === 201) {
                    this.emit('ROW WAS INDEXED', {
                        rowId: row.id,
                        modified: row.date_modified,
                        targetIndex: this.destinationIndex,
                        timestamp: Date.now()
                    });
                } else console.log(`Could not index row with id ${row.id}. Status code: ${statusCode}`)
            });
    }

    /**
     * Checks Redis to know whether a row was previously indexed (i.e. record
     * exists in Redis). If the record exists in Redis, this method decides
     * if the row should be re-indexed by comparing row.date_modified
     * with the date the record was added to Redis. If row.date_modified
     * is greater, that SQL row is re-indexed.
     *
     * @param row {Object}
     * @private
     */
    async _indexRowIfNotAlreadyIndexedOrModified(row) {
        await this.redis.HMGET(`index:${this.destinationIndex}`, row.id, (error, result) => {
            if (error) return console.log('Err:', error);

            // result returns [ null ] if row.id does not exist
            if (result[0] === null || (new Date(result) < new Date(row.date_modified))) {
                return this._sendToElasticSearchForIndexing(row);
            } else console.log(`Key ${row.id} exists. Row skipped!:`, result);
        });
    }

    /**
     * If an Elasticsearch index does not exist, this method creates it,
     * then indexes the initial row that ought to have been indexed
     *
     * @param row {Object}
     * @private
     */
    async _reactToNonExistentIndex(row) {
        await this.elastic.indices.create({index: this.destinationIndex})
            .then(response => {
                if (response.statusCode === 200) {
                    console.log(`${this.destinationIndex} index was created!`);
                    this._indexRowIfNotAlreadyIndexedOrModified(row);
                } else console.log('Error: ', response);
            });
    }
}

module.exports = ElasticsearchIndexer;
