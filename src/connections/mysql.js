const mysql = require('mysql');

class SqlConnection {
    constructor(host, database, user, password, port = 3306) {
        this.databaseHost = host;
        this.databaseName = database;
        this.databaseUser = user;
        this.databasePassword = password;
        this.databasePort = port;
    }

    /**
     * Create connection to database using connection pool.
     * Pooling allows us reuse database connections instead
     * of creating new ones everytime. Check the link below
     * for further understanding of connection pooling.
     *
     * @link https://www.npmjs.com/package/mysql#pooling-connections
     * @returns {Pool}
     */
    getClient() {
        return mysql.createPool({
            host: this.databaseHost,
            database: this.databaseName,
            user: this.databaseUser,
            password: this.databasePassword,
            port: this.databasePort,
            charset: 'utf8mb4'
        });
    }
}

module.exports = SqlConnection;
