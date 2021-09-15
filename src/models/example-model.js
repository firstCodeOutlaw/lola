const config = require('../config/database');
const IndexableModel = require('./core/indexable-model');

class ExampleModel extends IndexableModel {
    /**
     * Name of base table to use
     *
     * @type {string}
     * @private
     */
    _table = 'my_table';

    /**
     * If your id column has another name, alias
     * it to 'id', e.g. "my_primary_key_column as id".
     * Only integer type is supported.
     *
     * @type {string}
     * @private
     */
    _primaryKey = 'id';

    /**
     * Columns to select must include a 'date_modified'
     * column. This is used to sort rows before batch
     * selection.
     *
     * @type {Array<string>}
     * @private
     */
    _columns = [
        'last_name',
        'first_name',
        'email',
        'updated_at as date_modified'
    ];

    /**
     * SQL connection object is injected via constructor
     *
     * @param databaseConnection {Object}
     */
    constructor(databaseConnection) {
        super(databaseConnection);
    }

    /**
     * Builds query to be executed against database
     *
     * @param lastRowIdInPreviousBatch {number}
     * @returns {string}
     * @private
     */
    _buildQuery(lastRowIdInPreviousBatch = 0) {
        const columns = [...[`${this._primaryKey} as id`], this._columns].join(", ");

        // Query that sorts base table in ascending order. This is important
        // as it enables us fetch table rows in batches
        const sortedRows = `SELECT * FROM ${this._table} ORDER BY ${this._primaryKey} ASC`;

        return `SELECT * FROM (${sortedRows}) as sorted ` +
            `WHERE pk > ${lastRowIdInPreviousBatch} LIMIT ${config.sqlRowsLimit}`;
    }
}

module.exports = ExampleModel;
