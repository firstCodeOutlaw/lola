const redis = require('redis');

class RedisConnection {
    constructor(host, password, port = 6379) {
        this.databaseHost = host;
        this.databasePassword = password;
        this.databasePort = port;
    }

    /**
     * Returns a Redis connection
     *
     * @returns {RedisClient}
     */
    getClient() {
        redis.add_command('HMGET');
        return redis.createClient({
            port      : this.databasePort,
            host      : this.databaseHost,
            password  : this.databasePassword
        });
    }
}

module.exports = RedisConnection;
