import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import api from "../lib/api";
import styles from "./DashboardPage.module.css";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Transaction {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
}

interface Merchant {
  mchtCode: string;
  mchtName: string;
  status: string;
}

type RangeType = "ALL" | "7D";

type TrendDirection = "up" | "down" | "flat";

function calcTrend(values: number[]): { direction: TrendDirection; label: string } {
  if (values.length < 2) {
    return { direction: "flat", label: "데이터 부족" };
  }

  const last = values[values.length - 1];
  const prev = values[values.length - 2];

  if (prev === 0) {
    if (last === 0) return { direction: "flat", label: "변동 없음" };
    return { direction: "up", label: "+100%" };
  }

  const diff = last - prev;
  const rate = (diff / prev) * 100;

  if (Math.abs(rate) < 0.1) {
    return { direction: "flat", label: "변동 없음" };
  }

  const sign = rate > 0 ? "+" : "";
  return {
    direction: rate > 0 ? "up" : "down",
    label: `${sign}${rate.toFixed(1)}%`,
  };
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<RangeType>("ALL");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [paymentsRes, merchantsRes] = await Promise.all([
          api.get("/payments/list"),
          api.get("/merchants/list"),
        ]);

        if (Array.isArray(paymentsRes.data.data)) {
          setTransactions(paymentsRes.data.data);
        } else {
          setTransactions([]);
        }

        if (Array.isArray(merchantsRes.data.data)) {
          setMerchants(merchantsRes.data.data);
        } else {
          setMerchants([]);
        }
      } catch (err) {
        console.error("대시보드 조회 실패:", err);
        setError("대시보드 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const filteredTransactions: Transaction[] = (() => {
    if (range === "ALL") return transactions;

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return transactions.filter((tx) => {
      if (!tx.paymentAt) return false;
      const d = new Date(tx.paymentAt);
      if (Number.isNaN(d.getTime())) return false;
      return d >= sevenDaysAgo && d <= now;
    });
  })();

  const totalAmount = filteredTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );
  const totalCount = filteredTransactions.length;
  const merchantCount = merchants.length;

  const successCount = filteredTransactions.filter(
    (tx) => tx.status === "SUCCESS"
  ).length;
  const failCount = filteredTransactions.filter(
    (tx) => tx.status === "FAILED" || tx.status === "FAIL"
  ).length;
  const cancelCount = filteredTransactions.filter(
    (tx) => tx.status === "CANCELLED"
  ).length;
  const pendingCount = filteredTransactions.filter(
    (tx) => tx.status === "PENDING"
  ).length;

  const pieData = [
    { name: "성공", value: successCount, color: "#16a34a" },
    { name: "실패", value: failCount, color: "#dc2626" },
    { name: "취소", value: cancelCount, color: "#f97316" },
    { name: "대기", value: pendingCount, color: "#3b82f6" },
  ];

  const dailyAmountMap: Record<string, number> = {};
  const dailyCountMap: Record<string, number> = {};

  filteredTransactions.forEach((tx) => {
    if (!tx.paymentAt) return;
    const dateKey = tx.paymentAt.slice(0, 10);
    const amount = Number(tx.amount || 0);
    dailyAmountMap[dateKey] = (dailyAmountMap[dateKey] || 0) + amount;
    dailyCountMap[dateKey] = (dailyCountMap[dateKey] || 0) + 1;
  });

  const dailyAmountData = Object.keys(dailyAmountMap)
    .sort()
    .map((date) => ({
      date: date.slice(5),
      amount: dailyAmountMap[date],
    }));

  const dailyCountData = Object.keys(dailyCountMap)
    .sort()
    .map((date) => ({
      date: date.slice(5),
      count: dailyCountMap[date],
    }));

  const amountTrend = calcTrend(dailyAmountData.map((d) => d.amount));
  const countTrend = calcTrend(dailyCountData.map((d) => d.count));

  /** 최근 5건 */
  const recentTransactions = [...filteredTransactions]
    .sort(
      (a, b) =>
        new Date(b.paymentAt).getTime() - new Date(a.paymentAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>올페이즈 대시보드</h2>
          <p className={styles.headerSub}>
            실시간 결제 현황과 가맹점 정보를 한 눈에 확인할 수 있는 관리자
            대시보드입니다.
          </p>
        </div>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterBtn} ${range === "ALL" ? styles.filterActive : ""
              }`}
            onClick={() => setRange("ALL")}
          >
            전체
          </button>
          <button
            type="button"
            className={`${styles.filterBtn} ${range === "7D" ? styles.filterActive : ""
              }`}
            onClick={() => setRange("7D")}
          >
            최근 7일
          </button>
        </div>
      </div>

      {/* 상단 요약 카드 */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <span className={styles.summaryLabel}>총 거래 금액</span>
          <span className={styles.summaryValue}>
            {totalAmount.toLocaleString()} 원
          </span>
          <div
            className={`${styles.trendRow} ${amountTrend.direction === "up"
              ? styles.trendUp
              : amountTrend.direction === "down"
                ? styles.trendDown
                : styles.trendFlat
              }`}
          >
            <span className={styles.trendIcon}>
              {amountTrend.direction === "up"
                ? "▲"
                : amountTrend.direction === "down"
                  ? "▼"
                  : "■"}
            </span>
            <span className={styles.trendText}>
              전일 대비 {amountTrend.label}
            </span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <span className={styles.summaryLabel}>총 거래 건수</span>
          <span className={styles.summaryValue}>{totalCount} 건</span>
          <div
            className={`${styles.trendRow} ${countTrend.direction === "up"
              ? styles.trendUp
              : countTrend.direction === "down"
                ? styles.trendDown
                : styles.trendFlat
              }`}
          >
            <span className={styles.trendIcon}>
              {countTrend.direction === "up"
                ? "▲"
                : countTrend.direction === "down"
                  ? "▼"
                  : "■"}
            </span>
            <span className={styles.trendText}>
              전일 대비 {countTrend.label}
            </span>
          </div>
        </div>
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <span className={styles.summaryLabel}>성공 / 실패</span>
          <span className={styles.summaryValue}>
            <span className={styles.success}>{successCount}</span>
            <span className={styles.slash}> / </span>
            <span className={styles.fail}>{failCount}</span>
          </span>
        </div>
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <span className={styles.summaryLabel}>대기 / 가맹점 수</span>
          <span className={styles.summaryValue}>
            <span className={styles.pending}>{pendingCount}</span>
            <span className={styles.slash}> / </span>
            <span>{merchantCount}</span>
          </span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>로딩 중...</p>}

      {!loading && !error && (
        <>
          {/* 도넛 차트 */}
          <div className={styles.middleGrid}>
            <div className={`${styles.card} ${styles.chartCard}`}>
              <h3 className={styles.sectionTitle}>결제 상태 비율</h3>
              {totalCount === 0 ? (
                <div className={styles.emptyBox}>
                  <span className={styles.noDataIcon}>📭</span>
                  <p className={styles.noData}>거래 데이터가 없습니다.</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={190}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                      >
                        {pieData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value}건`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.legendRow}>
                    {pieData.map((item) => (
                      <div key={item.name} className={styles.legendItem}>
                        <span
                          className={styles.legendDot}
                          style={{ backgroundColor: item.color }}
                        />
                        <span className={styles.legendLabel}>
                          {item.name}
                        </span>
                        <span className={styles.legendValue}>
                          {item.value.toLocaleString()}건
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 상태 */}
            <div className={`${styles.card} ${styles.statusBox}`}>
              <h3 className={styles.sectionTitle}>결제 상태 요약</h3>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>성공</span>
                <span className={`${styles.statusCount} ${styles.success}`}>
                  {successCount}건
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>실패</span>
                <span className={`${styles.statusCount} ${styles.fail}`}>
                  {failCount}건
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>취소</span>
                <span className={`${styles.statusCount} ${styles.cancel}`}>
                  {cancelCount}건
                </span>
              </div>
              <div className={styles.statusRow}>
                <span className={styles.statusLabel}>대기</span>
                <span className={`${styles.statusCount} ${styles.pending}`}>
                  {pendingCount}건
                </span>
              </div>
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <div className={`${styles.card} ${styles.chartCard}`}>
              <h3 className={styles.sectionTitle}>최근 일별 거래 금액</h3>
              <p className={styles.sectionSub}>
                선택한 기간 내 일별 거래 금액 추이를 보여줍니다.
              </p>
              {dailyAmountData.length === 0 ? (
                <div className={styles.emptyBox}>
                  <span className={styles.noDataIcon}>📉</span>
                  <p className={styles.noData}>거래 데이터가 없습니다.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={dailyAmountData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      angle={-30}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) =>
                        `${value.toLocaleString()} 원`
                      }
                      labelFormatter={(label) => `날짜: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className={`${styles.card} ${styles.tableCard}`}>
              <h3 className={styles.sectionTitle}>최근 거래</h3>
              <p className={styles.sectionSub}>
                선택한 기간 내 최근 5건의 거래입니다.
              </p>
              {recentTransactions.length === 0 ? (
                <div className={styles.emptyBox}>
                  <span className={styles.noDataIcon}>📃</span>
                  <p className={styles.noData}>최근 거래가 없습니다.</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>결제코드</th>
                      <th>가맹점코드</th>
                      <th>금액</th>
                      <th>상태</th>
                      <th>결제일시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.paymentCode}>
                        {/* ✅ 결제코드 → 거래 상세 페이지로 */}
                        <td>
                          <Link
                            to={`/transactions/${tx.paymentCode}`}
                            className={styles.txLink}
                          >
                            {tx.paymentCode}
                          </Link>
                        </td>

                        {/* ✅ 가맹점코드 → 가맹점 상세 페이지로 */}
                        <td>
                          <Link
                            to={`/merchants/${tx.mchtCode}`}
                            className={styles.merchantLink}
                          >
                            {tx.mchtCode}
                          </Link>
                        </td>

                        <td>{Number(tx.amount).toLocaleString()} 원</td>
                        <td>{tx.status}</td>
                        <td>{new Date(tx.paymentAt).toLocaleString("ko-KR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
