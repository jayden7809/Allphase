import { useEffect, useState } from "react";
import api from "../lib/api";
import styles from "./CommonCodesPage.module.css";

interface CodeItem {
  code: string;
  name: string;
  description?: string;
}

export default function CommonCodesPage() {
  const [paymentStatus, setPaymentStatus] = useState<CodeItem[]>([]);
  const [paymentType, setPaymentType] = useState<CodeItem[]>([]);
  const [merchantStatus, setMerchantStatus] = useState<CodeItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statusRes, typeRes, mchtRes] = await Promise.all([
          api.get("/common/payment-status/all"),
          api.get("/common/paymemt-type/all"), // Swagger 오타 그대로 사용
          api.get("/common/mcht-status/all"),
        ]);

        if (Array.isArray(statusRes.data?.data)) {
          setPaymentStatus(statusRes.data.data);
        } else {
          setPaymentStatus([]);
        }

        if (Array.isArray(typeRes.data?.data)) {
          setPaymentType(typeRes.data.data);
        } else {
          setPaymentType([]);
        }

        if (Array.isArray(mchtRes.data?.data)) {
          setMerchantStatus(mchtRes.data.data);
        } else {
          setMerchantStatus([]);
        }
      } catch (err) {
        console.error("공통 코드 조회 실패:", err);
        setError("공통 코드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const totalCount =
    paymentStatus.length + paymentType.length + merchantStatus.length;

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>공통 코드</h2>
          <p className={styles.headerSub}>
            결제 상태, 결제 수단, 가맹점 상태에 사용되는 공통 코드를 한 곳에서
            관리합니다.
          </p>
        </div>
      </div>

      {/* 상단 카드 */}
      <div className={styles.topRow}>
        <div className={`${styles.card} ${styles.summaryCard}`}>
          <div className={styles.summaryRow}>
            <div>
              <span className={styles.summaryLabel}>총 코드 수</span>
              <div className={styles.summaryValue}>
                {totalCount.toLocaleString()} 개
              </div>
            </div>
          </div>
          <div className={styles.statusSummary}>
            <span className={styles.chipPrimary}>
              결제 상태 {paymentStatus.length}
            </span>
            <span className={styles.chipSecondary}>
              결제 수단 {paymentType.length}
            </span>
            <span className={styles.chipTertiary}>
              가맹점 상태 {merchantStatus.length}
            </span>
          </div>
        </div>

        <div className={`${styles.card} ${styles.infoCard}`}>
          <div className={styles.infoTitle}>안내</div>
          <p className={styles.infoText}>
            • 공통 코드는 결제/가맹점 API 응답에서 상태값을 해석하는 기준이
            됩니다.
          </p>
          <p className={styles.infoText}>
            • 실제 운영 환경에서는 이 화면에서 코드 등록/수정 기능이 제공될 수
            있으나, 본 과제에서는 조회 전용으로 구현되었습니다.
          </p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>로딩 중...</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {/* 결제 상태 코드 */}
          <div className={`${styles.card} ${styles.codeCard}`}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.sectionTitle}>결제 상태 코드</h3>
                <p className={styles.sectionSub}>
                  결제 API의 status 필드에 사용되는 코드 목록입니다.
                </p>
              </div>
            </div>

            {paymentStatus.length === 0 ? (
              <div className={styles.emptyBox}>
                <span className={styles.noDataIcon}>📊</span>
                <p className={styles.noData}>등록된 결제 상태 코드가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>코드</th>
                      <th>이름</th>
                      <th>설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentStatus.map((item) => (
                      <tr key={item.code}>
                        <td className={styles.codeCell}>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles.codeCard}`}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.sectionTitle}>결제 수단 코드</h3>
                <p className={styles.sectionSub}>
                  카드 / 가상계좌 / 빌링 등 결제 수단 종류를 나타내는 코드입니다.
                </p>
              </div>
            </div>

            {paymentType.length === 0 ? (
              <div className={styles.emptyBox}>
                <span className={styles.noDataIcon}>💳</span>
                <p className={styles.noData}>등록된 결제 수단 코드가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>코드</th>
                      <th>이름</th>
                      <th>설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentType.map((item) => (
                      <tr key={item.code}>
                        <td className={styles.codeCell}>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles.codeCard}`}>
            <div className={styles.cardHeaderRow}>
              <div>
                <h3 className={styles.sectionTitle}>가맹점 상태 코드</h3>
                <p className={styles.sectionSub}>
                  가맹점의 운영/중지 여부를 표현하는 상태 코드입니다.
                </p>
              </div>
            </div>

            {merchantStatus.length === 0 ? (
              <div className={styles.emptyBox}>
                <span className={styles.noDataIcon}>🏬</span>
                <p className={styles.noData}>등록된 가맹점 상태 코드가 없습니다.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>코드</th>
                      <th>이름</th>
                      <th>설명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchantStatus.map((item) => (
                      <tr key={item.code}>
                        <td className={styles.codeCell}>{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}