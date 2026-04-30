const sampleStocks = [
  { symbol: "2330", name: "台積電", market: "上市", productType: "股票", sector: "半導體", price: 820, changePct: 1.74, volume: 36120, yield: 1.42, pe: 22.6, pb: 5.4, yearChangePct: 38.2, monthlyRevenue: 195211000, monthlyRevenueYoY: 34.1, monthlyRevenueMoM: 7.8, quarterRevenue: 625532, operatingMargin: 42.0 },
  { symbol: "0050", name: "元大台灣50", market: "上市", productType: "ETF", sector: "ETF", price: 186.3, changePct: 0.54, volume: 39800, yield: null, pe: null, pb: null, yearChangePct: 25.1, monthlyRevenue: null, monthlyRevenueYoY: null, monthlyRevenueMoM: null, quarterRevenue: null, operatingMargin: null },
  { symbol: "00679B", name: "元大美債20年", market: "上櫃", productType: "ETF/債券ETF", sector: "ETF", price: 26.99, changePct: 0.41, volume: 21942, yield: null, pe: null, pb: null, yearChangePct: 3.8, monthlyRevenue: null, monthlyRevenueYoY: null, monthlyRevenueMoM: null, quarterRevenue: null, operatingMargin: null },
  { symbol: "2317", name: "鴻海", market: "上市", productType: "股票", sector: "電子代工", price: 148.5, changePct: -0.67, volume: 81250, yield: 3.45, pe: 14.1, pb: 1.38, yearChangePct: 22.4, monthlyRevenue: 550200000, monthlyRevenueYoY: 18.5, monthlyRevenueMoM: 6.1, quarterRevenue: 1735800, operatingMargin: 3.0 },
  { symbol: "1240", name: "茂生農經", market: "上櫃", productType: "股票", sector: "農業科技", price: 59.3, changePct: 0.34, volume: 280, yield: 5.9, pe: 12.2, pb: 1.75, yearChangePct: 8.9, monthlyRevenue: 268329, monthlyRevenueYoY: 7.33, monthlyRevenueMoM: 30.54, quarterRevenue: 2743.79, operatingMargin: 4.83 },
  { symbol: "2454", name: "聯發科", market: "上市", productType: "股票", sector: "IC 設計", price: 1025, changePct: 0.49, volume: 7900, yield: 5.91, pe: 18.4, pb: 3.25, yearChangePct: 16.8, monthlyRevenue: 47220000, monthlyRevenueYoY: 9.7, monthlyRevenueMoM: -2.1, quarterRevenue: 142709, operatingMargin: 20.7 },
  { symbol: "2412", name: "中華電", market: "上市", productType: "股票", sector: "電信", price: 126, changePct: 0.0, volume: 12100, yield: 3.79, pe: 25.2, pb: 2.55, yearChangePct: 4.3, monthlyRevenue: 18500000, monthlyRevenueYoY: 2.9, monthlyRevenueMoM: 0.8, quarterRevenue: 55890, operatingMargin: 21.9 },
  { symbol: "2881", name: "富邦金", market: "上市", productType: "股票", sector: "金融保險", price: 76.4, changePct: 0.93, volume: 23800, yield: 4.58, pe: 12.8, pb: 1.31, yearChangePct: 13.2, monthlyRevenue: 62100000, monthlyRevenueYoY: 11.6, monthlyRevenueMoM: 4.0, quarterRevenue: 191200, operatingMargin: 14.2 },
  { symbol: "2882", name: "國泰金", market: "上市", productType: "股票", sector: "金融保險", price: 61.2, changePct: -0.16, volume: 31200, yield: 4.08, pe: 11.9, pb: 1.12, yearChangePct: 9.6, monthlyRevenue: 74600000, monthlyRevenueYoY: 8.4, monthlyRevenueMoM: 2.7, quarterRevenue: 223400, operatingMargin: 12.5 },
  { symbol: "2603", name: "長榮", market: "上市", productType: "股票", sector: "航運", price: 188, changePct: 2.17, volume: 54500, yield: 5.32, pe: 8.9, pb: 1.46, yearChangePct: 29.5, monthlyRevenue: 39000000, monthlyRevenueYoY: 21.2, monthlyRevenueMoM: 5.9, quarterRevenue: 118600, operatingMargin: 28.0 }
];

const state = {
  stocks: [...sampleStocks],
  filtered: [],
  dataMeta: null,
  sortKey: "score",
  sortDir: "desc",
  watchlistOnly: false,
  watchlist: new Set(JSON.parse(localStorage.getItem("twStockWatchlist") || "[]"))
};

const els = {
  tradeDate: document.querySelector("#tradeDate"),
  loadOfficial: document.querySelector("#loadOfficial"),
  dataStatus: document.querySelector("#dataStatus"),
  keyword: document.querySelector("#keyword"),
  sector: document.querySelector("#sector"),
  strategy: document.querySelector("#strategy"),
  resetFilters: document.querySelector("#resetFilters"),
  minYield: document.querySelector("#minYield"),
  maxPe: document.querySelector("#maxPe"),
  maxPb: document.querySelector("#maxPb"),
  minVolume: document.querySelector("#minVolume"),
  minYearChange: document.querySelector("#minYearChange"),
  minMonthlyRevenueYoY: document.querySelector("#minMonthlyRevenueYoY"),
  minQuarterRevenue: document.querySelector("#minQuarterRevenue"),
  minPrice: document.querySelector("#minPrice"),
  maxPrice: document.querySelector("#maxPrice"),
  onlyComplete: document.querySelector("#onlyComplete"),
  csvFile: document.querySelector("#csvFile"),
  exportCsv: document.querySelector("#exportCsv"),
  rankYearChange: document.querySelector("#rankYearChange"),
  showWatchlist: document.querySelector("#showWatchlist"),
  resultCount: document.querySelector("#resultCount"),
  avgYield: document.querySelector("#avgYield"),
  avgPe: document.querySelector("#avgPe"),
  avgVolume: document.querySelector("#avgVolume"),
  avgYearChange: document.querySelector("#avgYearChange"),
  avgMonthlyRevenueYoY: document.querySelector("#avgMonthlyRevenueYoY"),
  avgQuarterRevenue: document.querySelector("#avgQuarterRevenue"),
  stockRows: document.querySelector("#stockRows"),
  minYieldValue: document.querySelector("#minYieldValue"),
  maxPeValue: document.querySelector("#maxPeValue"),
  maxPbValue: document.querySelector("#maxPbValue"),
  minVolumeValue: document.querySelector("#minVolumeValue"),
  minYearChangeValue: document.querySelector("#minYearChangeValue"),
  minMonthlyRevenueYoYValue: document.querySelector("#minMonthlyRevenueYoYValue"),
  minQuarterRevenueValue: document.querySelector("#minQuarterRevenueValue")
};

function init() {
  els.tradeDate.value = getTaipeiDate();
  bindEvents();
  populateSectors();
  applyFilters();
  loadBundledData();
}

function bindEvents() {
  [
    els.keyword,
    els.sector,
    els.minYield,
    els.maxPe,
    els.maxPb,
    els.minVolume,
    els.minYearChange,
    els.minMonthlyRevenueYoY,
    els.minQuarterRevenue,
    els.minPrice,
    els.maxPrice,
    els.onlyComplete
  ].forEach((el) => el.addEventListener("input", applyFilters));

  els.strategy.addEventListener("change", applyStrategy);
  els.resetFilters.addEventListener("click", resetFilters);
  els.loadOfficial.addEventListener("click", loadOfficialData);
  els.csvFile.addEventListener("change", importCsv);
  els.exportCsv.addEventListener("click", exportCsv);
  els.rankYearChange.addEventListener("click", () => {
    state.sortKey = "yearChangePct";
    state.sortDir = "desc";
    render();
  });
  els.showWatchlist.addEventListener("click", () => {
    state.watchlistOnly = !state.watchlistOnly;
    els.showWatchlist.textContent = state.watchlistOnly ? "顯示全部" : "觀察清單";
    applyFilters();
  });

  document.querySelectorAll("th[data-sort]").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = key === "name" || key === "sector" || key === "symbol" ? "asc" : "desc";
      }
      render();
    });
  });
}

function getTaipeiDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function shiftYearToken(dateToken, offset) {
  const year = Number(dateToken.slice(0, 4)) + offset;
  return `${year}${dateToken.slice(4)}`;
}

function toRocDate(dateToken) {
  const year = Number(dateToken.slice(0, 4)) - 1911;
  const month = dateToken.slice(4, 6);
  const day = dateToken.slice(6, 8);
  return `${year}/${month}/${day}`;
}

async function loadOfficialData() {
  await loadBundledData(true);
}

async function loadBundledData(forceMessage = false) {
  try {
    if (forceMessage) setStatus("正在載入完整上市、上櫃與 ETF 資料...");
    const payload = await fetchJson(`data/market-data.json?v=${Date.now()}`);
    if (!Array.isArray(payload.rows) || !payload.rows.length) {
      throw new Error("完整資料檔格式不正確。");
    }
    state.stocks = payload.rows;
    state.dataMeta = payload;
    state.watchlistOnly = false;
    els.showWatchlist.textContent = "觀察清單";
    if (payload.tradeDate) els.tradeDate.value = payload.tradeDate;
    populateSectors();
    applyFilters();
    setStatus(`已載入 ${payload.tradeDate || "最新"} 完整資料：上市 ${payload.twseCount || 0} 檔、上櫃 ${payload.tpexCount || 0} 檔，合計 ${payload.total || payload.rows.length} 檔，包含 ETF/ETN。`);
  } catch (error) {
    if (forceMessage) {
      setStatus(`完整資料檔載入失敗：${error.message} 目前保留畫面資料。`);
    }
  }
}

async function loadOfficialDataLive() {
  const date = els.tradeDate.value || getTaipeiDate();
  const dateToken = date.replaceAll("-", "");
  setStatus("正在讀取證交所公開資料...");

  try {
    const [twseMarket, tpexMarket, twseValuation, tpexValuation, yearChanges, monthlyRevenue, quarterRevenue] = await Promise.all([
      fetchTwseMarket(dateToken),
      fetchTpexMarket(dateToken),
      fetchTwseValuation(),
      fetchTpexValuation(),
      fetchYearChange(dateToken),
      fetchMonthlyRevenue(),
      fetchQuarterRevenue()
    ]);
    const market = [...twseMarket, ...tpexMarket];
    const valuation = [...twseValuation, ...tpexValuation];
    const merged = mergeOfficialData(market, valuation, yearChanges, monthlyRevenue, quarterRevenue);
    if (!merged.length) throw new Error("查無可用資料，請改用前一個交易日。");
    state.stocks = merged;
    state.watchlistOnly = false;
    els.showWatchlist.textContent = "觀察清單";
    populateSectors();
    applyFilters();
    setStatus(`已更新 ${date} 上市、上櫃、ETF 資料，含近一年漲幅、月營收與季營收，共 ${merged.length} 檔。`);
  } catch (error) {
    setStatus(`官方資料讀取失敗：${error.message} 目前保留既有資料。`);
  }
}

async function fetchTwseMarket(dateToken) {
  const url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date=${dateToken}&response=json`;
  const data = await fetchJson(url);
  const table = findTable(data, ["證券代號", "收盤價"]);
  return table.rows.map((row) => mapMarketRow(table.fields, row)).filter(Boolean);
}

async function fetchTwseValuation() {
  const url = "https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_d";
  const data = await fetchJson(url);
  if (Array.isArray(data)) return data.map(mapOpenApiValuationRow).filter(Boolean);
  const table = findTable(data, ["證券代號", "殖利率", "本益比"]);
  return table.rows.map((row) => mapValuationRow(table.fields, row)).filter(Boolean);
}

async function fetchTpexMarket(dateToken) {
  const rocDate = toRocDate(dateToken);
  const url = `https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&se=EW&o=json&d=${encodeURIComponent(rocDate)}`;
  const data = await fetchJson(url);
  const table = findTable(data, ["代號", "收盤"]);
  return table.rows.map((row) => mapTpexMarketRow(table.fields, row)).filter(Boolean);
}

async function fetchTpexValuation() {
  const data = await fetchJson("https://www.tpex.org.tw/openapi/v1/tpex_mainboard_peratio_analysis");
  if (!Array.isArray(data)) throw new Error("上櫃本益比資料格式與預期不同。");
  return data.map((row) => {
    const symbol = stripHtml(row.SecuritiesCompanyCode);
    if (!isSecurityCode(symbol)) return null;
    return {
      symbol,
      yield: toNumber(row.YieldRatio),
      pe: toNumber(row.PriceEarningRatio),
      pb: toNumber(row.PriceBookRatio)
    };
  }).filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function findTable(payload, requiredLabels) {
  const candidates = [];
  if (Array.isArray(payload.tables)) {
    payload.tables.forEach((table) => {
      if (Array.isArray(table.fields) && Array.isArray(table.data)) {
        candidates.push({ fields: table.fields, rows: table.data });
      }
    });
  }
  Object.keys(payload).forEach((key) => {
    if (key.startsWith("fields")) {
      const suffix = key.replace("fields", "");
      const rows = payload[`data${suffix}`] || payload.data;
      if (Array.isArray(payload[key]) && Array.isArray(rows)) {
        candidates.push({ fields: payload[key], rows });
      }
    }
  });
  if (Array.isArray(payload.fields) && Array.isArray(payload.data)) {
    candidates.push({ fields: payload.fields, rows: payload.data });
  }
  const table = candidates.find((candidate) =>
    requiredLabels.every((label) => candidate.fields.some((field) => String(field).includes(label)))
  );
  if (!table) throw new Error("官方回傳格式與預期不同。");
  return table;
}

function mapMarketRow(fields, row) {
  const symbol = valueByLabel(fields, row, "證券代號");
  const name = valueByLabel(fields, row, "證券名稱");
  if (!isSecurityCode(symbol)) return null;
  const volumeShares = toNumber(valueByLabel(fields, row, "成交股數"));
  const sign = String(valueByLabel(fields, row, "漲跌(+/-)") || "");
  const change = toNumber(valueByLabel(fields, row, "漲跌價差"));
  const price = toNumber(valueByLabel(fields, row, "收盤價"));
  const signedChange = sign.includes("-") ? -change : change;
  const changePct = price && change !== null ? (signedChange / (price - signedChange)) * 100 : null;
  return {
    symbol,
    name,
    market: "上市",
    productType: classifyProduct(symbol, name),
    sector: guessSector(symbol, name),
    price,
    changePct,
    volume: volumeShares === null ? null : Math.round(volumeShares / 1000),
    yield: null,
    pe: null,
    pb: null,
    yearChangePct: null,
    monthlyRevenue: null,
    monthlyRevenueYoY: null,
    monthlyRevenueMoM: null,
    quarterRevenue: null,
    operatingMargin: null
  };
}

function mapTpexMarketRow(fields, row) {
  const symbol = valueByLabel(fields, row, "代號");
  const name = valueByLabel(fields, row, "名稱");
  if (!isSecurityCode(symbol)) return null;
  const price = toNumber(valueByLabel(fields, row, "收盤"));
  const change = toNumber(valueByLabel(fields, row, "漲跌"));
  const volumeShares = toNumber(valueByLabel(fields, row, "成交股數"));
  const changePct = price && change !== null ? (change / (price - change)) * 100 : null;
  return {
    symbol,
    name,
    market: "上櫃",
    productType: classifyProduct(symbol, name),
    sector: guessSector(symbol, name),
    price,
    changePct,
    volume: volumeShares === null ? null : Math.round(volumeShares / 1000),
    yield: null,
    pe: null,
    pb: null,
    yearChangePct: null,
    monthlyRevenue: null,
    monthlyRevenueYoY: null,
    monthlyRevenueMoM: null,
    quarterRevenue: null,
    operatingMargin: null
  };
}

function mapValuationRow(fields, row) {
  const symbol = valueByLabel(fields, row, "證券代號");
  if (!isSecurityCode(symbol)) return null;
  return {
    symbol,
    yield: toNumber(valueByLabel(fields, row, "殖利率")),
    pe: toNumber(valueByLabel(fields, row, "本益比")),
    pb: toNumber(valueByLabel(fields, row, "股價淨值比"))
  };
}

function mapOpenApiValuationRow(row) {
  const symbol = stripHtml(row.Code);
  if (!isSecurityCode(symbol)) return null;
  return {
    symbol,
    yield: toNumber(row.DividendYield),
    pe: toNumber(row.PEratio),
    pb: toNumber(row.PBratio)
  };
}

async function fetchYearChange(dateToken) {
  const baseDateToken = shiftYearToken(dateToken, -1);
  const [currentRows, baseRows] = await Promise.all([
    fetchAllDailyPrices(dateToken),
    fetchAllDailyPrices(baseDateToken)
  ]);
  const baseMap = new Map(baseRows.map((row) => [row.symbol, row.price]));
  return currentRows.map((row) => {
    const basePrice = baseMap.get(row.symbol);
    const yearChangePct = row.price && basePrice ? ((row.price - basePrice) / basePrice) * 100 : null;
    return { symbol: row.symbol, yearChangePct };
  });
}

async function fetchAllDailyPrices(dateToken) {
  const [twseRows, tpexRows] = await Promise.all([
    fetchTwseDailyPrices(dateToken),
    fetchTpexDailyPrices(dateToken)
  ]);
  return [...twseRows, ...tpexRows];
}

async function fetchTwseDailyPrices(dateToken) {
  const url = `https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date=${dateToken}&response=json`;
  const data = await fetchJson(url);
  const table = findTable(data, ["證券代號", "收盤價"]);
  return table.rows.map((row) => ({
    symbol: valueByLabel(table.fields, row, "證券代號"),
    price: toNumber(valueByLabel(table.fields, row, "收盤價"))
  })).filter((row) => isSecurityCode(row.symbol));
}

async function fetchTpexDailyPrices(dateToken) {
  const rocDate = toRocDate(dateToken);
  const url = `https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&se=EW&o=json&d=${encodeURIComponent(rocDate)}`;
  const data = await fetchJson(url);
  const table = findTable(data, ["代號", "收盤"]);
  return table.rows.map((row) => ({
    symbol: valueByLabel(table.fields, row, "代號"),
    price: toNumber(valueByLabel(table.fields, row, "收盤"))
  })).filter((row) => isSecurityCode(row.symbol));
}

async function fetchMonthlyRevenue() {
  const [twseData, tpexData] = await Promise.all([
    fetchJson("https://openapi.twse.com.tw/v1/opendata/t187ap05_L"),
    fetchJson("https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap05_O")
  ]);
  if (!Array.isArray(twseData) || !Array.isArray(tpexData)) throw new Error("月營收資料格式與預期不同。");
  return [...twseData, ...tpexData].map((row) => ({
    symbol: stripHtml(row["公司代號"]),
    monthlyRevenuePeriod: stripHtml(row["資料年月"]),
    monthlyRevenue: toNumber(row["營業收入-當月營收"]),
    monthlyRevenueMoM: toNumber(row["營業收入-上月比較增減(%)"]),
    monthlyRevenueYoY: toNumber(row["營業收入-去年同月增減(%)"]),
    cumulativeRevenue: toNumber(row["累計營業收入-當月累計營收"]),
    cumulativeRevenueYoY: toNumber(row["累計營業收入-前期比較增減(%)"])
  })).filter((row) => isSecurityCode(row.symbol));
}

async function fetchQuarterRevenue() {
  const [twseData, tpexData] = await Promise.all([
    fetchJson("https://openapi.twse.com.tw/v1/opendata/t187ap17_L"),
    fetchJson("https://www.tpex.org.tw/openapi/v1/mopsfin_187ap17_O")
  ]);
  if (!Array.isArray(twseData) || !Array.isArray(tpexData)) throw new Error("季營收資料格式與預期不同。");
  return [
    ...twseData.map(mapTwseQuarterRevenueRow),
    ...tpexData.map(mapTpexQuarterRevenueRow)
  ].filter((row) => row && isSecurityCode(row.symbol));
}

function mapTwseQuarterRevenueRow(row) {
  return {
    symbol: stripHtml(row["公司代號"]),
    quarterRevenuePeriod: `${stripHtml(row["年度"])}Q${stripHtml(row["季別"])}`,
    quarterRevenue: toNumber(row["營業收入(百萬元)"]),
    grossMargin: toNumber(row["毛利率(%)(營業毛利)/(營業收入)"]),
    operatingMargin: toNumber(row["營業利益率(%)(營業利益)/(營業收入)"]),
    pretaxMargin: toNumber(row["稅前純益率(%)(稅前純益)/(營業收入)"]),
    netMargin: toNumber(row["稅後純益率(%)(稅後純益)/(營業收入)"])
  };
}

function mapTpexQuarterRevenueRow(row) {
  return {
    symbol: stripHtml(row.SecuritiesCompanyCode),
    quarterRevenuePeriod: `${stripHtml(row.Year)}Q${stripHtml(row["季別"])}`,
    quarterRevenue: toNumber(row["營業收入百萬元"]),
    grossMargin: toNumber(row["毛利率"]),
    operatingMargin: toNumber(row["營業利益率"]),
    pretaxMargin: toNumber(row["稅前純益率"]),
    netMargin: toNumber(row["稅後純益率"])
  };
}

function mergeOfficialData(marketRows, valuationRows, yearChangeRows, monthlyRevenueRows, quarterRevenueRows) {
  const valuationMap = new Map(valuationRows.map((row) => [row.symbol, row]));
  const yearChangeMap = new Map(yearChangeRows.map((row) => [row.symbol, row]));
  const monthlyRevenueMap = new Map(monthlyRevenueRows.map((row) => [row.symbol, row]));
  const quarterRevenueMap = new Map(quarterRevenueRows.map((row) => [row.symbol, row]));
  return marketRows.map((stock) => ({
    ...stock,
    ...valuationMap.get(stock.symbol),
    ...yearChangeMap.get(stock.symbol),
    ...monthlyRevenueMap.get(stock.symbol),
    ...quarterRevenueMap.get(stock.symbol)
  }));
}

function valueByLabel(fields, row, label) {
  const index = fields.findIndex((field) => String(field).includes(label));
  return index >= 0 ? stripHtml(row[index]) : "";
}

function stripHtml(value) {
  const text = String(value ?? "").replace(/<[^>]*>/g, "").trim();
  return text.replace(/\s+/g, " ");
}

function toNumber(value) {
  const text = stripHtml(value).replace(/,/g, "").replace("%", "");
  if (!text || text === "--" || text === "-") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function isSecurityCode(symbol) {
  return /^[0-9A-Z]{4,7}$/.test(stripHtml(symbol));
}

function classifyProduct(symbol, name) {
  const code = stripHtml(symbol);
  const title = stripHtml(name).toUpperCase();
  if (/^00/.test(code) || /ETF|ETN|指數|債|期貨|高息|美債|富櫃50|台灣50|中型100/i.test(title)) {
    if (title.includes("ETN")) return "ETN";
    if (title.includes("債") || code.endsWith("B")) return "ETF/債券ETF";
    return "ETF";
  }
  if (code.endsWith("A") && !/^00/.test(code)) return "特別股";
  return "股票";
}

function guessSector(symbol, name) {
  const code = Number(symbol);
  const productType = classifyProduct(symbol, name);
  if (productType.includes("ETF") || productType === "ETN") return "ETF";
  if (symbol.startsWith("28") || name.includes("金")) return "金融保險";
  if (symbol.startsWith("23") || symbol.startsWith("24") || name.includes("電") || name.includes("半導體")) return "電子";
  if (symbol.startsWith("12")) return "食品";
  if (symbol.startsWith("13")) return "塑膠";
  if (symbol.startsWith("14")) return "紡織";
  if (symbol.startsWith("15")) return "電機機械";
  if (symbol.startsWith("17")) return "化學生技";
  if (symbol.startsWith("20")) return "鋼鐵";
  if (symbol.startsWith("26")) return "航運";
  if (code >= 9900) return "其他";
  return "未分類";
}

function populateSectors() {
  const current = els.sector.value;
  const sectors = [...new Set(state.stocks.map((stock) => stock.sector || "未分類"))].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  els.sector.innerHTML = '<option value="all">全部產業</option>';
  const marketOptions = [
    ["market:上市", "上市"],
    ["market:上櫃", "上櫃"],
    ["type:ETF", "ETF/ETN"]
  ];
  marketOptions.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    els.sector.appendChild(option);
  });
  sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    els.sector.appendChild(option);
  });
  els.sector.value = sectors.includes(current) || marketOptions.some(([value]) => value === current) ? current : "all";
}

function applyStrategy() {
  const strategy = els.strategy.value;
  if (strategy === "value") {
    els.minYield.value = 2;
    els.maxPe.value = 15;
    els.maxPb.value = 1.8;
    els.minVolume.value = 3000;
    els.minYearChange.value = -50;
    els.minMonthlyRevenueYoY.value = -50;
    els.minQuarterRevenue.value = 0;
  } else if (strategy === "dividend") {
    els.minYield.value = 4;
    els.maxPe.value = 35;
    els.maxPb.value = 5;
    els.minVolume.value = 2000;
    els.minYearChange.value = -50;
    els.minMonthlyRevenueYoY.value = -50;
    els.minQuarterRevenue.value = 0;
  } else if (strategy === "momentum") {
    els.minYield.value = 0;
    els.maxPe.value = 60;
    els.maxPb.value = 8;
    els.minVolume.value = 20000;
    els.minYearChange.value = 10;
    els.minMonthlyRevenueYoY.value = -50;
    els.minQuarterRevenue.value = 0;
  } else if (strategy === "growth") {
    els.minYield.value = 0;
    els.maxPe.value = 60;
    els.maxPb.value = 8;
    els.minVolume.value = 5000;
    els.minYearChange.value = 20;
    els.minMonthlyRevenueYoY.value = 10;
    els.minQuarterRevenue.value = 50000;
  } else if (strategy === "balanced") {
    els.minYield.value = 2.5;
    els.maxPe.value = 22;
    els.maxPb.value = 3;
    els.minVolume.value = 5000;
    els.minYearChange.value = 0;
    els.minMonthlyRevenueYoY.value = 0;
    els.minQuarterRevenue.value = 10000;
  }
  applyFilters();
}

function resetFilters() {
  els.keyword.value = "";
  els.sector.value = "all";
  els.strategy.value = "custom";
  els.minYield.value = 0;
  els.maxPe.value = 60;
  els.maxPb.value = 8;
  els.minVolume.value = 0;
  els.minYearChange.value = -50;
  els.minMonthlyRevenueYoY.value = -50;
  els.minQuarterRevenue.value = 0;
  els.minPrice.value = "";
  els.maxPrice.value = "";
  els.onlyComplete.checked = false;
  state.watchlistOnly = false;
  els.showWatchlist.textContent = "觀察清單";
  applyFilters();
}

function applyFilters() {
  updateRangeLabels();
  const keyword = els.keyword.value.trim().toLowerCase();
  const sector = els.sector.value;
  const minYield = Number(els.minYield.value);
  const maxPe = Number(els.maxPe.value);
  const maxPb = Number(els.maxPb.value);
  const minVolume = Number(els.minVolume.value);
  const minYearChange = Number(els.minYearChange.value);
  const minMonthlyRevenueYoY = Number(els.minMonthlyRevenueYoY.value);
  const minQuarterRevenue = Number(els.minQuarterRevenue.value);
  const minPrice = els.minPrice.value === "" ? null : Number(els.minPrice.value);
  const maxPrice = els.maxPrice.value === "" ? null : Number(els.maxPrice.value);

  state.filtered = state.stocks
    .map((stock) => ({ ...stock, score: scoreStock(stock) }))
    .filter((stock) => {
      const complete = stock.price !== null && stock.yield !== null && stock.pe !== null && stock.pb !== null;
      if (state.watchlistOnly && !state.watchlist.has(stock.symbol)) return false;
      if (keyword && !`${stock.symbol} ${stock.name}`.toLowerCase().includes(keyword)) return false;
      if (sector === "market:上市" && stock.market !== "上市") return false;
      if (sector === "market:上櫃" && stock.market !== "上櫃") return false;
      if (sector === "type:ETF" && !String(stock.productType || "").includes("ETF") && stock.productType !== "ETN") return false;
      if (!sector.includes(":") && sector !== "all" && stock.sector !== sector) return false;
      if (els.onlyComplete.checked && !complete) return false;
      if (stock.yield !== null && stock.yield < minYield) return false;
      if (stock.pe !== null && stock.pe > maxPe) return false;
      if (stock.pb !== null && stock.pb > maxPb) return false;
      if (stock.volume !== null && stock.volume < minVolume) return false;
      if (minYearChange > -50 && (!isMetric(stock.yearChangePct) || stock.yearChangePct < minYearChange)) return false;
      if (minMonthlyRevenueYoY > -50 && (!isMetric(stock.monthlyRevenueYoY) || stock.monthlyRevenueYoY < minMonthlyRevenueYoY)) return false;
      if (minQuarterRevenue > 0 && (!isMetric(stock.quarterRevenue) || stock.quarterRevenue < minQuarterRevenue)) return false;
      if (minPrice !== null && stock.price !== null && stock.price < minPrice) return false;
      if (maxPrice !== null && stock.price !== null && stock.price > maxPrice) return false;
      return true;
    });

  render();
}

function updateRangeLabels() {
  els.minYieldValue.textContent = `${Number(els.minYield.value).toFixed(1)}%`;
  els.maxPeValue.textContent = els.maxPe.value;
  els.maxPbValue.textContent = Number(els.maxPb.value).toFixed(1);
  els.minVolumeValue.textContent = `${Number(els.minVolume.value).toLocaleString("zh-TW")} 張`;
  els.minYearChangeValue.textContent = Number(els.minYearChange.value) <= -50 ? "不限" : `${Number(els.minYearChange.value).toFixed(0)}%`;
  els.minMonthlyRevenueYoYValue.textContent = Number(els.minMonthlyRevenueYoY.value) <= -50 ? "不限" : `${Number(els.minMonthlyRevenueYoY.value).toFixed(0)}%`;
  els.minQuarterRevenueValue.textContent = Number(els.minQuarterRevenue.value) === 0 ? "不限" : `${Number(els.minQuarterRevenue.value).toLocaleString("zh-TW")} 百萬元`;
}

function scoreStock(stock) {
  const yieldScore = isMetric(stock.yield) ? Math.min(stock.yield / 6, 1) * 35 : 0;
  const peScore = isMetric(stock.pe) ? Math.max(0, (30 - stock.pe) / 30) * 25 : 0;
  const pbScore = isMetric(stock.pb) ? Math.max(0, (4 - stock.pb) / 4) * 20 : 0;
  const volumeScore = isMetric(stock.volume) ? Math.min(stock.volume / 50000, 1) * 10 : 0;
  const momentumScore = isMetric(stock.changePct) ? Math.max(-5, Math.min(stock.changePct, 5)) + 5 : 0;
  const yearScore = isMetric(stock.yearChangePct) ? Math.max(0, Math.min(stock.yearChangePct, 100)) / 100 * 15 : 0;
  const revenueScore = isMetric(stock.monthlyRevenueYoY) ? Math.max(0, Math.min(stock.monthlyRevenueYoY, 80)) / 80 * 15 : 0;
  return Math.round(yieldScore + peScore + pbScore + volumeScore + momentumScore + yearScore + revenueScore);
}

function isMetric(value) {
  return Number.isFinite(value);
}

function render() {
  const sorted = [...state.filtered].sort((a, b) => compareStocks(a, b, state.sortKey, state.sortDir));
  els.resultCount.textContent = sorted.length.toLocaleString("zh-TW");
  renderStats(sorted);
  renderRows(sorted);
}

function compareStocks(a, b, key, dir) {
  const left = a[key];
  const right = b[key];
  const order = dir === "asc" ? 1 : -1;
  if (typeof left === "string" || typeof right === "string") {
    return String(left ?? "").localeCompare(String(right ?? ""), "zh-Hant") * order;
  }
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return (left - right) * order;
}

function renderStats(rows) {
  els.avgYield.textContent = formatAverage(rows, "yield", "%");
  els.avgPe.textContent = formatAverage(rows, "pe", "");
  els.avgVolume.textContent = formatAverage(rows, "volume", " 張", 0);
  els.avgYearChange.textContent = formatAverage(rows, "yearChangePct", "%");
  els.avgMonthlyRevenueYoY.textContent = formatAverage(rows, "monthlyRevenueYoY", "%");
  els.avgQuarterRevenue.textContent = formatAverage(rows, "quarterRevenue", " 百萬元", 0);
}

function formatAverage(rows, key, suffix, digits = 2) {
  const values = rows.map((row) => row[key]).filter((value) => value !== null && Number.isFinite(value));
  if (!values.length) return "-";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return `${average.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: digits })}${suffix}`;
}

function renderRows(rows) {
  els.stockRows.innerHTML = "";
  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td class="empty-row" colspan="18">沒有符合條件的股票，請放寬篩選條件。</td>';
    els.stockRows.appendChild(tr);
    return;
  }

  rows.forEach((stock) => {
    const tr = document.createElement("tr");
    const changeClass = stock.changePct > 0 ? "up" : stock.changePct < 0 ? "down" : "";
    const yearChangeClass = stock.yearChangePct > 0 ? "up" : stock.yearChangePct < 0 ? "down" : "";
    const monthlyRevenueClass = stock.monthlyRevenueYoY > 0 ? "up" : stock.monthlyRevenueYoY < 0 ? "down" : "";
    const watched = state.watchlist.has(stock.symbol);
    tr.innerHTML = `
      <td class="symbol">${stock.symbol}</td>
      <td>${stock.name || "-"}</td>
      <td>${stock.market || "-"}</td>
      <td>${stock.productType || "-"}</td>
      <td><span class="pill">${stock.sector || "未分類"}</span></td>
      <td>${formatNumber(stock.price, 2)}</td>
      <td class="${changeClass}">${formatPercent(stock.changePct)}</td>
      <td>${formatNumber(stock.volume, 0)}</td>
      <td>${formatPercent(stock.yield)}</td>
      <td>${formatNumber(stock.pe, 2)}</td>
      <td>${formatNumber(stock.pb, 2)}</td>
      <td class="${yearChangeClass}">${formatPercent(stock.yearChangePct)}</td>
      <td class="${monthlyRevenueClass}">${formatPercent(stock.monthlyRevenueYoY)}</td>
      <td>${formatRevenue(stock.monthlyRevenue)}</td>
      <td>${formatRevenue(stock.quarterRevenue, "百萬元")}</td>
      <td>${formatPercent(stock.operatingMargin)}</td>
      <td class="score">${stock.score}</td>
      <td><button class="star ${watched ? "active" : ""}" data-symbol="${stock.symbol}" title="加入觀察清單">${watched ? "★" : "☆"}</button></td>
    `;
    els.stockRows.appendChild(tr);
  });

  els.stockRows.querySelectorAll(".star").forEach((button) => {
    button.addEventListener("click", () => toggleWatchlist(button.dataset.symbol));
  });
}

function formatNumber(value, digits = 2) {
  if (value === null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("zh-TW", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value > 0 ? "+" : ""}${value.toLocaleString("zh-TW", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`;
}

function formatRevenue(value, unit = "仟元") {
  if (value === null || !Number.isFinite(value)) return "-";
  if (unit === "百萬元") {
    return `${value.toLocaleString("zh-TW", { maximumFractionDigits: 0 })} 百萬元`;
  }
  const million = value / 1000;
  return `${million.toLocaleString("zh-TW", { maximumFractionDigits: 0 })} 百萬元`;
}

function toggleWatchlist(symbol) {
  if (state.watchlist.has(symbol)) {
    state.watchlist.delete(symbol);
  } else {
    state.watchlist.add(symbol);
  }
  localStorage.setItem("twStockWatchlist", JSON.stringify([...state.watchlist]));
  render();
}

function importCsv(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = parseCsv(String(reader.result));
    if (!imported.length) {
      setStatus("CSV 沒有讀到可用股票資料。");
      return;
    }
    state.stocks = imported;
    populateSectors();
    applyFilters();
    setStatus(`已匯入 CSV，共 ${imported.length} 檔。`);
  };
  reader.readAsText(file, "utf-8");
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const stock = {
      symbol: readCsv(headers, cells, ["代號", "證券代號", "symbol"]),
      name: readCsv(headers, cells, ["名稱", "證券名稱", "name"]),
      market: readCsv(headers, cells, ["市場", "market"]) || "自訂",
      productType: readCsv(headers, cells, ["類型", "productType"]) || "股票",
      sector: readCsv(headers, cells, ["產業", "sector"]) || "未分類",
      price: toNumber(readCsv(headers, cells, ["價格", "收盤價", "price"])),
      changePct: toNumber(readCsv(headers, cells, ["漲跌幅", "changePct"])),
      volume: toNumber(readCsv(headers, cells, ["成交量", "volume"])),
      yield: toNumber(readCsv(headers, cells, ["殖利率", "yield"])),
      pe: toNumber(readCsv(headers, cells, ["本益比", "pe"])),
      pb: toNumber(readCsv(headers, cells, ["股價淨值比", "pb"])),
      yearChangePct: toNumber(readCsv(headers, cells, ["近一年漲幅", "yearChangePct"])),
      monthlyRevenueYoY: toNumber(readCsv(headers, cells, ["月營收年增率", "月營收年增", "monthlyRevenueYoY"])),
      monthlyRevenueMoM: toNumber(readCsv(headers, cells, ["月營收月增率", "monthlyRevenueMoM"])),
      monthlyRevenue: toNumber(readCsv(headers, cells, ["月營收", "monthlyRevenue"])),
      quarterRevenue: toNumber(readCsv(headers, cells, ["季營收", "quarterRevenue"])),
      operatingMargin: toNumber(readCsv(headers, cells, ["營益率", "operatingMargin"]))
    };
    return stock.symbol ? stock : null;
  }).filter(Boolean);
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function readCsv(headers, cells, labels) {
  const index = headers.findIndex((header) => labels.some((label) => header.toLowerCase().includes(label.toLowerCase())));
  return index >= 0 ? cells[index] : "";
}

function exportCsv() {
  const rows = [["代號", "名稱", "市場", "類型", "產業", "價格", "漲跌幅", "成交量", "殖利率", "本益比", "股價淨值比", "近一年漲幅", "月營收年增率", "月營收月增率", "月營收", "季營收", "營益率", "分數"]];
  state.filtered.forEach((stock) => {
    rows.push([stock.symbol, stock.name, stock.market, stock.productType, stock.sector, stock.price, stock.changePct, stock.volume, stock.yield, stock.pe, stock.pb, stock.yearChangePct, stock.monthlyRevenueYoY, stock.monthlyRevenueMoM, stock.monthlyRevenue, stock.quarterRevenue, stock.operatingMargin, stock.score]);
  });
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `taiwan-stock-screener-${getTaipeiDate()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function setStatus(message) {
  els.dataStatus.textContent = message;
}

init();
