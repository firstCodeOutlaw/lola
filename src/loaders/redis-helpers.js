'use strict';

/**
 * Redis helpers for Elastic search indexing
 * @author Benjamin Ayangbola
 */

/**
 * Updates the specified Redis hash with the provided data object
 *
 * @param redisClient
 * @param redisHash {string}
 * @param data {Object}
 */
const logIndexedSqlRowToRedis = (redisClient, redisHash, data) => {
    redisClient.hmset([redisHash, data.rowId, data.modified], (error, result) => {
        if (error) return console.log(error);
        // console.log('Hash updated:', result);
    });
};

/**
 * Saves the timestamp of the latest successful indexing operation
 * to Redis
 *
 * @param redisClient
 * @param timestamp {string}
 */
const logDateOfLatestIndexing = async (redisClient, timestamp) => {
    await redisClient.set('date_of_last_successful_indexing', timestamp, (error, result) => {
        if (error) return console.log('Could not log date of latest indexing. Error:', error);
        // console.log('Date of latest indexing:', timestamp);
    });
};

/**
 * /Library/Indexer.js fetches SQL rows in batches. Everytime it fetches
 * a batch, it emits a 'FOUND NEW BATCH OF SQL ROWS' event and
 * exposes the id of the last row in that batch alongside the
 * targeted Elasticsearch index. This is needed to know the
 * next batch of rows to fetch for indexing. logStartingPointOfNextBatch
 * method is called by listeners attached to the event above to log
 * the exposed row id to Redis.
 *
 * @param redisClient
 * @param index {string}
 * @param id {number}
 */
const logStartingPointOfNextBatch = async (redisClient, index, id) => {
    await redisClient.set(`${index}:start_next_batch_from`, id, (error, result) => {
        if (error) return console.log('Could not log date of latest indexing. Error:', error);
    });
};

module.exports.logIndexedSqlRowToRedis = logIndexedSqlRowToRedis;
module.exports.logDateOfLatestIndexing = logDateOfLatestIndexing;
