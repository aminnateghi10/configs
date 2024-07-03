const path = require("path");

module.exports = {
    port: 8000,
    path: {
        controller: {
            api: path.resolve('./modules/controllers/api'),
        },
        models: path.resolve('./modules/models'),
    }
}
