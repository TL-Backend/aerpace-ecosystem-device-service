const fs = require('fs');
const XLSX = require('xlsx');

exports.createJsonMasterData = () => {
  try {
    const excelFilePath = 'masterData.xlsx';

    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];

    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    let headersMissing = false;

    for (let i = 0; i < sheetData.length; i++) {
      const currentItem = sheetData[i];

      if (
        currentItem['Device type'] === undefined ||
        currentItem['Action name'] === undefined ||
        currentItem['Category name'] === undefined
      ) {
        headersMissing = true;
        break;
      }

      currentItem.device_type = currentItem['Device type'];
      currentItem.category_name = currentItem['Category name'];
      currentItem.category_identifier = `${currentItem.category_name.toUpperCase()}`;
      currentItem.action_name = currentItem['Action name'];
      currentItem.action_identifier = `${currentItem.category_name.toUpperCase()}#${currentItem.action_name
        .trim()
        .replace(/ /g, '_')
        .toUpperCase()}`;
      currentItem.parameters = currentItem['Parameters needed'];
      delete currentItem['Device type'];
      delete currentItem['Category name'];
      delete currentItem['Category identifier'];
      delete currentItem['Action name'];
      delete currentItem['Action identifier'];
      delete currentItem['Parameters needed'];
    }

    if (headersMissing) {
      return {
        success: false,
        message: `Headers missing`,
      };
    }

    fs.writeFileSync(
      'masterDataJsonFile.json',
      JSON.stringify(sheetData, null, 2),
    );
    console.log('Conversion successful. JSON file created: output.json');
    return {
      success: true,
    };
  } catch (err) {
    console.log(err);
  }
};
