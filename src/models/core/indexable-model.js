const SqlConnection = require('../../connections/mysql');

/**
 * This class should be extended by other models
 */
class IndexableModel {
    /**
     * The MySQL connection object you pass via the constructor
     * must be an instance of IndexableModel which exposes a
     * getClient() method needed by ElasticsearchIndexer.
     *
     * @param databaseConnection {Object}
     */
    constructor(databaseConnection) {
        if (databaseConnection instanceof SqlConnection) {
            this.connection = databaseConnection;
        } else throw Error('Database connection object must be an instance of SqlConnection');
    }

    /**
     * Lays ground-work prior to indexing MySQL rows
     *
     * @param indexer {ElasticsearchIndexer}
     * @param destinationIndex {string}
     * @param redis {RedisClient}
     */
    initiateIndexing(indexer, destinationIndex, redis) {
        redis.get(`${destinationIndex}:start_next_batch_from`, (error, rowId) => {
            if (error) return console.log('Connection error:', error);

            if (!rowId) {
                // Create key and set to 0
                redis.set(`${destinationIndex}:start_next_batch_from`, 0, (error, result) => {
                    if (error) return console.log('Connection error: could not set start_next_batch_from');
                    console.log('start_next_batch_from has been set to 0');
                    this._recursivelyFetchRowsAndDispatchInBatches(indexer, destinationIndex)
                });
            } else {
                this._recursivelyFetchRowsAndDispatchInBatches(indexer, destinationIndex);
            }
        });
    }

    /**
     * Recursively fetches SQL rows in batches and dispatches to Elastic
     * search indexer till the number of rows fetched is zero.
     *
     * @param indexer {ElasticsearchIndexer}
     * @param index {string}
     * @param lastRowIdInPreviousBatch {number}
     * @param exit {boolean}
     * @param batch {number}
     * @private
     */
    _recursivelyFetchRowsAndDispatchInBatches(indexer, index, lastRowIdInPreviousBatch = 0, exit = false, batch = 1) {
        if (exit) {
            console.log(`All batches dispatched! Count: ${batch}`);
            return;
        }

        console.log(`Fetching ${ (batch > 1) ? 'another' : 'a' } batch of SQL rows...`);
        const sql = this._buildQuery(lastRowIdInPreviousBatch);
        const database = this.connection.getClient();

        database.query(sql, (error, rows) => {
            if (error) return console.error('Error:', error);
            console.log(`BATCH ${batch}: Fetched ${rows.length} rows`);

            // If this is first batch, show total batches to be processed
            // We don't want to see the information more than once
            // Todo: It should be total number of rows / config.sqlRowLimit
            // if (batch === 1) console.log(`Total Estimated Batches: ${Math.ceil(rows.length / config.sqlRowsLimit)}`);

            // Check if recursion should be terminated
            const exit = rows.length < 1;
            const lastRowId = rows[rows.length - 1] && rows[rows.length - 1].id;

            // Run Elastic search indexer
            if (!exit) indexer.dispatch(rows, batch);
            // Get next batch of rows
            this._recursivelyFetchRowsAndDispatchInBatches(indexer, index, lastRowId, exit, exit ? batch : batch + 1);

            database.end();
        });
    }
}

module.exports = IndexableModel;
