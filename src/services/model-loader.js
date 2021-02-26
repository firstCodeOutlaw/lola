const models = require('../config/indices-registry');

/**
 * Returns the appropriate model attached to an index
 * as defined in src/config/indices-registry
 *
 * @param elasticSearchIndex {string}
 * @returns {IndexableModel}
 * @throws Error
 */
module.exports.get = elasticSearchIndex => {
    const modelExists = models.find(model => model.index === elasticSearchIndex);
    if (modelExists) {
        return require(modelExists.path_to_model);
    }

    throw Error(`Index ${elasticSearchIndex} not found in Indices Registry`);
};
