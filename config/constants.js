module.exports = {
    types: {
        esConfig: '{host: String | [String] | Object, httpAuth: Maybe String, ...}',
        databaseName: 'String',
        modelIndexConfig: '{keys: [String], type: String, fieldToUseAsId: String, virtualGetters: [String]}'
    },
    methods: {
        sequelize: {
            create: 'create',
            update: 'update',
            remove: 'destroy'
        }
    },
    events: {
        sequelize: {
            afterUpdate: 'afterUpdate'
        }
    }
};
