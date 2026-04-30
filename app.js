const sampleStocks = [
  { symbol: "2330", name: "台積電", sector: "半導體", price: 820, changePct: 1.74, volume: 36120, yield: 1.42, pe: 22.6, pb: 5.4 },
  { symbol: "2317", name: "鴻海", sector: "電子代工", price: 148.5, changePct: -0.67, volume: 81250, yield: 3.45, pe: 14.1, pb: 1.38 },
  { symbol: "2454", name: "聯發科", sector: "IC 設計", price: 1025, changePct: 0.49, volume: 7900, yield: 5.91, pe: 18.4, pb: 3.25 },
  { symbol: "2412", name: "中華電", sector: "電信", price: 126, changePct: 0.0, volume: 12100, yield: 3.79, pe: 25.2, pb: 2.55 },
  { symbol: "2881", name: "富邦金", sector: "金融保險", price: 76.4, changePct: 0.93, volume: 23800, yield: 4.58, pe: 12.8, pb: 1.31 },
  { symbol: "2882", name: "國泰金", sector: "金融保險", price: 61.2, changePct: -0.16, volume: 31200, yield: 4.08, pe: 11.9, pb: 1.12 },
  { symbol: "1301", name: "台塑", sector: "塑膠", price: 68.8, changePct: -1.01, volume: 11600, yield: 3.92, pe: 19.8, pb: 1.07 },
  { symbol: "2002", name: "中鋼", sector: "鋼鐵", price: 24.15, changePct: 0.42, volume: 42800, yield: 2.48, pe: 28.5, pb: 0.91 },
  { symbol: "2303", name: "聯電", sector: "半導體", price: 51.3, changePct: 1.18, volume: 65800, yield: 6.05, pe: 10.6, pb: 1.82 },
  { symbol: "1216", name: "統一", sector: "食品", price: 83.2, changePct: 0.36, volume: 9500, yield: 3.79, pe: 21.4, pb: 3.1 },
  { symbol: "5871", name: "中租-KY", sector: "其他金融", price: 162.5, changePct: -1.22, volume: 6800, yield: 3.88, pe: 11.1, pb: 1.72 },
  { symbol: "2603", name: "長榮", sector: "航運", price: 188, changePct: 2.17, volume: 54500, yield: 5.32, pe: 8.9, pb: 1.46 }
];

const state = {
  stocks: [...sampleStocks],
  filtered: [],
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
  minPrice: document.querySelector("#minPrice"),
  maxPrice: document.querySelector("#maxPrice"),
  onlyComplete: document.querySelector("#onlyComplete"),
  csvFile: document.querySelector("#csvFile"),
  exportCsv: document.querySelector("#exportCsv"),
  showWatchlist: document.querySelector("#showWatchlist"),
  resultCount: document.querySelector("#resultCount"),
  avgYield: document.querySelector("#avgYield"),
  avgPe: document.querySelector("#avgPe"),
  avgVolume: document.querySelector("#avgVolume"),
  stockRows: document.querySelector("#stockRows"),
  minYieldValue: document.querySelector("#minYieldValue"),
  maxPeValue: document.querySelector("#maxPeValue"),
  maxPbValue: document.querySelector("#maxPbValue"),
  minVolumeValue: document.querySelector("#minVolumeValue")
};

function init() {
  els.tradeDate.value = getTaipeiDate();
  bindEvents();
  populateSectors();
  applyFilters();
}

function bindEvents() {
  [
    els.keyword,
    els.sector,
    els.minYield,
    els.maxPe,
    els.maxPb,
    els.minVolume,
    els.minPrice,
    els.maxPrice,
    els.onlyComplete
  ].forEach((el) => el.addEventListener("input", applyFilters));

  els.strategy.addEventListener("change", applyStrategy);
  els.resetFilters.addEventListener("click", resetFilters);
  els.loadOfficial.addEventListener("click", loadOfficialData);
  els.csvFile.addEventListener("change", importCsv);
  els.exportCsv.addEventListener("click", exportCsv);
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

async function loadOfficialData() {
  const date = els.tradeDate.value || getTaipeiDate();
  const dateToken = date.replaceAll("-", "");
  setStatus("正在讀取證交所公開資料...");

  try {
    const [market, valuation] = await Promise.all([
      fetchTwseMarket(dateToken),
      fetchTwseValuation(dateToken)
    ]);
    const merged = mergeOfficialData(market, valuation);
    if (!merged.length) throw new Error("查無可用資料，請改用前一個交易日。");
    state.stocks = merged;
    state.watchlistOnly = false;
    els.showWatchlist.textContent = "觀察清單";
    populateSectors();
    applyFilters();
    setStatus(`已更新 ${date} 證交所上市股票資料，共 ${merged.length} 檔。`);
  } catch (error) {
    setStatus(`官方資料讀取失敗：${error.message} 目前保留既有資料。`);
  }
}

async function fetchTwseMarket(dateToken) {
  const url = `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date=${dateToken}&type=ALLBUT0999&response=json`;
  const data = await fetchJson(url);
  const table = findTable(data, ["證券代號", "成交股數", "收盤價"]);
  return table.rows.map((row) => mapMarketRow(table.fields, row)).filter(Boolean);
}

async function fetchTwseValuation(dateToken) {
  const url = `https://www.twse.com.tw/rwd/zh/afterTrading/BWIBBU_d?date=${dateToken}&selectType=ALL&response=json`;
  const data = await fetchJson(url);
  const table = findTable(data, ["證券代號", "殖利率", "本益比"]);
  return table.rows.map((row) => mapValuationRow(table.fields, row)).filter(Boolean);
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function findTable(payload, requiredLabels) {
  const candidates = [];
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
  if (!/^\d{4}$/.test(symbol)) return null;
  const volumeShares = toNumber(valueByLabel(fields, row, "成交股數"));
  const sign = String(valueByLabel(fields, row, "漲跌(+/-)") || "");
  const change = toNumber(valueByLabel(fields, row, "漲跌價差"));
  const price = toNumber(valueByLabel(fields, row, "收盤價"));
  const changePct = price && change !== null ? ((sign.includes("-") ? -change : change) / (price - (sign.includes("-") ? -change : change))) * 100 : null;
  return {
    symbol,
    name,
    sector: guessSector(symbol, name),
    price,
    changePct,
    volume: volumeShares === null ? null : Math.round(volumeShares / 1000),
    yield: null,
    pe: null,
    pb: null
  };
}

function mapValuationRow(fields, row) {
  const symbol = valueByLabel(fields, row, "證券代號");
  if (!/^\d{4}$/.test(symbol)) return null;
  return {
    symbol,
    yield: toNumber(valueByLabel(fields, row, "殖利率")),
    pe: toNumber(valueByLabel(fields, row, "本益比")),
    pb: toNumber(valueByLabel(fields, row, "股價淨值比"))
  };
}

function mergeOfficialData(marketRows, valuationRows) {
  const valuationMap = new Map(valuationRows.map((row) => [row.symbol, row]));
  return marketRows.map((stock) => ({ ...stock, ...valuationMap.get(stock.symbol) }));
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

function guessSector(symbol, name) {
  const code = Number(symbol);
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
  sectors.forEach((sector) => {
    const option = document.createElement("option");
    option.value = sector;
    option.textContent = sector;
    els.sector.appendChild(option);
  });
  els.sector.value = sectors.includes(current) ? current : "all";
}

function applyStrategy() {
  const strategy = els.strategy.value;
  if (strategy === "value") {
    els.minYield.value = 2;
    els.maxPe.value = 15;
    els.maxPb.value = 1.8;
    els.minVolume.value = 3000;
  } else if (strategy === "dividend") {
    els.minYield.value = 4;
    els.maxPe.value = 35;
    els.maxPb.value = 5;
    els.minVolume.value = 2000;
  } else if (strategy === "momentum") {
    els.minYield.value = 0;
    els.maxPe.value = 60;
    els.maxPb.value = 8;
    els.minVolume.value = 20000;
  } else if (strategy === "balanced") {
    els.minYield.value = 2.5;
    els.maxPe.value = 22;
    els.maxPb.value = 3;
    els.minVolume.value = 5000;
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
  const minPrice = els.minPrice.value === "" ? null : Number(els.minPrice.value);
  const maxPrice = els.maxPrice.value === "" ? null : Number(els.maxPrice.value);

  state.filtered = state.stocks
    .map((stock) => ({ ...stock, score: scoreStock(stock) }))
    .filter((stock) => {
      const complete = stock.price !== null && stock.yield !== null && stock.pe !== null && stock.pb !== null;
      if (state.watchlistOnly && !state.watchlist.has(stock.symbol)) return false;
      if (keyword && !`${stock.symbol} ${stock.name}`.toLowerCase().includes(keyword)) return false;
      if (sector !== "all" && stock.sector !== sector) return false;
      if (els.onlyComplete.checked && !complete) return false;
      if (stock.yield !== null && stock.yield < minYield) return false;
      if (stock.pe !== null && stock.pe > maxPe) return false;
      if (stock.pb !== null && stock.pb > maxPb) return false;
      if (stock.volume !== null && stock.volume < minVolume) return false;
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
}

function scoreStock(stock) {
  const yieldScore = stock.yield === null ? 0 : Math.min(stock.yield / 6, 1) * 35;
  const peScore = stock.pe === null ? 0 : Math.max(0, (30 - stock.pe) / 30) * 25;
  const pbScore = stock.pb === null ? 0 : Math.max(0, (4 - stock.pb) / 4) * 20;
  const volumeScore = stock.volume === null ? 0 : Math.min(stock.volume / 50000, 1) * 10;
  const momentumScore = stock.changePct === null ? 0 : Math.max(-5, Math.min(stock.changePct, 5)) + 5;
  return Math.round(yieldScore + peScore + pbScore + volumeScore + momentumScore);
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
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return (left - right) * order;
}

function renderStats(rows) {
  els.avgYield.textContent = formatAverage(rows, "yield", "%");
  els.avgPe.textContent = formatAverage(rows, "pe", "");
  els.avgVolume.textContent = formatAverage(rows, "volume", " 張", 0);
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
    tr.innerHTML = '<td class="empty-row" colspan="11">沒有符合條件的股票，請放寬篩選條件。</td>';
    els.stockRows.appendChild(tr);
    return;
  }

  rows.forEach((stock) => {
    const tr = document.createElement("tr");
    const changeClass = stock.changePct > 0 ? "up" : stock.changePct < 0 ? "down" : "";
    const watched = state.watchlist.has(stock.symbol);
    tr.innerHTML = `
      <td class="symbol">${stock.symbol}</td>
      <td>${stock.name || "-"}</td>
      <td><span class="pill">${stock.sector || "未分類"}</span></td>
      <td>${formatNumber(stock.price, 2)}</td>
      <td class="${changeClass}">${formatPercent(stock.changePct)}</td>
      <td>${formatNumber(stock.volume, 0)}</td>
      <td>${formatPercent(stock.yield)}</td>
      <td>${formatNumber(stock.pe, 2)}</td>
      <td>${formatNumber(stock.pb, 2)}</td>
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
      sector: readCsv(headers, cells, ["產業", "sector"]) || "未分類",
      price: toNumber(readCsv(headers, cells, ["價格", "收盤價", "price"])),
      changePct: toNumber(readCsv(headers, cells, ["漲跌幅", "changePct"])),
      volume: toNumber(readCsv(headers, cells, ["成交量", "volume"])),
      yield: toNumber(readCsv(headers, cells, ["殖利率", "yield"])),
      pe: toNumber(readCsv(headers, cells, ["本益比", "pe"])),
      pb: toNumber(readCsv(headers, cells, ["股價淨值比", "pb"]))
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
  const rows = [["代號", "名稱", "產業", "價格", "漲跌幅", "成交量", "殖利率", "本益比", "股價淨值比", "分數"]];
  state.filtered.forEach((stock) => {
    rows.push([stock.symbol, stock.name, stock.sector, stock.price, stock.changePct, stock.volume, stock.yield, stock.pe, stock.pb, stock.score]);
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
