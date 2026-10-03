import type { DomainEvent } from '../../domain/src/model';
export interface NarrativeMessage { eventId: string; title: string; body: string; channel: '公司' | '人事' | '產品' | '客戶' | '財務'; date: string; }
export interface NarrativeProvider { describe(event: Readonly<DomainEvent>): NarrativeMessage | null; }
const dollars = (value: unknown) => `NT$${Math.round(Number(value) / 100).toLocaleString('en-US')}`;
const strategies: Record<string, string> = { balanced: '均衡發展', growth: '積極成長', sustainable: '穩健經營' };
const priorities: Record<string, string> = { features: '新功能', quality: '品質', debt: '技術債' };
export class TemplateNarrativeProvider implements NarrativeProvider {
  describe(event: Readonly<DomainEvent>): NarrativeMessage | null {
    if (event.visibility === 'private') return null;
    const p = event.payload;
    let title: string, body: string, channel: NarrativeMessage['channel'] = '公司';
    switch (event.type) {
      case 'ManagerOverloaded': title = `${p.name} 的管理負荷偏高`; body = `目前有 ${p.reports} 位直接部屬，支持與工作時間受到限制。可重新安排主管。`; channel = '人事'; break;
      case 'ManagementLoadRecovered': title = `${p.name} 的管理負荷恢復`; body = '直接部屬數已回到目前可支持的範圍。'; channel = '人事'; break;
      case 'TeamCoordinationChanged': title = `${p.name} 的協作狀態改變`; body = p.condition === 'strained' ? '合作效率轉弱，請檢視人員異動、主管支持與團隊規模。' : '合作逐步恢復穩定。'; channel = '人事'; break;
      case 'CareerConcernRaised': title = `${p.name} 希望討論職涯`; body = '期待更清楚的成長路徑。可以檢視晉升準備、角色與主管支持。'; channel = '人事'; break;
      case 'CareerGoalBlocked': title = `${p.name} 的職涯期待持續未解`; body = '長時間缺乏進展開始影響對公司的信任；單純調薪未必能解決。'; channel = '人事'; break;
      case 'CareerGoalProgressed': title = `${p.name} 的職涯目標有進展`; body = '近期工作與安排讓目前目標取得實際進展。'; channel = '人事'; break;
      case 'EmployeePromoted': title = `${p.name} 晉升至 ${p.level}`; body = `採取${p.track === 'manager' ? '管理' : '專業'}路徑，期待月薪調整為 ${dollars(p.expectation)}；實際薪資不會自動提高。${p.premature ? '準備仍需累積，請留意支持需求。' : '具備本次晉升的準備。'}`; channel = '人事'; break;
      case 'ManagerChanged': title = `${p.name} 的主管安排已改變`; body = p.managerId ? '新的主管支持將逐步生效，交接期間需要適應。' : '目前沒有直屬主管，請留意支持缺口。'; channel = '人事'; break;
      case 'TeamManagerChanged': title = `${p.name} 的團隊主管已改變`; body = '成員的匯報安排已更新，團隊需逐步恢復穩定。'; channel = '人事'; break;
      case 'EmployeeRoleChanged': title = `${p.name} 的工作職務已調整`; body = `目前職務為 ${p.role}，既有薪資期待維持；工作成效取決於相關專業能力。`; channel = '人事'; break;
      case 'PeerPromotionReaction': title = `${p.name} 回應同事晉升`; body = p.reaction === 'concerned' ? `${p.promotedName} 的晉升讓自己的成長安排更受關注。` : `${p.promotedName} 的晉升帶來了成長動力。`; channel = '人事'; break;
      case 'CollaborationStrengthened': title = '合作關係逐步增強'; body = `${p.sourceName} 與 ${p.targetName} 的合作累積了信任。`; channel = '人事'; break;
      case 'CompanyCreated': title = '公司成立'; body = `${p.name} 的故事從今天開始。`; break;
      case 'HireOfferRejected': title = `${p.name} 婉拒薪資出價`; body = `出價 ${dollars(p.salary)} 低於此候選人的最低接受額 ${dollars(Math.ceil(Number(p.minimum)/100)*100)}，期待月薪 ${dollars(p.expectation)}。未到職，也未增加薪資支出。`; channel = '人事'; break;
      case 'EmployeeHired': title = `${p.name} 加入團隊`; body = `新夥伴已到職，月薪為 ${dollars(p.salary)}。`; channel = '人事'; break;
      case 'EmployeeFired': title = `${p.name} 結束任職`; body = '解僱決策已執行，該員工不再產生工作產出。'; channel = '人事'; break;
      case 'SalaryOfferRejected': title = `${p.name} 未接受降薪提案`; body = `提案 ${dollars(p.salary)} 低於此員工的最低接受額 ${dollars(Math.ceil(Number(p.minimum)/100)*100)}，期待 ${dollars(p.expectation)}。原月薪 ${dollars(p.previous)} 維持不變。`; channel = '人事'; break;
      case 'SalaryChanged': title = `${p.name} 的薪資已調整`; body = `月薪從 ${dollars(p.previous)} 調整為 ${dollars(p.salary)}，本月按生效日期結算。`; channel = '人事'; break;
      case 'EmployeeMoved': title = `${p.name} 調動團隊`; body = '新的團隊與主管安排已生效。'; channel = '人事'; break;
      case 'EmployeeConcernRaised': title = `${p.name} 提出關切`; body = p.concern === 'compensation' ? '薪資期待與目前安排存在落差，建議安排一次對談。' : '對目前工作安排有所關切。請對照工作節奏、職涯回饋、主管支持與薪資期待；這項訊息本身不足以判定原因。'; channel = '人事'; break;
      case 'EmployeeResigned': title = `${p.name} 提出離職`; body = '離職已生效。時間軸保留了相關管理決策與主要原因，可查看事件來理解經過。'; channel = '人事'; break;
      case 'RelationshipStrained': title = '團隊合作出現摩擦'; body = `${p.sourceName} 與 ${p.targetName} 的合作關係需要注意。`; channel = '人事'; break;
      case 'TeamCreated': title = `${p.name} 團隊成立`; body = '可以在人員頁面調動員工加入新團隊。'; break;
      case 'StrategyChanged': title = '公司策略已調整'; body = `目前採取「${strategies[String(p.strategy)] ?? p.strategy}」，團隊工作節奏將隨之改變。`; break;
      case 'ProductPriorityChanged': title = '產品優先順序已調整'; body = `團隊接下來優先投入「${priorities[String(p.priority)] ?? p.priority}」。`; channel = '產品'; break;
      case 'ProductMilestoneReached': title = `${p.name} 達成開發里程碑`; body = `產品完成度達到 ${p.progress}%。`; channel = '產品'; break;
      case 'ProductLaunched': title = `${p.name} 正式上市`; body = '產品已進入市場，接下來的客戶拓展取決於團隊、市場需求與策略。'; channel = '產品'; break;
      case 'CustomerAcquired': title = `${p.name} 成為客戶`; body = `新增月合約收入 ${dollars(p.mrr)}，本月收入依啟用天數結算。`; channel = '客戶'; break;
      case 'CustomerChurned': title = `${p.name} 停止訂閱`; body = `月合約收入減少 ${dollars(p.mrr)}，既有使用天數仍納入結算。`; channel = '客戶'; break;
      case 'PayrollProcessed': title = `${p.month} 薪資已結算`; body = `已計入薪資支出 ${dollars(p.payroll)}。`; channel = '財務'; break;
      case 'FinancialClose': title = `${p.month} 財務月結`; body = `收入 ${dollars(p.revenue)}，薪資 ${dollars(p.payroll)}，營運費用 ${dollars(p.operatingCost)}。`; channel = '財務'; break;
      case 'RunwayWarning': title = '現金跑道不足三個月'; body = '依目前合約收入與支出估算，請檢視成本與營收策略。'; channel = '財務'; break;
      case 'CompanyBankrupt': title = '公司已停止營運'; body = `月結後現金為 ${dollars(p.cash)}，無法持續營運。你可以載入較早存檔或建立新公司。`; channel = '財務'; break;
      default: throw new Error(`No narrative template for visible event ${event.type}`);
    }
    return { eventId: event.id, title, body, channel, date: event.date };
  }
}
export const templateNarrative = new TemplateNarrativeProvider();
