# AppleMusicBridgeWin

**Apple Music (Windows) → Discord Rich Presence**  
GSMTC から再生中の曲を取り出し、Vencord 上で RP に反映します。  
作者: **MoZ3ro**

---

## クイックインストール（1 行）

PowerShell を「管理者でない通常権限」で開いて次を実行：

```powershell
iwr -UseBasicParsing https://raw.githubusercontent.com/MoZ3ro/AppleMusicBridgeWin/main/scripts/install.ps1 | iex
```

|インストーラが行うこと|
|:----|
|最新リリースから AppleMusicBridgeWin.exe と vencord-dist.zip をダウンロード|
|%LOCALAPPDATA%\MoZ3ro.AppleMusicBridgeWin に配置|
|Discord の resources\app\index.js を作成し、Vencord パッチャを読み込み|
|環境変数 VC_AMBRIDGE_EXE に exe のフルパスを設定（ユーザー環境変数）|
|Discord を起動|

|使い方|
|:----|
|上のワンライナーを実行すると Discord が再起動します。|
|Discord → Settings → Vencord → Plugins で AppleMusicBridgeWin を有効化。|
|Apple Music / iTunes を再生すると、Rich Presence に 曲名 / アーティスト / 再生位置 が出ます。|
|プラグインを OFF/ON するとブリッジの起動/再起動がトリガーされます。|

|動作要件|
|:----|
|Windows 10 / 11|
|Discord デスクトップ版（Stable）|
|Apple Music for Windows または iTunes（GSMTC 対応）|
|管理者権限は不要|

|トラブルシューティング|
|:----|
|「未設定 / 不正（未設定）」と出る|
|VC_AMBRIDGE_EXE が未設定です。PowerShell で確認：|
```powershell
[Environment]::GetEnvironmentVariable('VC_AMBRIDGE_EXE','User')
```
|空なら手動設定（標準のインストール先の場合）：|
|:----|
```powershell
$exe = "$env:LOCALAPPDATA\MoZ3ro.AppleMusicBridgeWin\AppleMusicBridgeWin.exe"
[Environment]::SetEnvironmentVariable('VC_AMBRIDGE_EXE', $exe, 'User')
```
|その後、Discord を完全終了（タスクトレイからも終了）して再起動。|
|:----|

|ブリッジと繋がっているか確認したい|
|:----|
|Discord の DevTools Console（Ctrl+Shift+I → Console）で：|
```DevTools
// 応答 "ok" が返れば OK
await VencordNative?.pluginHelpers?.AppleMusicBridgeWin?.ping?.()

// 一度だけ 7 秒待って曲情報を取得（取得できなければ { timeout: true }）
await VencordNative?.pluginHelpers?.AppleMusicBridgeWin?.fetchOnce?.(7000)
```
|貼り付けるな　120%騙されている　などとdevtoolsのコンソールに120%いわれると思うので|
|:----|
```DevTools
allow pasting
```
|を打って解除しておくことを忘れず|
|:----|


