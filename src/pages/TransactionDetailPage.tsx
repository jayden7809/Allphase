import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import styles from "./TransactionDetailPage.module.css";

interface Transaction {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
}

interface MerchantBrief {
  mchtCode: string;
  mchtName: string;
  status: string;
}

export default function TransactionDetailPage() {
  const { paymentCode } = useParams<{ paymentCode: string }>();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [merchant, setMerchant] = useState<MerchantBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!paymentCode) return;

      try {
        setLoading(true);
        setError(null);

        // 1) 전체 거래 리스트에서 해당 결제코드 찾기
        const res = await api.get("/payments/list");
        const list: Transaction[] = res.data.data || [];

        const found = list.find((item) => item.paymentCode === paymentCode);
        if (!found) {
          setError("해당 결제코드를 가진 거래 내역을 찾지 못했습니다.");
          setTx(null);
          return;
        }

        setTx(found);

        // 2) 가맹점 간단 정보도 함께 조회
        if (found.mchtCode) {
          try {
            const merchantRes = await api.get(
              `/merchants/details/${found.mchtCode}`
            );
            if (merchantRes.data?.data) {
              setMerchant(merchantRes.data.data);
            }
          } catch (e) {
            console.warn("가맹점 정보 조회 실패(거래 상세):", e);
          }
        }
      } catch (e) {
        console.error("거래 상세 조회 실패:", e);
        setError("거래 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentCode]);

  const formatAmount = (amount: string, currency: string) => {
    const num = Number(amount);
    if (Number.isNaN(num)) return `${amount} ${currency}`;
    if (currency === "KRW") return `${num.toLocaleString()} 원`;
    return `${num.toLocaleString()} ${currency}`;
  };

  const formatStatusLabel = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "성공";
      case "FAILED":
        return "실패";
      case "CANCELLED":
        return "취소";
      case "PENDING":
        return "대기";
      default:
        return status;
    }
  };

  const formatPayTypeLabel = (payType: string) => {
    switch (payType) {
      case "ONLINE":
        return "온라인 결제";
      case "VACT":
        return "가상계좌";
      case "BILLING":
        return "정기결제";
      default:
        return payType;
    }
  };

  if (loading) {
    return <p className={styles.centerText}>로딩 중...</p>;
  }

  if (error || !tx) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>
          <p>{error ?? "거래 정보를 찾을 수 없습니다."}</p>
          <Link to="/transactions" className={styles.backBtn}>
            거래 내역 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 상단 헤더 카드 */}
      <div className={styles.topRow}>
        <div className={`${styles.card} ${styles.mainCard}`}>
          <div className={styles.headerRow}>
            <div>
              <span className={styles.label}>결제 코드</span>
              <h2 className={styles.title}>{tx.paymentCode}</h2>
            </div>
            <div className={styles.statusArea}>
              <span
                className={`${styles.statusBadge} ${
                  tx.status === "SUCCESS"
                    ? styles.statusSuccess
                    : tx.status === "CANCELLED"
                    ? styles.statusCancel
                    : tx.status === "FAILED"
                    ? styles.statusFail
                    : styles.statusPending
                }`}
              >
                {formatStatusLabel(tx.status)}
              </span>
            </div>
          </div>

          <div className={styles.summaryRow}>
            <div>
              <span className={styles.label}>결제 금액</span>
              <div className={styles.summaryValue}>
                {formatAmount(tx.amount, tx.currency)}
              </div>
            </div>
            <div>
              <span className={styles.label}>결제 수단</span>
              <div className={styles.summaryValue}>
                {formatPayTypeLabel(tx.payType)} ({tx.payType})
              </div>
            </div>
            <div>
              <span className={styles.label}>결제 일시</span>
              <div className={styles.summaryValue}>
                {new Date(tx.paymentAt).toLocaleString("ko-KR")}
              </div>
            </div>
          </div>
        </div>

        {/* 가맹점 간단 정보 카드 */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>가맹점 정보</h3>
            {merchant && (
              <Link
                to={`/merchants/${tx.mchtCode}`}
                className={styles.linkBtn}
              >
                가맹점 상세 보기
              </Link>
            )}
          </div>
          <div className={styles.merchantInfo}>
            <div className={styles.merchantCodeRow}>
              <span className={styles.merchantCodeLabel}>가맹점 코드</span>
              <span className={styles.merchantCodeValue}>{tx.mchtCode}</span>
            </div>
            {merchant && (
              <>
                <div className={styles.merchantNameRow}>
                  <span className={styles.merchantCodeLabel}>가맹점 이름</span>
                  <span className={styles.merchantNameValue}>
                    {merchant.mchtName}
                  </span>
                </div>
                <div className={styles.merchantStatusRow}>
                  <span className={styles.merchantCodeLabel}>상태</span>
                  <span
                    className={`${styles.merchantStatusBadge} ${
                      merchant.status === "ACTIVE"
                        ? styles.merchantStatusActive
                        : styles.merchantStatusInactive
                    }`}
                  >
                    {merchant.status === "ACTIVE" ? "운영 중" : "중지"}
                  </span>
                </div>
              </>
            )}
            {!merchant && (
              <p className={styles.merchantHint}>
                가맹점 상세 정보를 불러오지 못했습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 섹션 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>결제 상세 정보</h3>
        <table className={styles.detailTable}>
          <tbody>
            <tr>
              <th>결제 코드</th>
              <td>{tx.paymentCode}</td>
            </tr>
            <tr>
              <th>가맹점 코드</th>
              <td>{tx.mchtCode}</td>
            </tr>
            <tr>
              <th>결제 금액</th>
              <td>{formatAmount(tx.amount, tx.currency)}</td>
            </tr>
            <tr>
              <th>통화</th>
              <td>{tx.currency}</td>
            </tr>
            <tr>
              <th>결제 수단</th>
              <td>
                {formatPayTypeLabel(tx.payType)} ({tx.payType})
              </td>
            </tr>
            <tr>
              <th>결제 상태</th>
              <td>
                {formatStatusLabel(tx.status)} ({tx.status})
              </td>
            </tr>
            <tr>
              <th>결제 일시</th>
              <td>{new Date(tx.paymentAt).toLocaleString("ko-KR")}</td>
            </tr>
            <tr>
              <th>비고</th>
              <td className={styles.note}>
                결제 상태 / 수단 코드는 공통 코드 API
                <code>/common/payment-status/all</code>,{" "}
                <code>/common/payment-type/all</code> 기준으로 표현됩니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.footerActions}>
        <Link to="/transactions" className={styles.backBtn}>
          ← 거래 내역 목록으로
        </Link>
        <Link to="/" className={styles.toDashboardBtn}>
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}