import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import styles from "./TransactionsPage.module.css";

interface Transaction {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
}

type StatusFilter = "ALL" | "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING";
type PayTypeFilter = "ALL" | "ONLINE" | "OFFLINE";

type SortKey = "amount" | "paymentAt" | null;
type SortOrder = "asc" | "desc";

const PAGE_SIZE_OPTIONS = [10, 20, 30];

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

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [payTypeFilter, setPayTypeFilter] = useState<PayTypeFilter>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ 정렬 상태: 기본은 결제일시 기준 내림차순(최근 순)
  const [sortKey, setSortKey] = useState<SortKey>("paymentAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ✅ 페이지당 건수: 기본 10개
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false); // 드롭다운 열림 상태

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/payments/list");
        if (Array.isArray(res.data.data)) {
          setList(res.data.data);
        } else {
          setList([]);
        }
      } catch (err) {
        console.error("거래내역 조회 실패:", err);
        setError("거래 내역을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== 필터 적용 =====
  const filteredList = list
    .filter((tx) => {
      if (statusFilter === "ALL") return true;
      if (statusFilter === "FAILED") {
        return tx.status === "FAILED" || tx.status === "FAIL";
      }
      return tx.status === statusFilter;
    })
    .filter((tx) => {
      if (payTypeFilter === "ALL") return true;
      return tx.payType === payTypeFilter;
    })
    .filter((tx) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        tx.paymentCode.toLowerCase().includes(q) ||
        tx.mchtCode.toLowerCase().includes(q)
      );
    });

  // ===== 정렬 적용 =====
  const sortedList = [...filteredList];

  if (sortKey === "amount") {
    sortedList.sort((a, b) => {
      const aAmt = Number(a.amount || 0);
      const bAmt = Number(b.amount || 0);
      return sortOrder === "asc" ? aAmt - bAmt : bAmt - aAmt;
    });
  }

  if (sortKey === "paymentAt") {
    sortedList.sort((a, b) => {
      const aTime = new Date(a.paymentAt).getTime();
      const bTime = new Date(b.paymentAt).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      // 같은 컬럼 한 번 더 클릭 → asc / desc 토글
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // 다른 컬럼 클릭 → 해당 컬럼 기준 내림차순
      setSortKey(key);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return "▼"; // 비활성 시 연한 ▼ (CSS로 색만 다르게)
    return sortOrder === "asc" ? "▲" : "▼";
  };

  // ===== 페이징 =====
  const totalItems = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = sortedList.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // 필터 변경 시 페이지 1로 이동
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setCurrentPage(1);
  };

  const handlePayTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPayTypeFilter(e.target.value as PayTypeFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setStatusFilter("ALL");
    setPayTypeFilter("ALL");
    setSearch("");
    setSortKey("paymentAt");
    setSortOrder("desc");
    setPageSize(10); // 초기화 시 10개로
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setPageSizeOpen(false);
  };

  // ===== 요약 통계 =====
  const totalAmount = sortedList.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0
  );
  const successCount = sortedList.filter(
    (tx) => tx.status === "SUCCESS"
  ).length;
  const failCount = sortedList.filter(
    (tx) => tx.status === "FAILED" || tx.status === "FAIL"
  ).length;
  const cancelCount = sortedList.filter(
    (tx) => tx.status === "CANCELLED"
  ).length;
  const pendingCount = sortedList.filter(
    (tx) => tx.status === "PENDING"
  ).length;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>거래 내역</h2>
          <p className={styles.headerSub}>
            결제 상태, 결제 수단, 가맹점별로 거래 내역을 상세하게 조회하고
            정렬할 수 있습니다. (금액/결제일시 헤더 클릭으로 정렬)
          </p>
        </div>
      </div>

      {/* 필터 + 요약 카드 */}
      <div className={styles.topRow}>
        <div className={`${styles.card} ${styles.filterCard}`}>
          <div className={styles.filterRow}>
            <div className={styles.field}>
              <span className={styles.label}>상태</span>
              <select
                className={styles.select}
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="ALL">전체</option>
                <option value="SUCCESS">성공</option>
                <option value="FAILED">실패</option>
                <option value="CANCELLED">취소</option>
                <option value="PENDING">대기</option>
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>결제 유형</span>
              <select
                className={styles.select}
                value={payTypeFilter}
                onChange={handlePayTypeChange}
              >
                <option value="ALL">전체</option>
                <option value="ONLINE">온라인</option>
                <option value="OFFLINE">오프라인</option>
              </select>
            </div>

            <div className={styles.fieldWide}>
              <span className={styles.label}>검색</span>
              <input
                className={styles.input}
                placeholder="결제코드 / 가맹점코드 검색"
                value={search}
                onChange={handleSearchChange}
              />
            </div>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
            >
              초기화
            </button>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <div className={styles.summaryRow}>
            <div>
              <span className={styles.summaryLabel}>필터 적용 건수</span>
              <div className={styles.summaryValue}>
                {totalItems.toLocaleString()} 건
              </div>
            </div>
            <div>
              <span className={styles.summaryLabel}>총 금액</span>
              <div className={styles.summaryValue}>
                {totalAmount.toLocaleString()} 원
              </div>
            </div>
          </div>
          <div className={styles.statusSummary}>
            <span className={`${styles.statusChip} ${styles.success}`}>
              성공 {successCount}
            </span>
            <span className={`${styles.statusChip} ${styles.fail}`}>
              실패 {failCount}
            </span>
            <span className={`${styles.statusChip} ${styles.cancel}`}>
              취소 {cancelCount}
            </span>
            <span className={`${styles.statusChip} ${styles.pending}`}>
              대기 {pendingCount}
            </span>
          </div>
        </div>
      </div>

      {/* 에러/로딩 */}
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>로딩 중...</p>}

      {/* 테이블 */}
      {!loading && !error && (
        <div className={`${styles.card} ${styles.tableCard}`}>
          <div className={styles.tableHeader}>
            <div>
              <h3 className={styles.sectionTitle}>거래 내역 리스트</h3>
              <p className={styles.sectionSub}>
                현재 {pageSize}개씩 표시 중이며, 금액/결제일시 헤더를 클릭해
                정렬 기준을 변경할 수 있습니다.
              </p>
            </div>

            <div className={styles.pageSizeControl}>
              <button
                type="button"
                className={styles.pageSizeToggle}
                onClick={() => setPageSizeOpen((prev) => !prev)}
              >
                <span>정렬 방식</span>
                <span className={styles.pageSizeCurrent}>
                  · {pageSize}개씩 정렬
                </span>
                <span className={styles.pageSizeToggleIcon}>
                  {pageSizeOpen ? "▲" : "▼"}
                </span>
              </button>

              {pageSizeOpen && (
                <div className={styles.pageSizeDropdown}>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePageSizeChange(size)}
                      className={
                        size === pageSize
                          ? `${styles.pageSizeOption} ${styles.pageSizeOptionActive}`
                          : styles.pageSizeOption
                      }
                    >
                      {size}개씩 정렬
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.noDataIcon}>📭</span>
              <p className={styles.noData}>조건에 맞는 거래 내역이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>결제코드</th>
                      <th>가맹점코드</th>

                      <th
                        className={styles.sortableHeader}
                        onClick={() => toggleSort("amount")}
                      >
                        <span className={styles.sortLabel}>금액</span>
                        <span
                          className={
                            sortKey === "amount"
                              ? styles.sortIconActive
                              : styles.sortIcon
                          }
                        >
                          {getSortIcon("amount")}
                        </span>
                      </th>

                      <th>통화</th>
                      <th>결제유형</th>
                      <th>상태</th>

                      {/* ✅ 결제일시 정렬 가능 헤더 */}
                      <th
                        className={styles.sortableHeader}
                        onClick={() => toggleSort("paymentAt")}
                      >
                        <span className={styles.sortLabel}>결제일시</span>
                        <span
                          className={
                            sortKey === "paymentAt"
                              ? styles.sortIconActive
                              : styles.sortIcon
                          }
                        >
                          {getSortIcon("paymentAt")}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((tx) => (
                      <tr key={tx.paymentCode}>
                        <td>
                          <Link
                            to={`/transactions/${tx.paymentCode}`}
                            className={styles.txLink}
                          >
                            {tx.paymentCode}
                          </Link>
                        </td>
                        <td>
                          <Link
                            to={`/merchants/${tx.mchtCode}`}
                            className={styles.merchantLink}
                          >
                            {tx.mchtCode}
                          </Link>
                        </td>
                        <td>{Number(tx.amount).toLocaleString()} 원</td>
                        <td>{tx.currency}</td>
                        <td>
                          <span className={styles.payTypeBadge}>
                            {tx.payType}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[statusClassName(tx.status)]
                            }`}
                          >
                            {formatStatusLabel(tx.status)}
                          </span>
                        </td>
                        <td>
                          {new Date(tx.paymentAt).toLocaleString("ko-KR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className={styles.pagination}>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                <span className={styles.pageInfo}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}