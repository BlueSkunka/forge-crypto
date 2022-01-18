const fs = require("fs");

module.exports = class FileModule {
  static ReadFile(filePath) {
    try {
      let data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  static WriteFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};
