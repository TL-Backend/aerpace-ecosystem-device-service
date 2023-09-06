const {
    sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const {
    getAllDevicesFromType
} = require('./device.queries');

exports.getDevicesDataHelper = async ({deviceType}) => {
    try {
        const devicesQueryResult = await sequelize.query(getAllDevicesFromType, {
            replacements: {
                device_type: deviceType,
            },
        });
        return {
            success: true,
            data: devicesQueryResult[0][0].data,
        };
    } catch (error) {
        return {
            success: false,
            data: error,
        };
    }
};
