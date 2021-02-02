require('array.prototype.flat').shim();

module.exports = (model, client, database) => {
    const options = model.getSearchOptions();

    model.index = async () => {
        let entries = await model.findAll();

        let body = await Promise.all(entries.map(async entry => {
            let doc = {};

            options.keys.map(key => {
                doc[key] = entry[key];
            });

            for (const key of options.virtualGetters) {
                doc[key] = await entry[key]();
            }

            return [{ index: { _index: database, _type: options.type, _id: entry[options.fieldToUseAsId] } }, doc];
        }));

        body = body.flat(1)

        if (body && body.length) {
            try {
                const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            } catch (err) {
                console.log(err, false, 2);
            }
        }

        return entries.length;
    };
};
