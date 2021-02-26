// Register all Elastic search indices with the path to their respective models here
module.exports = [
    {
        index: 'index1',
        path_to_model: '../models/index1.js'
    },
    {
        index: 'index2',
        path_to_model: '../models/index2.js'
    }
];
