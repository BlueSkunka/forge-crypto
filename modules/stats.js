const fs = require("fs");
const { data } = require("../commands/get.js");
const FileModule = require("../modules/file.js");
const commandFile = "stats/commands.json";

module.exports = class StatModule {
  //#region Commands
  static BuildNewCommand(failed) {
    return {
      hits: 1,
      success: +!failed, // TODO: Maybe not understandable
      failed: +failed,
    };
  }

  static CountCommand(commandName, failed) {
    let data = FileModule.ReadFile(commandFile);

    if (null === data) {
      data = {};
      data["commands"] = {};
      data["commands"][commandName] = this.BuildNewCommand(failed);
    }

    if (!data["commands"]) {
      data["commands"] = {};
    }

    if (!data["commands"][commandName]) { // TODO: Add comments
      data["commands"][commandName] = this.BuildNewCommand(failed);
    } else {
      data["commands"][commandName]["hits"]++;
      if (failed) data["commands"][commandName]["failed"]++;
      else data["commands"][commandName]["success"]++;
    }

    FileModule.WriteFile(commandFile, JSON.stringify(data, null, 2));
  }
  //#endregion
};
