require('array.prototype.flatmap').shim();

module.exports = (model, client, database) => {
    const options = model.getSearchOptions();

    model.index = async () => {
        let entries = await model.findAll();

        const body = entries.flatMap(entry => {
            let doc = {};

            options.keys.map(key => {
                doc[key] = entry[key];
            });

            return [{ index: { _index: database, _type: database, _id: entry.id } }, doc];
        });

        if (body && body.length) {
            try {
                const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            } catch (err) {
                console.log(err);
            }
        }

        return entries.length;
    };
};
