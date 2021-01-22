const methods = require('../config/constants').methods['sequelize'];

module.exports = (model, client, database, globalOptions) => {
    const originalCreateMethod = model[methods.create];
    const options = model.getSearchOptions();

    model.originalCreate = originalCreateMethod;

    model[methods.create] = async entry => {
        return new Promise(resolve => {
            model.originalCreate(entry).then(created => {
                let body = {};

                options.keys.map(key => {
                    body[key] = created[key];
                });

                client.index({
                    index: database,
                    id: created[options.fieldToUseAsId],
                    type: options.type,
                    body
                })
                    .then(() => resolve(created))
                    .catch(err => {
                        globalOptions.handleError && globalOptions.handleError(err);
                        if (globalOptions.softMode) {
                            resolve(created);
                        } else {
                            throw err;
                        }
                    });
            });
        });
    };
};
