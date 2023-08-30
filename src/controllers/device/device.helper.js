const {
  sequelize,
} = require('../../services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const {
  getModelsByDeviceType,
  getVariantByModelId,
  getVersionByVariantId,
} = require('./device.queries');

exports.getDevicesDataHelper = async (deviceType) => {
  const devices = [];

  try {
    // Query for models
    const modelsQuery = await sequelize.query(getModelsByDeviceType, {
      replacements: {
        device_type: deviceType,
      },
    });
    for (const modelRow of modelsQuery[0]) {
      const model = {
        id: `${modelRow.id}`,
        name: modelRow.name,
        status: '',
        variants: [],
      };

      // Query for variants
      const variantsQuery = await sequelize.query(getVariantByModelId, {
        replacements: {
          modelId: modelRow.id,
        },
      });

      for (const variantRow of variantsQuery[0]) {
        const variant = {
          id: `${variantRow.id}`,
          name: variantRow.name,
          status: '',
          versions: [],
        };

        // Query for versions
        const versionsQuery = await sequelize.query(getVersionByVariantId, {
          replacements: {
            variantId: variantRow.id,
          },
        });

        for (const versionRow of versionsQuery[0]) {
          variant.versions.push({
            id: `${versionRow.id}`,
            name: versionRow.name,
            status: '',
          });
        }
        model.variants.push(variant);
      }
      devices.push({ model });
    }
    return {
      success: true,
      data: devices,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
};
