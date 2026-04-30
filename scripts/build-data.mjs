import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "data", "market-data.json");

async function main() {
  const dateToken = await getLatestTwseDate();
  const [twseMarket, tpexMarket, twseValuation, tpexValuation, yearChanges, monthlyRevenue, quarterRevenue] = await Promise.all([
    fetchTwseMarket(dateToken),
    fetchTpexMarket(dateToken),
    fetchTwseValuation(),
    fetchTpexValuation(),
    fetchYearChange(dateToken),
    fetchMonthlyRevenue(),
    fetchQuarterRevenue()
  ]);

  const rows = mergeOfficialData(
    [...twseMarket, ...tpexMarket],
    [...twseValuation, ...tpexValuation],
    yearChanges,
    monthlyRevenue,
    quarterRevenue
  ).sort((a, b) => a.symbol.localeCompare(b.symbol, "zh-Hant"));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    tradeDate: `${dateToken.slice(0, 4)}-${dateToken.slice(4, 6)}-${dateToken.slice(6, 8)}`,
    source: "TWSE and TPEx official public data",
    total: rows.length,
    twseCount: twseMarket.length,
    tpexCount: tpexMarket.length,
    rows
  }, null, 2)}\n`, "utf8");

  console.log(`Wrote ${rows.length} securities to ${outputPath}`);
  console.log(`TWSE=${twseMarket.length} TPEx=${tpexMarket.length}`);
}

async function getLatestTwseDate() {
  const data = await fetchJson("https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?response=json");
  if (!data.date) throw new Error("TWSE latest date is unavailable.");
  return data.date;
}

async function fetchTwseMarket(dateToken) {
  const data = await fetchJson(`https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date=${dateToken}&response=json`);
  const table = findTable(data, ["證券代號", "收盤價"]);
  return table.rows.map((row) => mapTwseMarketRow(table.fields, row)).filter(Boolean);
}

async function fetchTpexMarket(dateToken) {
  const rocDate = toRocDate(dateToken);
  const data = await fetchJson(`https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&se=EW&o=json&d=${encodeURIComponent(rocDate)}`);
  const table = findTable(data, ["代號", "收盤"]);
  return table.rows.map((row) => mapTpexMarketRow(table.fields, row)).filter(Boolean);
}

async function fetchTwseValuation() {
  const data = await fetchJson("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_d");
  return data.map((row) => {
    const symbol = stripHtml(row.Code);
    if (!isSecurityCode(symbol)) return null;
    return {
      symbol,
      yield: toNumber(row.DividendYield),
      pe: toNumber(row.PEratio),
      pb: toNumber(row.PBratio)
    };
  }).filter(Boolean);
}

async function fetchTpexValuation() {
  const data = await fetchJson("https://www.tpex.org.tw/openapi/v1/tpex_mainboard_peratio_analysis");
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

async function fetchYearChange(dateToken) {
  const baseDateToken = shiftYearToken(dateToken, -1);
  const [currentRows, baseRows] = await Promise.all([
    fetchAllDailyPrices(dateToken),
    fetchAllDailyPrices(baseDateToken)
  ]);
  const baseMap = new Map(baseRows.map((row) => [row.symbol, row.price]));
  return currentRows.map((row) => {
    const basePrice = baseMap.get(row.symbol);
    return {
      symbol: row.symbol,
      yearChangePct: row.price && basePrice ? ((row.price - basePrice) / basePrice) * 100 : null
    };
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
  const data = await fetchJson(`https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY_ALL?date=${dateToken}&response=json`);
  const table = findTable(data, ["證券代號", "收盤價"]);
  return table.rows.map((row) => ({
    symbol: valueByLabel(table.fields, row, "證券代號"),
    price: toNumber(valueByLabel(table.fields, row, "收盤價"))
  })).filter((row) => isSecurityCode(row.symbol));
}

async function fetchTpexDailyPrices(dateToken) {
  const rocDate = toRocDate(dateToken);
  const data = await fetchJson(`https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?l=zh-tw&se=EW&o=json&d=${encodeURIComponent(rocDate)}`);
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

function mapTwseMarketRow(fields, row) {
  const symbol = valueByLabel(fields, row, "證券代號");
  const name = valueByLabel(fields, row, "證券名稱");
  if (!isSecurityCode(symbol)) return null;
  const volumeShares = toNumber(valueByLabel(fields, row, "成交股數"));
  const sign = String(valueByLabel(fields, row, "漲跌(+/-)") || "");
  const change = toNumber(valueByLabel(fields, row, "漲跌價差"));
  const price = toNumber(valueByLabel(fields, row, "收盤價"));
  const signedChange = sign.includes("-") ? -change : change;
  return {
    symbol,
    name,
    market: "上市",
    productType: classifyProduct(symbol, name),
    sector: guessSector(symbol, name),
    price,
    changePct: price && change !== null ? (signedChange / (price - signedChange)) * 100 : null,
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
  return {
    symbol,
    name,
    market: "上櫃",
    productType: classifyProduct(symbol, name),
    sector: guessSector(symbol, name),
    price,
    changePct: price && change !== null ? (change / (price - change)) * 100 : null,
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

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
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
  if (Array.isArray(payload.fields) && Array.isArray(payload.data)) {
    candidates.push({ fields: payload.fields, rows: payload.data });
  }
  const table = candidates.find((candidate) =>
    requiredLabels.every((label) => candidate.fields.some((field) => String(field).includes(label)))
  );
  if (!table) throw new Error("Official response format changed.");
  return table;
}

function valueByLabel(fields, row, label) {
  const index = fields.findIndex((field) => String(field).includes(label));
  return index >= 0 ? stripHtml(row[index]) : "";
}

function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, "").trim().replace(/\s+/g, " ");
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

function shiftYearToken(dateToken, offset) {
  const year = Number(dateToken.slice(0, 4)) + offset;
  return `${year}${dateToken.slice(4)}`;
}

function toRocDate(dateToken) {
  const year = Number(dateToken.slice(0, 4)) - 1911;
  return `${year}/${dateToken.slice(4, 6)}/${dateToken.slice(6, 8)}`;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
