const areaData = [
  {
    x: -500,
    y: -400,
    width: 700,
    height: 800,
    name: 'selected-rect1684723196047',
    type: 'area',
    strokeColor: 'rgb(255, 0, 14)',
    areaNumber: 'A1',
    textHeight: 400,
  },
  // 货架 + 料箱区（A1 右侧、巷道 T2 南侧）
  {
    x: 560,
    y: -780,
    width: 780,
    height: 560,
    name: 'shelf-goods-area',
    type: 'area',
    strokeColor: 'rgb(0, 160, 255)',
    areaNumber: 'A2',
    textHeight: 650,
  },
  // 仅料箱区（A1 右侧、巷道 T2 北侧）
  {
    x: 560,
    y: 70,
    width: 780,
    height: 360,
    name: 'goods-only-area',
    type: 'area',
    strokeColor: 'rgb(0, 200, 120)',
    areaNumber: 'A3',
    textHeight: 200,
  },
  // A4：A1 左侧相隔 10m（1000 单位），窄条落货区
  {
    x: -1600,
    y: -400,
    width: 100,
    height: 500,
    name: 'a4-staging-area',
    type: 'area',
    strokeColor: 'rgb(255, 180, 0)',
    areaNumber: 'A4',
    textHeight: 200,
  },
];

export default areaData;
