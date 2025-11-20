import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import styles from "./MerchantsPage.module.css";

interface Merchant {
  mchtCode: string;
  mchtName: string;
  status: string;
}

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const PAGE_SIZE = 20;

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "운영 중";
    case "INACTIVE":
      return "중지";
    default:
      return status;
  }
}

export default function MerchantsPage() {
  const [list, setList] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/merchants/list");
        if (Array.isArray(res.data.data)) {
          setList(res.data.data);
        } else {
          setList([]);
        }
      } catch (err) {
        console.error("가맹점 목록 조회 실패:", err);
        setError("가맹점 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  // ===== 필터 적용 =====
  const filteredList = list
    .filter((m) => {
      if (statusFilter === "ALL") return true;
      return m.status === statusFilter;
    })
    .filter((m) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        m.mchtCode.toLowerCase().includes(q) ||
        m.mchtName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => a.mchtCode.localeCompare(b.mchtCode)); // 코드순 정렬

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setStatusFilter("ALL");
    setSearch("");
    setCurrentPage(1);
  };

  // ===== 페이징 =====
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // ===== 요약 통계 =====
  const activeCount = filteredList.filter((m) => m.status === "ACTIVE").length;
  const inactiveCount = filteredList.filter(
    (m) => m.status === "INACTIVE"
  ).length;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>가맹점 목록</h2>
          <p className={styles.headerSub}>
            PG와 계약된 가맹점의 코드, 명칭, 상태를 한눈에 확인하고 상세 정보를
            조회할 수 있습니다.
          </p>
        </div>
        <Link to="/merchants/new" className={styles.headerButton}>
          가맹점 등록
        </Link>
      </div>

      {/* 필터 + 요약 카드 */}
      <div className={styles.topRow}>
        {/* 필터 카드 */}
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
                <option value="ACTIVE">운영 중</option>
                <option value="INACTIVE">중지</option>
              </select>
            </div>

            <div className={styles.fieldWide}>
              <span className={styles.label}>검색</span>
              <div className={styles.inputWrap}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  className={styles.input}
                  placeholder="가맹점코드 / 가맹점명 검색"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
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
              <span className={styles.summaryLabel}>필터 적용 가맹점 수</span>
              <div className={styles.summaryValue}>
                {totalItems.toLocaleString()} 개
              </div>
            </div>
          </div>
          <div className={styles.statusSummary}>
            <span className={`${styles.statusChip} ${styles.active}`}>
              운영 중 {activeCount}
            </span>
            <span className={`${styles.statusChip} ${styles.inactive}`}>
              중지 {inactiveCount}
            </span>
          </div>
        </div>
      </div>

      {/* 에러 / 로딩 */}
      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>로딩 중...</p>}

      {/* 테이블 */}
      {!loading && !error && (
        <div className={`${styles.card} ${styles.tableCard}`}>
          <div className={styles.tableHeader}>
            <h3 className={styles.sectionTitle}>가맹점 리스트</h3>
            <p className={styles.sectionSub}>
              가맹점 코드를 클릭하면 상세 페이지로 이동합니다.
            </p>
          </div>

          {pageItems.length === 0 ? (
            <div className={styles.emptyBox}>
              <span className={styles.noDataIcon}>🏬</span>
              <p className={styles.noData}>조건에 맞는 가맹점이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>가맹점 코드</th>
                      <th>가맹점 이름</th>
                      <th>상태</th>
                      <th>상세 보기</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((m) => (
                      <tr key={m.mchtCode}>
                        <td>
                          <Link
                            to={`/merchants/${m.mchtCode}`}
                            className={styles.codeLink}
                          >
                            {m.mchtCode}
                          </Link>
                        </td>
                        <td>{m.mchtName}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${m.status === "ACTIVE"
                                ? styles.statusActive
                                : styles.statusInactive
                              }`}
                          >
                            {statusLabel(m.status)}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/merchants/${m.mchtCode}`}
                            className={styles.detailBtn}
                          >
                            상세
                          </Link>
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