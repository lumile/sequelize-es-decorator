const methods = require('../config/constants').methods['sequelize'];

module.exports = (model, client, database, globalOptions) => {
    const originalRemove = model[methods.remove];
    const options = model.getSearchOptions();

    model.originalRemove = originalRemove;

    model[methods.remove] = async operationOptions => {
        let entries = await model.findAll({
            attributes: {
                include: [options.fieldToUseAsId]
            },
            ...operationOptions
        });
        const removed = await model.originalRemove(operationOptions);

        let totalLength = entries.length;
        let processedLength = 0;

        for (let index = 0; index < entries.length; index++) {
            let entry = entries[index];

            try {
                await client.delete({
                    index: database,
                    id: entry[options.fieldToUseAsId],
                    type: options.type
                });
            } catch (err) {
                globalOptions.handleError && globalOptions.handleError(err);
                if (!globalOptions.softMode) {
                    throw err;
                }
            }

            processedLength++;

            if (processedLength === totalLength) {
                return removed;
            }
        }
    };
};
