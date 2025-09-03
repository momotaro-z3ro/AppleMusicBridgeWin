# AppleMusicBridgeWin

**Apple Music (Windows) → Discord Rich Presence**  
GSMTC から再生中の曲を取り出し、Vencord 上で RP に反映します。  
作者: **MoZ3ro** (https://mozero.net/)

---

## クイックインストール（1 行）

PowerShell を「管理者でない通常権限」で開いて次を実行：

```powershell
iwr -UseBasicParsing https://raw.githubusercontent.com/MoZ3ro/AppleMusicBridgeWin/main/scripts/install.ps1 | iex
```

## インストーラが行うこと

- 最新リリースから **AppleMusicBridgeWin.exe** と **vencord-dist.zip** をダウンロード
- `%LOCALAPPDATA%\MoZ3ro.AppleMusicBridgeWin` に配置
- Discord の `resources\app\index.js` を作成し、Vencord パッチャを読み込み
- 環境変数 `VC_AMBRIDGE_EXE` に exe のフルパスを設定（ユーザー環境変数）
- Discord を起動

## 使い方

1. 上のワンライナーを実行すると **Discord が再起動**します。
2. Discord → **Settings → Vencord → Plugins** で **AppleMusicBridgeWin** を有効化。
3. **Apple Music / iTunes** を再生すると、Rich Presence に **曲名 / アーティスト / 再生位置** が出ます。  
   ※ プラグインを **OFF/ON** するとブリッジの起動/再起動がトリガーされます。

## 動作要件

- Windows 10 / 11
- Discord デスクトップ版（Stable）
- Apple Music for Windows **または** iTunes（GSMTC 対応）
- 管理者権限は不要

## トラブルシューティング

### 「未設定 / 不正（未設定）」と出る

`VC_AMBRIDGE_EXE` が未設定かも。**PowerShell で確認：**

```powershell
# ユーザー環境変数の値を表示（なんかしらのパスが出ればOK）
[Environment]::GetEnvironmentVariable('VC_AMBRIDGE_EXE','User')

# 存在の確認（True ならOK）
$exe = [Environment]::GetEnvironmentVariable('VC_AMBRIDGE_EXE','User')
$exe; Test-Path $exe
```

値が空、または`False`の時は正しいパスを再設定

```powershell
# 例：C:\Tools\AppleMusicBridgeWin\AppleMusicBridgeWin.exe を使用する場合
[Environment]::SetEnvironmentVariable(
  'VC_AMBRIDGE_EXE',
  'C:\Tools\AppleMusicBridgeWin\AppleMusicBridgeWin.exe',
  'User'
)

# Discord を完全終了して再起動
taskkill /IM Discord.exe /F 2>$null
Start-Process "$env:LOCALAPPDATA\Discord\Update.exe" -ArgumentList '--processStart Discord.exe'
```

## 何も出ない / 途切れる

- Discord を完全終了（トレイからも終了）→ 再起動
- Plugins で AppleMusicBridgeWin を OFF → ON
- Apple Music / iTunes を一度停止 → 再生
- Discord の Stable を使っているか（PTB/Canary は未検証）
- ブリッジ EXE を直接実行して標準出力が流れるか確認
"%LOCALAPPDATA%\MoZ3ro.AppleMusicBridgeWin\AppleMusicBridgeWin.exe"

##アップデート(するかわかんねえけど)

アセット名は固定にするので。もう一度ワンライナーを実行すれば、EXE と Vencord dist が上書き更新されますと。

```powershell
iwr -UseBasicParsing https://raw.githubusercontent.com/momotaro-z3ro/AppleMusicBridgeWin/main/scripts/install.ps1 | iex
```

