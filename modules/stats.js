const fs = require("fs");
const { data } = require("../commands/get.js");
const FileModule = require("../modules/file.js");
const commandFile = "stats/commands.json";

module.exports = class StatModule {
  //#region Commands
  /**
   * Create a command skeleton
   * @returns {}
   */
  static BuildNewCommand() {
    return {
      hits: 1,
      success: 0,
      failed: 0,
    };
  }

  /**
   * Control stats file skeleton and create required part
   * May be exploded if more sections have to be registered
   * @returns {}
   */
  static ControlSkeletonCommand(commandName, data) {
    // File not found - create file skeleton
    if (null === data) {
      data = {};
      data["commands"] = {};
      data["commands"][commandName] = this.BuildNewCommand();
    }

    // Commands section not registered yet - Create commands section skeleton
    if (!data["commands"]) {
      data["commands"] = {};
    }

    // Command not registered yet - Create command skeleton
    if (!data["commands"][commandName]) {
      data["commands"][commandName] = StatModule.BuildNewCommand();
    }

    return data;
  }

  /**
   * Rewrite stat file with updated command count
   * May be transfered to database service if use cases increase
   * @param {*} commandName string
   * @param {*} failed boolean
   */
  static CountCommand(commandName, failed) {
    let data = StatModule.ControlSkeletonCommand(commandName, FileModule.ReadFile(commandFile));

    // Increase command hit total count
    data["commands"][commandName]["hits"]++;

    // Increase command response statut count
    if (failed) data["commands"][commandName]["failed"]++;
    else data["commands"][commandName]["success"]++;

    // Write updated stats to file
    FileModule.WriteFile(commandFile, JSON.stringify(data, null, 2));
  }
  //#endregion
};
