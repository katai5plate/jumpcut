# jumpcut

ジャンプカットバッチを作るテスト

## usage

### 必須

- Node.js
- ffmpeg
- NVENC が使えない場合、`config.json` の `nvenc` を `false` にする

### GUI

1. ディレクトリ直下に MP4 を置く
2. `npm start` で指示に従う
3. 完成

### コマンドライン

1. ディレクトリ直下に MP4 を置く
2. `npm run jc <(*).mp4> [dB=30] [ms=400]` を実行
3. 完成

### 動画分割

1. ディレクトリ直下に MP4 を置く
2. `npm run split <(*).mp4> [min=3]` を実行
3. 完成

### 動画分割してからジャンプカット

1. ディレクトリ直下に MP4 を置く
2. `npm run split2jc <(*).mp4> [min=3] [dB=30] [ms=400]` を実行
3. 完成

- うまくつながらない可能性あり

### 手動で動画分割してからジャンプカット

1. ディレクトリ直下に `<prefix>_00.mp4`, `<prefix>_01.mp4`, `<prefix>_02.mp4` という具合に連番動画を置く
2. `npm run jcs <prefix> [dB=30] [ms=400]` を実行
3. 完成

## 注意

- ファイル名にスペースや特殊文字が入っているとエラーで落ちる
- 自分の環境では、HD 画質で 5 分を超えたあたりからカクつきだすので、3 分ぐらいで動画を区切ったほうがいいかも
  - `npm run split <(*).mp4>`
  - nvenc を使うとそこまでカクつかなくなった
