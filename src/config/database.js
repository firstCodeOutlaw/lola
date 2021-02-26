require('dotenv').config();

/**
 * Database configuration object
 */
module.exports = {
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT || 3306,
    db_name: process.env.DB_DATABASE,
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,

    // Elastic search
    elasticsearchUrl: process.env.ELASTICSEARCH_URL,

    // Indexer
    sqlRowsLimit: parseInt(process.env.ROWS_PER_BATCH),

    // Redis
    redis_host: process.env.REDIS_HOST,
    redis_port: process.env.REDIS_PORT,
    redis_password: process.env.REDIS_PASSWORD
};
