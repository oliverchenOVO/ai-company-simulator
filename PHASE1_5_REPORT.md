# FOUNDRY — Phase 1.5 Gameplay Acceptance / Balance Audit

Date: 2026-10-03, Asia/Taipei. Existing architecture and version0.1.0 retained.

## Executive Summary

**Requires further Phase 1.5 iteration before Phase 2.** 本輪已完成策略／因果／警告／恢復審計與局部 UX 改善，工程回歸通過；但不能將它宣稱為已完成玩家研究或成熟的經濟平衡。

六種可見資訊策略，每種100個共用 seeds，分別跑2年和5年（共1,200 sessions）。保守策略100%存活；不降創辦人薪資的精簡策略73%；被動3%；本次積極招聘、員工優先與產品優先政策0%。這證明玩家決策有影響、存在恢復與多條生存路徑，也顯示本次採樣中薪資控制占主導。不能據此宣稱全域最佳策略。

額外的合法低薪招聘探針揭露重大漏洞：NT$1月薪的新員工，其期待也被初始化為NT$1；同樣積極策略10個seeds有9個存活，合理35k開價0個存活。這不是正常策略多樣性。需要下一輪1.5釐清薪資期待／談判開價的關係及舊replay的版本相容性；本輪沒有任意指定市場薪資或擅自破壞舊存檔。

## Decision Clarity

|畫面|有效資訊／原問題|本輪改善／剩餘限制|
|---|---|---|
|總覽|現金、MRR、淨支出、團隊；最初4.8月跑道沒有規劃提示|<6月規劃、<3月警告、<1月／下次月結不足危險；直接導向財務／人員／客戶／產品|
|人員|定性狀態、薪資與人事紀錄；招聘／調薪成本不易比較|即時公司月薪／估計跑道預覽，過去公開事件連到原因；不显示心理數字|
|團隊|成員與主管可見；容易以為調組立即增加產能|說明分組影響合作關係，現有公司共用產出；90日實測沒有直接經濟效果|
|產品|功能／品質／技術債取捨與上市日期清楚|維持介面。上市後100%開發上限限制長期故事，不能假裝新增版本系統|
|客戶|合約與流失；原本定性提示較晚|「體驗轉弱」→「需要跟進」及總覽提醒；外部預算分類不保證有預警|
|財務|MRR、薪資、月結紀錄；跑道忽略當月已累積應付支出|顯示下次月結預估及假設，區分MRR與按有效天數入帳的收入|
|收件匣|月結／客戶訊息容易淹沒危機|可關閉的重要程度排序、歷史日期提示；不刪事件|
|時間軸|可以找相關事件；零權重原因也被列出|僅列實際非零原因、定性證據、員工先前公开紀錄及重要程度篩選|
|設定|策略、匯出／還原／replay入口清楚|保留介面與離線存檔；不新增帳號／雲端同步|

週以上推進提供實際cash／MRR／人數／客戶／產品差異、最多4筆優先事件與目前警告。摘要可收起；單日不彈出摘要。儲存成功才顯示接受後的結果，失敗仍保持原世界。既有九畫面與設計語言保留。

10秒內辨認緊急問題的目標只有介面審查，未進行真人計時研究。四場操作由Codex透過實際Chrome控制完成，不能冒充真人測試。

## Difficulty

詳細分布、3/6/12/24月檢查點、薪資／現金／MRR／客戶／員工／事件分布見 [STRATEGY_BENCHMARK.md](docs/phase1_5/STRATEGY_BENCHMARK.md)。每個政策讀CompanyView，不接觸私有退出意圖、忠誠、隨機閾值。内部診斷在策略之外單獨標示。

相同benchmark-001，第90天財務危機後縮編CTO、創辦人薪資10k、穩健與品質的分支，到第455天仍存活／現金605,547；不干預分支第181天破產／現金−39,834。這是組合干預的因果證據，不能全歸因於品質。

單一35k工程師招聘：上市由第64天提前到50天，第90天現金188,666→92,624，月薪增加35k。早期取得合約的節奏跟不上過度招聘支出。薪資5萬對4萬：90日現金少30k，上市日相同。即使薪資提高沒有立刻顯著改變产能，也有真實成本。

破產分類採多原因：合約收入不足、薪資負擔、招聘暴露、流失、員工損失、未上市。它們是事件／財務資料支持的診斷分類；招聘關聯不是單一因果證明，且當期實際收入與期末MRR不同。月結按歷史有效日數計算，因此即使当前月額剛好收支平衡，過去當月收入尚不足以支付已賺薪資，仍可能破產。

原始「recovery count」只表示跑道跨回3月以上；被動公司也會因入帳時間／新合約暫時跨回，不能當成功救援。控制分支才是介入效果的證據。不聲稱已測得數學必然破產時點；下次月結不足是現有合約／薪資固定的條件推估，未来干預或新合約仍可改變結果。

## Causality

benchmark-001 被動：第59天<3月警告，第151天<1月／月結預估不足，第181天實際停業，分別有122天與30天窗口。積極政策第15天<3月，第59天嚴重警告，第90天停業。日級診斷與正式月結事件均保留。

retention-001：CTO薪資降為0，内部退出風險第17天（僅診斷）、公開顧慮第29天、正式關切第30天、壓力第95天、離職第147天。可見關切有117天提前量。第70天恢復薪資／降低工作節奏的分支保留員工；未干預分支離職。離職分類实际包含薪資、疲勞與工作滿意度，忠誠因子為0，現在不再錯列忠誠原因。

薪資期望不满足也會累積壓力／疲勞；新測試最初错误假設此案例沒有疲勞，已改成逐項核對真實事件的非零來源與projection，而非更改simulation使错误期待通過。原Phase1的34個測試與全部assertions保留。

40位零薪資工程師的合法命令診斷（不是正常政策，也沒有注入狀態）產生24次產品體驗流失。較早的定性訊號將沒有事前可見警告的案例由2/24→0/24；世界hash完全相同。這是該trace的結果，不保證所有seeds，也不保證外部預算因素可預警。

「management」原因在目前公式主要表示工作滿意度低，不足以證明主管失職；UI明確說明。客戶預算分類是模型中的外部／隨機流失分類，没有具體客戶預算事件；不虚構抱怨或預算衰退故事。

## Story Quality

詳細實際因果鏈、噪音／事件間隔與日期見 [STORY_AUDIT.md](docs/phase1_5/STORY_AUDIT.md)，四場UI操作的决定與日期見 [PLAYTEST_NOTES.md](docs/phase1_5/PLAYTEST_NOTES.md)。保守与補救場存活超過12月；積極場第90天破產；穩定員工場第151天破產。四場改善前後final hash完全一致，兩版每場console/page errors為0。

長期精簡公司存活730天後轉成長：第849天壓力、第1023天需要休息、第1106天Carol離職；壓力到離職257天窗口。第1030天轉穩健的180天分支保留兩人並恢復可見穩定，繼續成長分支只剩一人且需要休息；後者反而因薪資減少有較高現金。倫理／留任與帳面財務不是同一個分數。

一般合理薪資政策沒有在破產前產生離職；早期故事主要由現金、產品與招聘構成。不能宣稱已有很高的人際故事密度。PayrollProcessed／FinancialClose月結對與長期客戶事件較重複；现在只改善呈現分類，不删除權威事件或生成假戲劇。

## Balance Changes

**No simulation balance parameters were changed during Phase 1.5.**

沒有更改RNG、scheduler、心理／工作／產品／獲客／流失／薪資／破產方程、初始配置、domain schema。改動只包括projection、application呈現回饋、UI與developer tooling。Golden fixtures没有再生成，simulationVersion1／save schema1／APP_VERSION0.1.0保留。

未解問題與拒絕直覺調參理由詳見 [BALANCE_CHANGES.md](docs/phase1_5/BALANCE_CHANGES.md)。低薪開價漏洞值得修正，但「任意最低薪」無法處理薪資期待本身與既有replay，不能假稱已解決。

## Test Results

|驗證|实际結果|
|---|---|
|lint / strict typecheck / production build|Passed|
|Vitest|45 tests /7 files passed，原34項保留|
|Golden seeds|3 seeds × year1/3/5，原hash不變|
|本機瀏覽器／Electron E2E|9/9 passed，最后14.4s|
|實際packaged Windows驗收|1/1 passed，最后8.6s；招聘、調薪、SQLite重啟|
|原版0.1.0存檔|本輪UI修改前透過真瀏覽器匯出的檔案，restore／replay hash一致|
|策略與恢復工具|1,200 sessions；每次獨立replay及validated save round-trip，差異0|
|四場before/after UI操作|4/4相同hash，两版每場瀏覽器錯誤0|
|100 seeds ×5 years|1,813ms，crash/NaN/Infinity/corruption/invariant/replay mismatch全部0|
|1,000人 ×10 years|20,876ms，狀態／schema／invariant／round-trip全部通過；未重跑獨立10年replay|
|Hosted production-equivalent local E2E|7/7 passed，15.9s|
|正式網站 production E2E|7/7 passed，29.4s；刷新、獨立session、offline、決策摘要、原因檢視及desktop/mobile視覺驗收|
|私人GitHub CI|部署來源5e1533f的run 37098172859 completed / success|

一次本機重跑與前一個中止中的test共用preview，server被前一run關閉而產生ERR_CONNECTION_REFUSED；没有隐藏失败，已关闭仅属于本任务的旧test进程并按順序重跑，9/9全通过。Standalone browser lifecycle timeout也记录在playtest notes。最终产品断言未过滤console error，未降低测试标准。

## Performance

Phase1参考100-seed~10.4s、stress~93.6s；本輪分别1.8s與20.9s。并行工作量差别显著，不能把更短时间归功于优化；没有观察到实质回退。最新1,000人UI测试：导航53ms、推進一週+導航319ms，25条分页行。不同运行的timing是观测值，沒有作为脆弱阈值放宽验证。

## Save Compatibility

现有0.1.0真浏览器export已加入tests/fixtures/phase1-0.1.0.save.json，完整校验、restore与独立replay hash一致。无schema migration，因为没有world schema／equation变化。旧Phase1 company可加载、汇出／汇入／手动还原／刷新继续。新摘要不写入world，UI分类也不改变world hash。下一轮修正薪资期待必须明确处理新／旧simulation版本或migration，不能静默改写旧历史。

## Git

Existing private repository: https://github.com/oliverchenOVO/ai-company-simulator . 已完成的功能commit：

- d45b5c9 — observable policy harness and replay-verified branches
- 4169e52 — financial danger, actual time summary, supported causal evidence and UI acceptance
- c32b41e — warning lead times, recovery, counterfactual differences and low-offer diagnostic
- a3ab880 — strategy distributions, actual playthrough saves and causal/balance audit
- 5e1533f — production-equivalent hosted validation and economic audit limitations
- docs(release): record Phase 1.5 production acceptance — 最後文件提交，記錄部署與正式E2E結果；hash可由Git log查閱

全部完成工作已細分提交並推至既有私人repo；gh repo view確認isPrivate=true。最後文件提交後git status --porcelain為空。未建立公開GitHub repository或release。最後文件提交只記錄結果，不改變已驗證／已部署遊戲內容。

正式網站：[FOUNDRY](https://foundry-company-simulator.oliverchenovo.chatgpt.site)。Sites version3，部署来源5e1533f746f12e299cf14402cdce53e408ae2cd1；deployment appgdep_6ac08d27fb108191a8d4b42f71de6126於2026-10-03T05:06:00Z succeeded，維持既有public audience。版本metadata與production驗收項目見[data/production-acceptance.json](docs/phase1_5/data/production-acceptance.json)。視覺截圖留在本機C:/Users/oliver/.codex/artifacts/foundry-phase1-5-hosted-qa，已檢視mobile總覽、財務及員工詳情。各訪客的browser-local進度互不干擾並可刷新續玩；仍沒有帳號雲端跨裝置同步。

## Recommendation for Phase 2

**先继续Phase1.5，不实施Phase2。**

1. 先修正低薪招聘与薪资期待的关系，提出明确problem／evidence／change／expected／measured／regression方案。对新游戏和既有0.1.0命令历史实施显式兼容测试；不可无声再生成goldens。
2. 扩大合理薪资的招聘／出售／成本政策搜索并做真人playtest，验证是否需要调整早期资本或获客節奏。当前只证明两条生存路径，不能称策略多样性充分。
3. 研究团队／管理质量如何以可观察、可干预的机制影响工作与关系；90日调组缺乏直接经营差异，是未来最有价值的候选。
4. Phase2获准后优先管理质量与有限职业目标／留任取捨，再考虑关系层；当前人际事件常晚于经济失败，先解决经济窗口。Slack／email／LLM叙事不是目前的首要缺口。

新Phase2功能、云同步、多人、3D或LLM均未添加。

## Deployment tooling note

Sites source checkout/credential workflow完成來源驗證、build與push後，bundled packaging helper將Windows路徑傳入bash，造成package-site.sh路徑轉譯失敗。保留來源與既有公開audience，改用本機tar僅打包.openai/hosting.json與out/，再交給native save/version/deploy檢查；沒有打包原始診斷資料、存檔或憑證。Credential只在session memory與workflow hidden stdin使用。這不是遊戲build或simulation失敗。
