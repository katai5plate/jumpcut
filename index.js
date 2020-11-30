const prompts = require("prompts");
const { readdirSync } = require("fs");
const jumpcutter = require("./jumpcutter");
const { pushCommand } = require("./utils");

module.exports = {
  jcGUI() {
    (async () => {
      const { filename, threshold, time } = await prompts([
        {
          type: "text",
          name: "filename",
          message: "MP4 ファイル名(*.mp4)",
          validate: Boolean,
        },
        {
          type: "number",
          name: "threshold",
          message: "無音判定音量(-dB)",
          initial: 30,
        },
        {
          type: "number",
          name: "time",
          message: "無音判定誤差(ミリ秒)",
          initial: 400,
        },
      ]);
      jumpcutter({ filename, threshold, time });
    })();
  },
  jcCUI() {
    const [_, filename, threshold, time] = process.argv;
    if (!filename) throw new Error("ファイル名が未指定です");
    jumpcutter({ filename, threshold, time });
  },
  split() {
    const [_, filename, time = 3] = process.argv;
    if (!filename) throw new Error("ファイル名が未指定です");
    pushCommand(
      `ffmpeg -i ${filename}.mp4 -c copy -f segment -flags +global_header -segment_format_options movflags=+faststart -reset_timestamps 1 -segment_time ${
        time * 60
      } ${filename}_%02d.mp4`
    );
  },
  split2Jc() {
    const [_, filename, min = 3, threshold, time] = process.argv;
    if (!filename) throw new Error("ファイル名が未指定です");
    pushCommand(
      `ffmpeg -i ${filename}.mp4 -c copy -f segment -flags +global_header -segment_format_options movflags=+faststart -reset_timestamps 1 -segment_time ${
        min * 60
      } ${filename}_%02d.mp4`
    );
    const filenames = readdirSync("./").filter(
      (f) => f.includes(`${filename}_`) && f.match(/\.mp4$/)
    );
    filenames.forEach((fn) =>
      jumpcutter({ filename: fn.match(/(^.*?)\.mp4/)[1], threshold, time })
    );
  },
  jcs() {
    const [_, prefix, threshold, time] = process.argv;
    if (!prefix) throw new Error("プレフィクスが未指定です");
    const filenames = readdirSync("./").filter(
      (f) => f.includes(`${prefix}_`) && f.match(/\.mp4$/)
    );
    if (filenames.length === 0)
      throw new Error("プレフィクスに一致する動画がありません");
    filenames.forEach((fn) =>
      jumpcutter({ filename: fn.match(/(^.*?)\.mp4/)[1], threshold, time })
    );
  },
};
