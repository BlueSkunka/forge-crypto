const fs = require("fs");
const basePath = __dirname.concat("/../");

module.exports = class FileModule {
  /**
   * Read file data then return it or null if any error happens
   * @param {*} filePath string
   * @param {*} jsonParse boolean
   * @returns {} | null
   */
  static ReadFile(filePath, jsonParse = true) {
    try {
      let data = fs.readFileSync(basePath.concat(filePath), "utf-8");
      return jsonParse ? JSON.parse(data) : data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Write file data
   * @param {*} filePath string
   * @param {*} data {}
   * @returns boolean
   */
  static WriteFile(filePath, data) {
    try {
      fs.writeFileSync(basePath.concat(filePath), data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};
