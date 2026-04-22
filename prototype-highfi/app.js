const pages = [
  { id: "dashboard", label: "Dashboard", title: "高保真原型首页", subtitle: "用更完整的视觉层次把产品定位、核心闭环和比赛展示重点讲清楚。", render: dashboard },
  { id: "reception", label: "Reception", title: "实时接待高保真页", subtitle: "强调接待现场的低打扰辅助，让对话仍然是整个页面的绝对中心。", render: reception },
  { id: "recommend", label: "Recommendations", title: "推荐与竞品高保真页", subtitle: "把推荐结果、竞品应对和促成抓手做成更适合比赛展示的业务界面。", render: recommend },
  { id: "agents", label: "Agent Center", title: "Agent 协调高保真页", subtitle: "用产品化视觉表达多 Agent 系统的可信度、可解释性和扩展边界。", render: agents },
  { id: "report", label: "Report & Follow-up", title: "离店报告与归档高保真页", subtitle: "突出不是止于推荐，而是能形成可交付内容和后续归档闭环。", render: report }
];

const state = { page: "dashboard" };

function render() {
  const current = pages.find((page) => page.id === state.page) || pages[0];

  document.querySelector("#app").innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">SM</div>
        <div class="brand-copy">
          <strong>SalesMate AutoPilot</strong>
          <span>High-Fidelity Prototype<br />德勤比赛展示版本</span>
        </div>
      </div>

      <div class="nav">
        ${pages.map(navButton).join("")}
      </div>

      <div class="side-card">
        <strong>这版适合什么场景</strong>
        <p>更适合比赛展示、路演汇报和交付设计同学继续深化，而不是技术演示模式。</p>
      </div>

      <div class="side-card">
        <strong>表达重点</strong>
        <ul>
          <li>汽车销售场景真实感</li>
          <li>智能副驾而非聊天机器人</li>
          <li>接待到回访的完整闭环</li>
          <li>多 Agent 的技术可信度</li>
        </ul>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <p class="eyebrow">High-Fidelity Prototype</p>
          <h1>${current.title}</h1>
          <p class="subhead">${current.subtitle}</p>
        </div>
        <div class="actions">
          <button class="ghost" data-page="dashboard">产品首页</button>
          <button class="ghost" data-page="reception">核心流程</button>
          <button class="ghost" data-page="agents">技术表达</button>
          <button class="primary" data-page="report">闭环结果</button>
        </div>
      </header>
      ${current.render()}
    </main>
  `;

  bind();
}

function navButton(page) {
  return `
    <button class="${state.page === page.id ? "active" : ""}" data-page="${page.id}">
      ${page.label}
      <small>${page.subtitle}</small>
    </button>
  `;
}

function dashboard() {
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">产品定位</p>
        <h2>把接待、推荐、报告和归档做成一个真正可演示的门店销售闭环</h2>
        <p>
          这版高保真原型重点强化“业务感”和“可信感”。它不再只是一个功能结构图，而是更接近真实产品界面，
          让评委在第一屏就能理解：这是一个面向汽车门店的 AI 销售副驾，而不是泛化聊天工具。
        </p>
        <div class="pill-row">
          <span class="pill">实时接待</span>
          <span class="pill">客户画像</span>
          <span class="pill">竞品应对</span>
          <span class="pill">离店报告</span>
          <span class="pill">DMS 归档</span>
        </div>
        <div class="pill-row">
          <span class="token">多 Agent 协同</span>
          <span class="token">Mock ASR / Browser ASR</span>
          <span class="token">Dify / Ollama 可插拔</span>
        </div>
      </div>
      <div class="hero-visual">
        <div class="float-card a">
          <strong>接待实时感知</strong>
          <small>把客户语言即时转成预算、家庭、竞品和顾虑信号。</small>
        </div>
        <div class="float-card b">
          <strong>销售低打扰辅助</strong>
          <small>建议卡始终在侧边，不抢对话主场。</small>
        </div>
        <div class="float-card c">
          <strong>离店后可沉淀</strong>
          <small>不止推荐，还形成报告、归档和回访策略。</small>
        </div>
        <div class="vehicle">
          <div class="tire left"></div>
          <div class="tire right"></div>
        </div>
      </div>
    </section>

    <section class="grid four">
      ${metric("今日接待", "8", "已排队客户中 2 位为高意向，建议重点跟进。")}
      ${metric("AI 采纳率", "64%", "当前建议已经具备较好的现场复述可用性。")}
      ${metric("待回访", "12", "其中 3 位建议 24 小时内联系。")}
      ${metric("待同步", "2", "Processing Store 已保留归档，等待 DMS 接口可用。")}
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">业务闭环</p>
          <h2>从一句客户原话，走到一条可执行销售动作</h2>
        </div>
        <button class="ghost" data-page="reception">进入接待页</button>
      </div>
      <div class="stage-band">
        ${stage("1", "接待", "客户说了什么，先实时进入系统。", true)}
        ${stage("2", "分析", "识别意图、预算、家庭与顾虑。")}
        ${stage("3", "推荐", "输出车型建议和竞品应对。")}
        ${stage("4", "离店", "生成个性化选车报告。")}
        ${stage("5", "归档", "写入 DMS 或本地待同步层。")}
      </div>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">比赛展示重点</p>
          <h2>建议在路演中反复强调的三件事</h2>
        </div>
      </div>
      <div class="feature-grid">
        <article class="feature-card">
          <h3>不是聊天机器人</h3>
          <p>它围绕真实门店接待流程展开，重点是辅助销售行动，而不是生成任意闲聊内容。</p>
        </article>
        <article class="feature-card">
          <h3>不是单点推荐</h3>
          <p>它从接待一路延伸到离店报告、DMS 回写和后续回访，价值来自完整闭环。</p>
        </article>
        <article class="feature-card">
          <h3>不是黑盒模型</h3>
          <p>通过多 Agent 页面和工作流表达，可以清楚展示系统的职责划分和技术扩展空间。</p>
        </article>
      </div>
      <p class="footer-note">建议比赛时先讲这页，再切实时接待页，效果会比直接讲技术实现更好。</p>
    </section>
  `;
}

function reception() {
  return `
    <section class="status-strip">
      <div>
        <p class="eyebrow">当前接待</p>
        <h2>张先生，首次到店咨询家庭 6/7 座 SUV</h2>
        <p class="subhead">客户已明确家庭多人出行场景、预算区间和竞品关注点，正进入推荐比较阶段。</p>
      </div>
      <div class="capsules">
        <span class="capsule">ASR: Mock</span>
        <span class="capsule good">销售助手: 已开启</span>
        <span class="capsule warn">阶段: Recommend</span>
      </div>
      <div class="actions">
        <button class="ghost">播放下一句</button>
        <button class="ghost">更新画像</button>
        <button class="primary">触发救场</button>
      </div>
    </section>

    <section class="workspace">
      <div class="column">
        <article class="shell-card">
          <p class="eyebrow">客户画像</p>
          <h2>张先生</h2>
          <div class="probability">
            <span>购买概率</span>
            <strong>78%</strong>
            <div class="bar"><span style="width:78%"></span></div>
          </div>
          <dl class="meta">
            <dt>预算</dt><dd>25-30 万</dd>
            <dt>家庭</dt><dd>两个孩子，周末带老人出行</dd>
            <dt>旧车</dt><dd>2018 款日产轩逸</dd>
            <dt>顾虑</dt><dd>第三排体验、价格差异、长期成本</dd>
          </dl>
          <div class="token-row">
            <span class="token">家庭出行</span>
            <span class="token">竞品比较</span>
            <span class="token">预算敏感</span>
            <span class="token">置换权益</span>
          </div>
        </article>

        <article class="tip-card success">
          <h3>页面设计意图</h3>
          <p>左侧画像卡固定，方便销售在接待中快速确认自己是否抓住了客户重点。</p>
        </article>
      </div>

      <div class="column">
        <article class="shell-card dialogue">
          <div class="section-head">
            <div>
              <p class="eyebrow">实时对话</p>
              <h2>接待主视图</h2>
            </div>
            <button class="quiet">重播脚本</button>
          </div>
          <div class="dialogue-list">
            ${bubble("customer", "客户", "家里两个小孩，周末还得带老人出去，所以想看看 6 座或者 7 座 SUV。", "事件：家庭场景识别")}
            ${bubble("sales", "销售", "您更看重空间和舒适性，还是后期用车成本？我可以按这个方向帮您先缩小范围。", "事件：需求澄清")}
            ${bubble("customer", "客户", "预算大概 25 到 30 万，主要还是别太费油。", "事件：预算更新")}
            ${bubble("customer", "客户", "汉兰达我也看过，感觉还行，就是第三排一般。", "事件：竞品识别")}
            ${bubble("customer", "客户", "那理想 L8 比汉兰达贵，贵在哪儿？", "事件：卡壳救场")}
          </div>
        </article>
      </div>

      <div class="column">
        <article class="shell-card">
          <p class="eyebrow">AI 侧边建议</p>
          <h2>当前最该说什么</h2>
          <div class="tip-stack">
            <article class="tip-card alert">
              <h3>救场建议</h3>
              <p>建议先别从“贵不贵”争论，先把价值拆成第三排体验、城市通勤成本和智能座舱三个维度。</p>
            </article>
            <article class="tip-card">
              <h3>推荐话术</h3>
              <p>如果您家里老人和孩子都会坐第三排，我们可以先从“是不是更方便上下车、更舒服”这个角度来比。</p>
            </article>
            <article class="tip-card success">
              <h3>竞品提示</h3>
              <p>客户主动提到汉兰达，说明已经进入竞品比较心智，建议跳转推荐页展示结构化对比。</p>
            </article>
          </div>
        </article>

        <article class="tip-card">
          <h3>为什么这样设计</h3>
          <p>接待页只保留“下一句该怎么接”。更复杂的推荐依据和技术说明分别放到推荐页和 Agent 页。</p>
        </article>
      </div>
    </section>
  `;
}

function recommend() {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">推荐与竞品</p>
          <h2>把客户顾虑转成可执行建议</h2>
        </div>
        <div class="actions">
          <button class="ghost">加入竞品</button>
          <button class="primary">刷新推荐</button>
        </div>
      </div>
      <div class="compare-layout">
        <article class="shell-card">
          <p class="eyebrow">推荐结果</p>
          <div class="card-list">
            ${listCard("理想 L8 Pro", "6 座增程 SUV", "适配度 92", "更适合家庭多人出行，第三排体验和上下车便利性更贴近张先生当前场景。")}
            ${listCard("丰田汉兰达", "7 座混动 SUV", "适配度 78", "品牌认知与保值率较强，但第三排和智能化优势不明显。")}
            ${listCard("大众途昂", "7 座燃油 SUV", "适配度 74", "空间尺寸足够，但城市通勤油耗与长期使用成本压力偏高。")}
          </div>
        </article>

        <article class="shell-card">
          <p class="eyebrow">促成抓手</p>
          <div class="card-list">
            <article class="tip-card">
              <h3>置换补贴</h3>
              <p>客户有旧车，可顺势引导到旧车评估和置换权益，降低价格敏感度。</p>
            </article>
            <article class="tip-card">
              <h3>金融方案</h3>
              <p>从月供和长期成本角度切入，比单纯讨论总价更容易让客户接受。</p>
            </article>
            <article class="tip-card success">
              <h3>保养权益</h3>
              <p>可通过保养礼包强化长期使用价值，回应“别太费钱”的核心顾虑。</p>
            </article>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">竞品比较</p>
          <h2>理想 L8 Pro vs 汉兰达</h2>
        </div>
      </div>
      <div class="table">
        ${tableRow("空间", "6 座布局更适合老人和孩子同时乘坐，进出第三排更方便。", "7 座更传统，但第三排舒适度与便利性偏弱。")}
        ${tableRow("能耗", "城市通勤优先用电，长期成本更友好。", "混动油耗较低，但日常通勤成本仍高于增程方案。")}
        ${tableRow("智能化", "语音、座舱和家庭多人使用体验更完整。", "功能够用，但整体更偏传统。")}
        ${tableRow("销售切入点", "从长期家庭体验和日常用车成本切入。", "从品牌稳定性和保值率切入。")}
      </div>
      <p class="footer-note">这页最好由“客户为什么会犹豫”切入，而不是单纯逐项念参数。</p>
    </section>
  `;
}

function agents() {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Agent Center</p>
          <h2>把系统底层做成可理解、可讲述的产品界面</h2>
        </div>
        <button class="primary">刷新本轮执行</button>
      </div>
      <div class="grid two">
        <article class="shell-card">
          <p class="eyebrow">Agent Registry</p>
          <div class="card-list">
            ${rowCard("ListenerAgent", "感知与监听", "从对话中提取意图、关键词和风险信号。")}
            ${rowCard("ProfileAgent", "画像更新", "把自然语言沉淀为结构化客户画像。")}
            ${rowCard("RecommendationAgent", "推荐生成", "输出车型建议、竞品卡和销售话术。")}
            ${rowCard("FollowupAgent", "离店与回访", "生成报告与后续跟进策略。")}
            ${rowCard("ArchiveCoordinator", "归档协调", "负责 Processing Store 与 DMS 同步状态。")}
          </div>
        </article>
        <article class="shell-card">
          <p class="eyebrow">Execution Plan</p>
          <div class="card-list">
            ${rowCard("Step 1", "ListenerAgent", "识别客户当前意图和信号。")}
            ${rowCard("Step 2", "ProfileAgent", "更新预算、顾虑和购买概率。")}
            ${rowCard("Step 3", "RecommendationAgent", "生成推荐和竞品策略。")}
            ${rowCard("Step 4", "FollowupAgent", "沉淀为报告和回访建议。")}
            ${rowCard("Step 5", "ArchiveCoordinator", "写入本地加工层并准备同步。")}
          </div>
          <div class="memory-row">
            <span class="memory">dialogue</span>
            <span class="memory">profile</span>
            <span class="memory">recommendation</span>
            <span class="memory">followup</span>
            <span class="memory">archive</span>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Run Log</p>
          <h2>本轮执行结果摘要</h2>
        </div>
      </div>
      <div class="grid three">
        ${reportCard("ListenerAgent", "识别到家庭出行、预算约束、竞品比较和价格质疑四类关键信号。")}
        ${reportCard("ProfileAgent", "购买概率更新为 78%，新增顾虑点：第三排体验、长期使用成本和价格差异。")}
        ${reportCard("RecommendationAgent", "主推理想 L8 Pro，输出竞品对比卡和置换/金融 Booster。")}
        ${reportCard("FollowupAgent", "生成高意向回访策略，建议 1-2 天内联系。")}
        ${reportCard("ArchiveCoordinator", "Processing Store 写入成功，DMS 状态为 PENDING。")}
        ${reportCard("系统价值", "这一页帮助评委理解项目的技术边界、职责拆分与后续扩展能力。")}
      </div>
    </section>
  `;
}

function report() {
  return `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">离店与归档</p>
          <h2>把这次接待真正变成后续可继续经营的资产</h2>
        </div>
        <div class="actions">
          <button class="ghost">生成报告</button>
          <button class="primary">同步 DMS</button>
          <button class="ghost">重试待同步</button>
        </div>
      </div>
      <div class="report-layout">
        <article class="shell-card report-sheet">
          <p class="eyebrow">离店报告</p>
          <h2>张先生的专属选车建议</h2>
          <h4>一、需求总结</h4>
          <ul>
            <li>家庭多人出行，希望 6 座或 7 座 SUV 更适合老人和孩子共同乘坐</li>
            <li>预算集中在 25-30 万，对长期用车成本较为敏感</li>
            <li>目前已看过汉兰达，希望判断理想 L8 的价值差异</li>
          </ul>
          <h4>二、推荐车型</h4>
          <p><strong>主推：理想 L8 Pro</strong></p>
          <p>更适合家庭多人场景，第三排与上下车体验更强，同时城市通勤成本控制更好，座舱体验也更贴近家庭用户需求。</p>
          <h4>三、下一步建议</h4>
          <p>建议安排以第三排乘坐体验和智能座舱场景为重点的深度试乘试驾，并同步测算旧车置换权益方案。</p>
        </article>

        <div class="column">
          ${reportCard("DMS 状态", "当前记录已写入本地 Processing Store，状态为 PENDING，可在接口恢复后继续重试。")}
          ${reportCard("回访策略", "建议定义为高意向客户，1-2 天内联系，延续“第三排体验 + 旧车置换 + 长期成本”三条主线。")}
          ${reportCard("比赛讲法", "用这一页收束整套方案，强调项目价值不止在“会推荐”，而在“能承接接待结果并支撑后续经营”。")}
        </div>
      </div>
    </section>
  `;
}

function metric(title, value, desc) {
  return `
    <article class="metric">
      <p class="eyebrow">${title}</p>
      <strong>${value}</strong>
      <p>${desc}</p>
    </article>
  `;
}

function stage(step, title, desc, active = false) {
  return `
    <article class="stage-card ${active ? "active" : ""}">
      <b>${step}</b>
      <h3>${title}</h3>
      <p>${desc}</p>
    </article>
  `;
}

function bubble(type, who, text, meta) {
  return `
    <div class="bubble ${type}">
      <strong>${who}</strong>
      <p>${text}</p>
      <small>${meta}</small>
    </div>
  `;
}

function listCard(title, type, score, desc) {
  return `
    <article class="list-card">
      <div class="section-head">
        <div>
          <h3>${title}</h3>
          <p>${type}</p>
        </div>
        <span class="pill">${score}</span>
      </div>
      <p>${desc}</p>
    </article>
  `;
}

function rowCard(title, tag, desc) {
  return `
    <article class="row-card">
      <h3>${title}</h3>
      <p><strong>${tag}</strong></p>
      <p>${desc}</p>
    </article>
  `;
}

function reportCard(title, desc) {
  return `
    <article class="report-panel">
      <h3>${title}</h3>
      <p>${desc}</p>
    </article>
  `;
}

function tableRow(label, left, right) {
  return `
    <div class="table-row">
      <strong>${label}</strong>
      <span>${left}</span>
      <span>${right}</span>
    </div>
  `;
}

function bind() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.dataset.page;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

render();
