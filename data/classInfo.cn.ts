export type ClassInfo = {
  className: string;
  type: string;
  description: string;
  damage: string;
  solutions: string[];
};

export const classInfoList: ClassInfo[] = [
  {
    className: "Citrus Leafminer",
    type: "害虫",
    description: "幼虫在叶片中形成蛇形隧道。",
    damage: "减少光合作用，抑制生长。",
    solutions: [
      "使用园艺油或杀虫皂针对幼虫。",
      "使用系统性杀虫剂如吡虫啉。",
      "修剪并移除受影响的叶片。",
      "引入天敌如寄生蜂（例如 Cirrospilus）。",
    ],
  },
  {
    className: "Fe",
    type: "铁缺乏",
    description: "幼叶发黄，叶脉仍为绿色（叶脉间黄化）。",
    damage: "影响叶绿素的生成，削弱植物生长。",
    solutions: [
      "施用螯合铁肥料（硫酸铁或铁 EDTA）。",
      "将土壤 pH 调整到 5.5-6.5，以改善铁的吸收。",
      "使用叶面喷施铁肥快速纠正。",
      "改善土壤通气和排水，防止根部窒息。",
    ],
  },
  {
    className: "Greasy Spot",
    type: "病害",
    description: "真菌病害导致叶片出现黄色和棕色斑点。",
    damage: "叶片过早脱落，降低产量。",
    solutions: [
      "定期施用铜基杀菌剂。",
      "修剪受影响的叶片并销毁。",
      "通过稀疏树冠改善空气流通。",
      "使用有机杀菌剂如苦楝油或硫磺。",
    ],
  },
  {
    className: "Healthy",
    type: "无异常",
    description: "生长良好，无明显缺陷或害虫问题。",
    damage: "高产量，对害虫和环境压力有抵抗力。",
    solutions: [
      "根据土壤测试结果定期施肥。",
      "确保适当灌溉以防止水分胁迫。",
      "定期监测害虫和病害。",
      "为树木提供足够的间距以确保良好的空气流通。",
    ],
  },
  {
    className: "HLB",
    type: "病害",
    description: "由木虱传播的细菌病害，导致叶片发黄和树木衰退。",
    damage: "严重降低产量，导致果实畸形和最终树木死亡。",
    solutions: [
      "使用杀虫剂如新烟碱类或拟除虫菊酯控制木虱种群。",
      "移除并销毁受感染的树木以防止传播。",
      "使用抗性砧木和品种。",
      "监测并保持定期的害虫管理计划。",
    ],
  },
  {
    className: "Mg",
    type: "镁缺乏",
    description: "老叶叶脉间发黄。",
    damage: "影响叶绿素，削弱光合作用。",
    solutions: [
      "使用硫酸镁（泻盐）作为叶面喷施。",
      "将镁以缓释肥料的形式加入土壤。",
      "测试土壤 pH 并调整到 6.0-6.5，以增强镁的吸收。",
      "使用白云石石灰同时补充镁和钙（如有需要）。",
    ],
  },
  {
    className: "Mn",
    type: "锰缺乏",
    description: "幼叶叶脉间出现黄色斑点或条纹。",
    damage: "影响酶活性，降低光合作用。",
    solutions: [
      "喷施硫酸锰叶面肥。",
      "用硫酸锰改良土壤以缓慢释放。",
      "将土壤 pH 降至 6.5 以下以提高锰的可用性。",
      "使用螯合锰以提高吸收效率。",
    ],
  },
  {
    className: "N",
    type: "氮缺乏",
    description: "老叶普遍发黄，生长受阻。",
    damage: "减少叶片大小和树木活力。",
    solutions: [
      "施用富含氮的肥料（如硝酸铵）。",
      "使用有机肥料如堆肥或粪肥作为缓释选项。",
      "分次施用氮肥以防止流失。",
      "保持一致的灌溉以确保养分到达根部。",
    ],
  },
  {
    className: "Red Scale",
    type: "害虫",
    description: "昆虫在果实、叶片和茎上形成红棕色鳞片。",
    damage: "削弱树木，降低果实质量。",
    solutions: [
      "使用园艺油窒息鳞片昆虫。",
      "施用系统性杀虫剂如吡虫啉以实现长期控制。",
      "释放天敌如瓢虫或捕食性甲虫。",
      "定期监测鳞片的存在并移除受影响的区域。",
    ],
  },
  {
    className: "Red Scale Sequelae",
    type: "继发病害",
    description: "红蜘蛛侵害引起的继发损害，包括真菌感染。",
    damage: "进一步削弱树木，增加恢复难度。",
    solutions: [
      "在处理后遗症之前控制主要的红蜘蛛侵害。",
      "施用杀菌剂如铜或硫磺以防止真菌感染。",
      "修剪并移除受感染的树枝以限制传播。",
      "通过平衡施肥和适当浇水改善树木健康。",
    ],
  },
  {
    className: "Texas Mite",
    type: "害虫",
    description: "螨虫导致叶片出现青铜色和网状物。",
    damage: "减少光合作用，削弱树木健康。",
    solutions: [
      "使用杀螨剂如阿维菌素或拟除虫菊酯。",
      "使用生物控制剂如捕食性螨虫（例如 Phytoseiulus）。",
      "用强水流喷洒植物以驱除螨虫。",
      "保持树木健康以提高对螨虫侵害的抵抗力。",
    ],
  },
  {
    className: "Zn",
    type: "锌缺乏",
    description: "新生叶片小而窄，叶脉间黄化。",
    damage: "减少叶片大小，抑制生长。",
    solutions: [
      "将硫酸锌或螯合锌施用于土壤或作为叶面喷施。",
      "使用专为柑橘设计的含锌肥料。",
      "将土壤 pH 调整到 6.0-6.5，以改善锌的吸收。",
      "向土壤中添加有机物以增加养分的保留和可用性。",
    ],
  },
];
