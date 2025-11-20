import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import styles from "./MerchantDetailPage.module.css";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface MerchantDetail {
  mchtCode: string;
  mchtName: string;
  status: string;
  // 아래 필드는 Swagger에 따라 없을 수도 있으니 optional로
  category?: string;
  createdAt?: string;
  email?: string;
  phone?: string;
}

interface Transaction {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "#22c55e", // green
  FAILED: "#f97373", // red
  FAIL: "#f97373",
  CANCELLED: "#fb923c", // orange
  PENDING: "#60a5fa", // blue
};

function formatStatusLabel(status: string) {
  switch (status) {
    case "SUCCESS":
      return "성공";
    case "FAILED":
    case "FAIL":
      return "실패";
    case "CANCELLED":
      return "취소";
    case "PENDING":
      return "대기";
    default:
      return status;
  }
}

function statusClassName(status: string) {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
    case "FAIL":
      return "fail";
    case "CANCELLED":
      return "cancel";
    case "PENDING":
      return "pending";
    default:
      return "";
  }
}

// yyyy-MM-dd로 포맷
function formatDateKey(dateStr: string) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MerchantDetailPage() {
  const { mchtCode } = useParams<{ mchtCode: string }>();

  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [allPayments, setAllPayments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mchtCode) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const [detailRes, paymentsRes] = await Promise.all([
          api.get(`/merchants/details/${mchtCode}`),
          api.get("/payments/list"),
        ]);

        setMerchant(detailRes.data?.data ?? null);

        if (Array.isArray(paymentsRes.data?.data)) {
          setAllPayments(paymentsRes.data.data);
        } else {
          setAllPayments([]);
        }
      } catch (err) {
        console.error("가맹점 상세 조회 실패:", err);
        setError("가맹점 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [mchtCode]);

  // 이 가맹점의 거래만 필터링
  const merchantPayments = useMemo(
    () => allPayments.filter((p) => p.mchtCode === mchtCode),
    [allPayments, mchtCode]
  );

  // 통계 계산
  const totalAmount = merchantPayments.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );
  const totalCount = merchantPayments.length;
  const successCount = merchantPayments.filter(
    (tx) => tx.status === "SUCCESS"
  ).length;
  const failCount = merchantPayments.filter(
    (tx) => tx.status === "FAILED" || tx.status === "FAIL"
  ).length;
  const cancelCount = merchantPayments.filter(
    (tx) => tx.status === "CANCELLED"
  ).length;
  const pendingCount = merchantPayments.filter(
    (tx) => tx.status === "PENDING"
  ).length;

  // 도넛 차트 데이터
  const pieData = [
    { name: "성공", key: "SUCCESS", value: successCount },
    { name: "실패", key: "FAILED", value: failCount },
    { name: "취소", key: "CANCELLED", value: cancelCount },
    { name: "대기", key: "PENDING", value: pendingCount },
  ].filter((d) => d.value > 0);

  // 일별 거래 금액 (성공 기준)
  const dailyChartData = useMemo(() => {
    const map: Record<string, number> = {};
    merchantPayments
      .filter((tx) => tx.status === "SUCCESS")
      .forEach((tx) => {
        const key = formatDateKey(tx.paymentAt);
        const amount = Number(tx.amount || 0);
        map[key] = (map[key] || 0) + amount;
      });

    const entries = Object.entries(map).sort((a, b) =>
      a[0] < b[0] ? -1 : 1
    );

    return entries.map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [merchantPayments]);

  // 최근 거래
  const recentPayments = [...merchantPayments]
    .sort(
      (a, b) =>
        new Date(b.paymentAt).getTime() - new Date(a.paymentAt).getTime()
    )
    .slice(0, 10);

  const statusBadgeClass = merchant
    ? styles[`status-${merchant.status.toLowerCase()}`] || ""
    : "";

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>가맹점 상세</h2>
          <p className={styles.headerSub}>
            선택한 가맹점의 기본 정보와 거래 현황을 한 화면에서 확인할 수
            있습니다.
          </p>
        </div>
        

        <div className={styles.headerRight}>
          {mchtCode && (
          <Link
            to={`/merchants/${mchtCode}/edit`}
            className={styles.headerButton}
          >
            정보 수정
          </Link>
        )}
          <Link to="/merchants" className={styles.backLink}>
            가맹점 목록으로
          </Link>
        </div>
      </div>

      {/* 에러/로딩 */}
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>로딩 중...</p>}

      {!loading && !error && merchant && (
        <>
          {/* 상단: 기본정보 + 요약 */}
          <div className={styles.topRow}>
            <div className={`${styles.card} ${styles.infoCard}`}>
              <div className={styles.infoHeader}>
                <div className={styles.avatar}>
                  {merchant.mchtName?.[0] || "M"}
                </div>
                <div>
                  <div className={styles.mchtName}>{merchant.mchtName}</div>
                  <div className={styles.mchtCode}>{merchant.mchtCode}</div>
                </div>
              </div>

              <div className={styles.infoMetaRow}>
                <div className={styles.infoMetaItem}>
                  <span className={styles.metaLabel}>상태</span>
                  <span className={`${styles.metaValue} ${statusBadgeClass}`}>
                    {merchant.status === "ACTIVE" ? "운영 중" : "중지"}
                  </span>
                </div>
                {merchant.category && (
                  <div className={styles.infoMetaItem}>
                    <span className={styles.metaLabel}>업종</span>
                    <span className={styles.metaValue}>
                      {merchant.category}
                    </span>
                  </div>
                )}
                {merchant.createdAt && (
                  <div className={styles.infoMetaItem}>
                    <span className={styles.metaLabel}>등록일</span>
                    <span className={styles.metaValue}>
                      {new Date(merchant.createdAt).toLocaleDateString(
                        "ko-KR"
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.infoContact}>
                <div>
                  <span className={styles.metaLabel}>이메일</span>
                  <span className={styles.metaValue}>
                    {merchant.email || "-"}
                  </span>
                </div>
                <div>
                  <span className={styles.metaLabel}>연락처</span>
                  <span className={styles.metaValue}>
                    {merchant.phone || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* 요약 카드 */}
            <div className={`${styles.card} ${styles.summaryCard}`}>
              <div className={styles.summaryRow}>
                <div>
                  <span className={styles.summaryLabel}>총 거래 금액</span>
                  <div className={styles.summaryValue}>
                    {totalAmount.toLocaleString()} 원
                  </div>
                </div>
                <div>
                  <span className={styles.summaryLabel}>총 거래 건수</span>
                  <div className={styles.summaryValue}>
                    {totalCount.toLocaleString()} 건
                  </div>
                </div>
              </div>

              <div className={styles.statusSummary}>
                <span
                  className={`${styles.statusChip} ${styles.chipSuccess}`}
                >
                  성공 {successCount}
                </span>
                <span className={`${styles.statusChip} ${styles.chipFail}`}>
                  실패 {failCount}
                </span>
                <span
                  className={`${styles.statusChip} ${styles.chipCancel}`}
                >
                  취소 {cancelCount}
                </span>
                <span
                  className={`${styles.statusChip} ${styles.chipPending}`}
                >
                  대기 {pendingCount}
                </span>
              </div>
            </div>
          </div>

          {/* 도넛 차트 */}
          <div className={`${styles.card} ${styles.chartCard}`}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.sectionTitle}>결제 상태 비율</h3>
                <p className={styles.sectionSub}>
                  이 가맹점의 거래를 기준으로 성공/실패/취소/대기 비율을
                  보여줍니다.
                </p>
              </div>
            </div>

            {pieData.length === 0 ? (
              <div className={styles.emptyBox}>
                <span className={styles.noDataIcon}>📊</span>
                <p className={styles.noData}>표시할 거래 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.donutRow}>
                <div className={styles.donutChartWrap}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, idx) => {
                          const color =
                            STATUS_COLORS[entry.key] || "#9ca3af";
                          return <Cell key={idx} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value}건`, "건수"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.donutSummary}>
                  <div className={styles.donutSummaryTitle}>
                    상태별 건수 요약
                  </div>
                  <ul className={styles.donutList}>
                    <li>
                      <span
                        className={`${styles.dot} ${styles.dotSuccess}`}
                      />
                      성공{" "}
                      <strong>{successCount.toLocaleString()}건</strong>
                    </li>
                    <li>
                      <span className={`${styles.dot} ${styles.dotFail}`} />
                      실패{" "}
                      <strong>{failCount.toLocaleString()}건</strong>
                    </li>
                    <li>
                      <span
                        className={`${styles.dot} ${styles.dotCancel}`}
                      />
                      취소{" "}
                      <strong>{cancelCount.toLocaleString()}건</strong>
                    </li>
                    <li>
                      <span
                        className={`${styles.dot} ${styles.dotPending}`}
                      />
                      대기{" "}
                      <strong>{pendingCount.toLocaleString()}건</strong>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 하단: 일별 거래 금액 + 최근 거래 */}
          <div className={styles.bottomRow}>
            {/* 일별 거래 금액 */}
            <div className={`${styles.card} ${styles.lineCard}`}>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    최근 일별 거래 금액
                  </h3>
                  <p className={styles.sectionSub}>
                    이 가맹점의 성공 거래를 기준으로 일자별 매출 합계를
                    보여줍니다.
                  </p>
                </div>
              </div>

              {dailyChartData.length === 0 ? (
                <div className={styles.emptyBox}>
                  <span className={styles.noDataIcon}>📉</span>
                  <p className={styles.noData}>
                    일별 거래 금액 데이터가 없습니다.
                  </p>
                </div>
              ) : (
                <div className={styles.lineChartWrap}>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [
                          `${Number(value).toLocaleString()} 원`,
                          "금액",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#2563eb"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* 최근 거래 */}
            <div className={`${styles.card} ${styles.recentCard}`}>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h3 className={styles.sectionTitle}>최근 거래</h3>
                  <p className={styles.sectionSub}>
                    이 가맹점에서 발생한 최근 거래 10건입니다.
                  </p>
                </div>
              </div>

              {recentPayments.length === 0 ? (
                <div className={styles.emptyBox}>
                  <span className={styles.noDataIcon}>🧾</span>
                  <p className={styles.noData}>최근 거래 내역이 없습니다.</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>결제코드</th>
                        <th>금액</th>
                        <th>상태</th>
                        <th>결제일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((tx) => (
                        <tr key={tx.paymentCode}>
                          <td>{tx.paymentCode}</td>
                          <td>
                            {Number(tx.amount).toLocaleString()} 원
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${styles[statusClassName(tx.status)]
                                }`}
                            >
                              {formatStatusLabel(tx.status)}
                            </span>
                          </td>
                          <td>
                            {new Date(tx.paymentAt).toLocaleString(
                              "ko-KR"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}