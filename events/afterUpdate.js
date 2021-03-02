const events = require('../config/constants').events['sequelize'];

module.exports = (model, client, database, globalOptions) => {
    const options = model.getSearchOptions();
    model.addHook(events.afterUpdate, (instance) => {

        return new Promise(async resolve => {
          let body = {};
          let updatedEntry = instance.dataValues

          if (updatedEntry) {
              options.keys.map(key => {
                  body[key] = updatedEntry[key];
              });

              for (const key of options.virtualGetters) {
                  body[key] = await updatedEntry[key]();
              }

              client.index({
                  index: database,
                  id: updatedEntry[options.fieldToUseAsId],
                  type: options.type,
                  body
              })
                  .then(() => resolve(updatedEntry))
                  .catch(err => {
                      globalOptions.handleError && globalOptions.handleError(err);
                      if (globalOptions.softMode) {
                          resolve(updatedEntry);
                      } else {
                          throw err;
                      }
                  });
          }
        });
    });
};
