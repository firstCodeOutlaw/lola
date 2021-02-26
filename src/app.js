'use strict';

const destinationIndex = 'example-index';

const SqlConnection = require('../src/connections/mysql');
const RedisConnection = require('../src/connections/redis');
const ElasticsearchIndexer = require('../src/loaders/indexer');
const redisHelper = require('../src/loaders/redis-helpers');
const config = require('../src/config/database');
const IndexableModel = require('./services/model-loader').get(destinationIndex);

// Instantiate MySQL connection
const connection = new SqlConnection(
    config.db_host,
    config.db_name,
    config.db_username,
    config.db_password,
    config.db_port
);

// Instantiate Redis connection
const redis = new RedisConnection(
    config.redis_host,
    config.redis_password,
    config.redis_port
).getClient();

// Get instance of Elasticsearch indexer
const elasticIndexer = new ElasticsearchIndexer(destinationIndex, redis);

// Listen to ROW WAS INDEXED event and handle it appropriately.
elasticIndexer.on('ROW WAS INDEXED', (data) => {
    redis.on("error", error => console.warn('Could not connect to Redis:', error));

    // Log necessary data to Redis
    redisHelper.logDateOfLatestIndexing(redis, data.timestamp);
    redisHelper.logIndexedSqlRowToRedis(redis, `index:${destinationIndex}`, data);
});

// Instantiate indexable model
const model = new IndexableModel(connection);

// Run indexer
model.initiateIndexing(elasticIndexer, destinationIndex, redis);
