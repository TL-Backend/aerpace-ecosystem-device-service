require('dotenv').config();
const {
  sequelize,
  aergov_action_categories,
  aergov_device_master_actions,
} = require('../src/services/aerpace-ecosystem-backend-db/src/databases/postgresql/models');
const { eachLimitPromise } = require('../src/utils/utility');
const { createJsonMasterData } = require('./jsonMasterDataCreation');

const jsonData = require('./masterDataJsonFile.json');

const writeMasterDataToDb = async (jsonData) => {
  const transaction = await sequelize.transaction();
  try {
    const { success, message } = createJsonMasterData();
    if (!success) {
      console.log(message);
      await transaction.rollback();
      return;
    }

    await eachLimitPromise(jsonData, 1, async (currentItem) => {
      const categoryData = await aergov_action_categories.findOrCreate({
        where: { category_identifier: currentItem.category_identifier },
        defaults: {
          device_type: currentItem.device_type,
          category_identifier: currentItem.category_identifier,
          category_name: currentItem.category_name,
        },
        transaction,
      });

      await aergov_device_master_actions.findOrCreate({
        where: { action_identifier: currentItem.action_identifier },
        defaults: {
          category_id: categoryData[0].id,
          device_type: currentItem.device_type,
          action_identifier: currentItem.action_identifier,
          action_name: currentItem.action_name,
        },
        transaction,
      });
    });

    await transaction.commit();
    return;
  } catch (err) {
    await transaction.rollback();
    console.log(err);
  }
};

writeMasterDataToDb(jsonData);
