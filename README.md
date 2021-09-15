# Lola
A real-time MySQL database indexer for Elastic search built with NodeJs and Redis

## Installation
### Clone the project:
```
git clone https://github.com/firstCodeOutlaw/lola
```

### Install Node and NPM
Follow [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) 
to install Node and NPM on your machine.

### Install Redis
Follow [this guide](https://redis.io/topics/quickstart) to install Redis. If you're 
new to Redis, [this tutorial](https://linuxize.com/post/how-to-install-and-configure-redis-on-ubuntu-20-04/) 
also gives a good introduction.

### Install Node dependencies
`cd` into the directory where you cloned the project. Then run:
```
npm install
```

### Setup environment variables
Still in your project root directory, copy the contents of .env.example to env
```
cp .env.example .env
```
Fill-in the variables accordingly. Note that `ELASTICSEARCH_URL` refers to the link 
to where your Elastic search engine instance is hosted. The default value assumes 
that you have it on localhost port 9200, accessed by a username and password.

## Using the indexer
### Creating an indexable model
Lola expects you to define a model for each MySQL table you want to index in `./src/models` 
folder. Each model must extend `./src/models/core/indexable-model.js`. An example model is 
defined in `./src/models/example-model.js` to guide you. For example, to create a model for a 
*products* table in your MySQL database:
- `cd` into `./src/models`, then create a copy of example-model `cp example-model.js product-model.js`
- Open the newly created model and rename the class from `ExampleModel` to `ProductModel`.
- Set `_table` property to `products` (or whatever name you gave to the table you wish to index)
- Update `_columns` array tp include columns that you want to index.

While Lola works best for simple select operations without joins, you may modify `_buildQuery` 
function to suit your use-case. However, ensure that you return a string whose value is an SQL 
statement that can be executed against a MySQL database to fetch rows. Pay attention to existing 
JSDoc and inline comments if you'll have to modify `_buildQuery` to suit your needs. In the future, 
Lola will include a generator that makes models automatically via CLI commands.

### The Indices Registry
Lola provides a registry at `./src/config/indices-registry.js` where you register 
all Elastic search indices and the model you created to index them. For the imaginary ProductModel 
we created earlier, you can add an object to the exported array in the Indices Registry like this:
```
{
    index: 'products-index',
    path_to_model: '../models/product-model.js'
}
```
If `products-index` does not exist as an index in your Elastic search engine instance, it will be 
created automatically.

### Running the indexer
The actual running of the indexer happens in `app.js` where database connections are fetched, model 
is loaded and an indexer is started. Remember to set destinationIndex in `app.js` to the Elastic 
search index you want to target e.g. `const destinationIndex = 'product-index';` Then do `node app.js` 
to watch the indexing happen.

### Lola CLI
This will bring new features to Lola and make generating models, configuring and adding them to 
the indices registry a breeze. Plans are in the bag to introduce a feature that indexes models 
via cron jobs and service workers. Lola CLI will also allow you to set cron schedules and also switch 
_indexability_ on or off for any model.

## Contributing
Contributors are welcome. Just fork this repo, make your changes and create a PR with a good description 
of why you're proposing the change. Going forward, we'd allow only commits that fit into [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 
specifications. If you have issues, feel free to open them on GitHub. If you need to get in touch 
with me directly, send a mail to [benjaminayangbola@gmail.com](mailto:benjaminayangbola@gmail.com). Let's build!

