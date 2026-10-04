# FOUNDRY — Phase 2.6C 最終驗收報告

2026-10-04：Phase 2.6C 軟體與基本驗收完成，0.2.4 已發布到既有網址；未進入下一個大型 Phase。正式網站、Windows 實際打包版與私人 CI 都已驗證。本輪不宣稱完成 Phase 2.5 真人留任校準。

[直接開啟遊戲](https://foundry-company-simulator.oliverchenovo.chatgpt.site/)；本機 Windows 成品：`release/Foundry-Company-Simulator-0.2.4-Windows.exe`，98,834,788 bytes，未簽章。SHA-256：`e7c0d380c249f156cc3f397979f2c9e4e9975e1131a24f44bec2d37b6c249fdc`。

## 完成內容

- 執行層暖木、布面休息區、木格柵與柔和重點照明；管理層藍灰規劃空間；工作層明亮實用的密集工作站。木、漆、布、金屬、玻璃與螢幕使用不同材質參數，靜態家具合批、共用微型本地紋理及接觸陰影。
- ID 穩定的人物外觀與三位創辦人辨識特徵；坐姿工作、依移動距離擺動的步態、轉向、文件姿勢、選取名牌，以及真正新聘／晉升／離職事件的有限演出。新聘螢幕醒來、空席螢幕熄滅；保留原人物語意外觀。
- 有真實參與者的會議與向實際主管交接文件；同時最多一場會議及一場交接。人物沿通道繞過桌椅、使用實際座位、共享事件時鐘並返回工作站。沒有虛構訪客、行事曆、商業結果或心理數值。
- 完整建築預設視角、實際樓層聚焦、有限縮放與重置；資訊欄出現時重新匹配相機比例。匯報線沿房間外側；聚焦單層時隱藏跨隱藏樓層的線，但保留實際主管／部屬資訊。
- 保留搜尋、滑鼠 raycast、鍵盤選取、詳細資訊與管理決策。390 px 手機、手動精簡視圖、WebGL 初始化失敗／context loss，以及超過 100 人的既有 SVG 策略均通過驗收。
- 補齊基線、美術方向、編排規則、A–I 前後比較與效能報告。最終比較截圖來自正式 Site 版本 9，全部人工檢視；30 人可展示整棟公司，100 人完整建築需聚焦楼層查看細節。

simulation/domain/narrative 與基線 `56bdc35` 沒有程式 diff。固定 seed、save/load、v1/v2/v3 replay 與 save schema 2 均保留；persistence 只更新 APP_VERSION 至 0.2.4。沒有 LLM、動畫狀態或新的 RNG 呼叫進入核心 simulation。

## 測試結果

| 執行環境 | 結果 | 驗證範圍 |
|---|---|---|
| 本機 build / strict TypeScript / lint | 通過 | Vite、Electron 與型別／lint |
| 單元測試 | 119/119 | 原 112 項全保留；新增 7 項人物穩定性、真實參與者、座位／路徑、reduced motion、非突變與存檔 replay 測試 |
| 本機 installed Chrome Office | 15/15 | 3D、選取、聘用、晉升、空席、兩種演出、保存、刷新、replay、備援 |
| SwiftShader driver | 15/15 | 保留所有 3D 人物，DPR .75；最終程式另由 Linux CI 覆蓋 |
| SwiftShader WebGL fallback | 15/15 | 最终 3.7 分鐘，包含相機比例及手動 SVG → 3D |
| 私人 CI `37185671035` | 全通過 | build、typecheck、lint、119 tests、benchmark；Web 28/28、桌面 1/1、打包 3/3 |
| 發布來源 CI `37185971760` | 全通過 | `0096e16` 只有文件／截圖差異，同一完整 workflow |
| 本機實際 Windows 打包成品 | 3/3，45.7 秒 | 0.2.4、isPackaged=true、真實 3D 與交接、SQLite、正常關閉、重啟、繼續、離線及 replay |
| 正式 HTTPS 網站 Chrome | 27/27，5.3 分鐘 | 獨立 browser sessions、刷新、載入後離線、v2/v3、管理、兩種演出、手機與 fallback、exact replay |
| 正式發布資產 | 9/9 bytes 相同 | 包括 scene 與 simulation worker；HTML 指向目前 entry |

原測試未刪除，deadline 未延長。聚合創辦人流程的晉升工作站檢查移到保存重載後；完整接近、坐下互動和返回仍由獨立會議測試驗證。Office console/page error 斷言全部通過。

## Benchmark 結果

100 seeds × 1,826 天：本機最終 scheduler benchmark 3,217 ms；CI 2,621 ms。crashes、NaN、infinity、corrupted states、invariant violations、replay mismatches 六項均為零。不同負載的時間不作為經濟或留任校準結論。

正式網站 30 人 scene／選取／推進一週／導航：**1377 / 188 / 136 / 164 ms**，708 draw calls，JS heap 27.6 MB。100 人：**2059 / 642 / 337 / 211 ms**，2121 draw calls，52.8 MB。250／1000 人使用 SVG。短期 warm-up 幀間隔包含初始化，不能當作穩態 FPS。

最終 WebGL 軟體繪圖 100 人選取 1,163 ms、推進一週 308 ms；曾有較早同模式選取 3,107 ms，報告保留此波動。手動精簡視圖與聚焦仍適合較慢裝置。Office projection 100 人 median .061 / p95 .135 ms，1000 人 .424 / 1.088 ms；全部不改 simulation hash。

Three 場景 lazy chunk 約 912.6 kB／248.2 kB gzip，基線約 903.3／245.3 kB。既有 chunk size warning 沒有被壓掉。詳細環境、原始數據與限制見 [PERFORMANCE.md](docs/living_office_3d_polish/PERFORMANCE.md)。

## 發布與來源

現有 Site 版本 **9**，部署成功，來源 `0096e16347f39da00c17a1cb64ef1c92db7a0a95`。打包成品來源 `2ed2936187e938a89477215bb859f58b578145c5`；兩者差異只有文件與截圖，runtime 相同。最終報告 commit 也只補充驗收紀錄，不需要重新發布相同 runtime。

私人 GitHub repository `oliverchenOVO/ai-company-simulator` 仍為 PRIVATE；未推送到公開 repository。網站維持原公開訪問設定。存檔隔離是每個瀏覽器 profile/storage 獨立，刷新保留；本 Phase 沒有加入帳號或跨裝置雲端同步。

來源、版本、部署 ID、成品及封包雜湊見 [release.json](docs/living_office_3d_polish/data/release.json)；實際 [production-assets.json](docs/living_office_3d_polish/data/production-assets.json) 保留資產逐一比對。

## Git commits

| Commit | 內容 |
|---|---|
| `753d7c8` | 0.2.3 基線與美術方向 |
| `6712a01` | 真實事件编排與穩定人物風格 |
| `9933546` | 繞開會議桌及容量桌的路徑 |
| `065a545` | 材質、燈光、人物、鏡頭與活動 |
| `b139d12` | 0.2.4 版本及候選驗收證據 |
| `d7c3eb0` | 軟體繪圖幀間輸入空檔 |
| `2ed2936` | 相機準備、手動 fallback、晉升保存檢查 |
| `0096e16` | 已測量效能及穩定截圖；實際發布來源 |

本報告與正式／本機打包證據另由最後一個 `docs(office): finalize 0.2.4 production and packaged acceptance` commit 收尾，完整 hash 可由 `git log` 取得。

## 技術問題與尚未完成項目

1. C: 曾低於 1 GB，早期 trace／截圖寫入發生 ENOSPC；亦出現初次導航 abort。改以 F: 放 QA 與 process-local TEMP/TMP 後重跑通過，失敗證據仍保留，沒有刪除使用者檔案。
2. 兩次早期 Linux 軟體 CI 的創辦人聚合流程超時；原 60 秒預算保留，新增持久化檢查安排更合理，完整活動仍獨立驗證，最終兩次完整 CI 通過。
3. Sites 原生來源同步及 build 已成功，但 Windows Bash 打包路徑失敗。使用新的輸出目錄與本機 tar 封裝同一來源，避免既有 out 中歷史未引用資產；Sites 原生 save/deploy 成功，9 個資產 bytes 比對一致。
4. 先前本機 Electron app.close() 卡住本輪未重現；下載的實際打包檔已正常關閉、重啟並通過全部測試。這是本輪實證，不宣稱找到所有舊環境失敗的通用根因。
5. 完整建築的臉部仍小，模型維持 low-poly，與生成概念圖的細節程度有差距。100 人軟體繪圖仍有明顯延遲，完整大樓的相機不可能同時提供近距離人物細節。
6. **Phase 2.5 尚無獨立真人玩家資料（0 位）**；沒有虛構回饋、留任調參或長期遊玩價值結論。帳號雲端存檔與重大下一 Phase 未納入本輪。

## 下一步建議

先直接驗收 0.2.4 的三層開局、30 人整棟、樓層聚焦與會議／交接；再使用已備妥的 Phase 2.5 測試包收集 3–5 位獨立玩家的匿名回饋。以真人資料判斷理解度與留任動機，再決定下一個大型 Phase；本輪不自動擴張產品。

## 驗收文件

[基線](docs/living_office_3d_polish/BASELINE_REVIEW.md) · [美術方向](docs/living_office_3d_polish/ART_DIRECTION.md) · [编排規則](docs/living_office_3d_polish/CHOREOGRAPHY.md) · [A–I 正式截圖比較](docs/living_office_3d_polish/VISUAL_COMPARISON.md) · [效能](docs/living_office_3d_polish/PERFORMANCE.md)
