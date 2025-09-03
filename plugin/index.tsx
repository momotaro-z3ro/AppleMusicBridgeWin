import definePlugin from "@utils/types";

// グローバル宣言は "any" で衝突を避ける
type Any = any;

let bootTimer: Any = null;
let tickTimer: Any = null;

// Flux に直接投げる（依存が揃っていない時は黙って無視）
function pushActivity(activity: Any | null) {
  const vd: Any = (globalThis as Any).Vencord;
  const FluxDispatcher: Any = vd?.Webpack?.Common?.FluxDispatcher;
  if (!FluxDispatcher) return;

  FluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity,
    activities: activity ? [activity] : [],
    socketId: "AppleMusicWin"
  });
}

export default definePlugin({
  name: "AppleMusicBridgeWin",
  description: "Apple Music (Windows) Rich Presence via GSMTC",
  authors: [{ id: 887973840611840002n, name: "MoZ3ro" }], // ← Discord ID は bigint（n 必須）

  start() {
    // 依存（Vencord / VencordNative / FluxDispatcher）が揃うまで 500ms 間隔で待つ
    const boot = async () => {
      const vd: Any = (globalThis as Any).Vencord;
      const vn: Any = (globalThis as Any).VencordNative;
      const Native: Any = vn?.pluginHelpers?.AppleMusicBridgeWin;
      const FluxDispatcher: Any = vd?.Webpack?.Common?.FluxDispatcher;

      if (!Native || !FluxDispatcher) return; // まだ初期化前

      clearInterval(bootTimer);

      try { await Native.startBridge?.(); } catch {}

      const tick = async () => {
        try {
          // キャッシュがあればそれを、無ければ 2s 以内に 1 回だけポーリング
          const d = (await Native.fetchCached?.()) ?? (await Native.fetchOnce?.(2000));
          if (!d || !d.name) { pushActivity(null); return; }

          const activity: Any = {
            name: "Apple Music",
            type: 2, // LISTENING
            flags: 1,
            created_at: Date.now(),
            application_id: "1239490006054207550",
            details: d.name,
            state: [d.artist, d.album].filter(Boolean).join(" · ")
          };

          // 再生中だけタイムスタンプを付ける
          if (d.status === "Playing" && d.duration && d.position && d.position <= d.duration) {
            const start = Date.now() - d.position;
            activity.timestamps = { start, end: start + d.duration };
          }

          pushActivity(activity);
        } catch (e) {
          console.error("[AMBridge] tick error", e);
        }
      };

      // 3 秒間隔で更新
      tickTimer = setInterval(tick, 3000);
      void tick(); // すぐ 1 回実行
    };

    bootTimer = setInterval(boot, 500);
    void boot();
  },

  stop() {
    if (bootTimer) { clearInterval(bootTimer); bootTimer = null; }
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }

    const vn: Any = (globalThis as Any).VencordNative;
    const Native: Any = vn?.pluginHelpers?.AppleMusicBridgeWin;
    try { Native?.stopBridge?.(); } catch {}

    pushActivity(null); // RP を消す
  }
});
