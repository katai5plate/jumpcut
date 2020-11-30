const { execSync } = require("child_process");
const { appendFileSync } = require("fs");

module.exports = {
  pushCommand(code) {
    appendFileSync("./temp/log.cmd.txt", `${code}\n`);
    execSync(code);
  },
};
