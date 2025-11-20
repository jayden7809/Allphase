import { useEffect, useState } from "react";
import styles from "./HealthPage.module.css";

type HealthStatus = "UNKNOWN" | "UP" | "DOWN";

interface HealthInfo {
  status: HealthStatus;
  responseTimeMs: number | null;
  lastCheckedAt: string | null;
  errorMessage?: string | null;
}

export default function SystemStatusPage() {
  const [health, setHealth] = useState<HealthInfo>({
    status: "UNKNOWN",
    responseTimeMs: null,
    lastCheckedAt: null,
    errorMessage: null,
  });
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const start = performance.now();

      // ⚠️ /health 엔드포인트는 /api/v1 이 아니라 서버 루트 기준이라
      // axios 인스턴스 대신 fetch 로 직접 호출
      const res = await fetch("https://recruit.paysbypays.com/health");

      const end = performance.now();
      const responseTime = Math.round(end - start);

      if (res.ok) {
        setHealth({
          status: "UP",
          responseTimeMs: responseTime,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: null,
        });
      } else {
        setHealth({
          status: "DOWN",
          responseTimeMs: responseTime,
          lastCheckedAt: new Date().toISOString(),
          errorMessage: `응답 코드: ${res.status}`,
        });
      }
    } catch (err) {
      console.error("health-check 실패:", err);
      setHealth({
        status: "DOWN",
        responseTimeMs: null,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: "health-check 엔드포인트에 연결하지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const statusLabel =
    health.status === "UP"
      ? "정상"
      : health.status === "DOWN"
      ? "장애 / 응답 없음"
      : "확인 전";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>시스템 상태</h2>
          <p className={styles.headerSub}>
            채용 과제 API 서버의 health-check 결과를 기반으로 현재 시스템
            상태를 확인합니다.
          </p>
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? "확인 중..." : "상태 다시 확인"}
          </button>
        </div>
      </div>

      {/* 상단 */}
      <div className={styles.topRow}>
        {/* 전체 */}
        <div className={`${styles.card} ${styles.mainStatusCard}`}>
          <div className={styles.mainStatusRow}>
            <div>
              <div className={styles.mainStatusLabel}>API 서버 상태</div>
              <div className={styles.mainStatusValue}>{statusLabel}</div>
            </div>

            <div className={styles.mainStatusIconWrap}>
              {health.status === "UP" && (
                <span className={`${styles.statusIcon} ${styles.iconUp}`}>
                  ✅
                </span>
              )}
              {health.status === "DOWN" && (
                <span className={`${styles.statusIcon} ${styles.iconDown}`}>
                  ❌
                </span>
              )}
              {health.status === "UNKNOWN" && (
                <span className={`${styles.statusIcon} ${styles.iconUnknown}`}>
                  ⏱
                </span>
              )}
            </div>
          </div>

          <div className={styles.mainStatusMeta}>
            <div>
              <span className={styles.metaLabel}>마지막 점검 시각</span>
              <span className={styles.metaValue}>
                {health.lastCheckedAt
                  ? new Date(health.lastCheckedAt).toLocaleString("ko-KR")
                  : "-"}
              </span>
            </div>
            <div>
              <span className={styles.metaLabel}>응답 시간</span>
              <span className={styles.metaValue}>
                {health.responseTimeMs != null
                  ? `${health.responseTimeMs} ms`
                  : "-"}
              </span>
            </div>
          </div>

          {health.errorMessage && (
            <p className={styles.errorMessage}>{health.errorMessage}</p>
          )}
        </div>

        {/* 안내 */}
        <div className={`${styles.card} ${styles.infoCard}`}>
          <div className={styles.infoTitle}>안내</div>
          <p className={styles.infoText}>
            • health-check API는 <code>/health</code> 엔드포인트를 통해
            상태를 확인합니다.
          </p>
          <p className={styles.infoText}>
            • 채용 전용 API 서버는 read-only 환경으로, 실제 운영 환경에 비해
            확인 가능한 항목이 제한되어 있습니다.
          </p>
          <p className={styles.infoText}>
            • 이 페이지에서는 health-check 결과를 중심으로 간단한 모니터링
            UI를 구성하였습니다.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.detailCard}`}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3 className={styles.sectionTitle}>API 상태 상세</h3>
              <p className={styles.sectionSub}>
                핵심 엔드포인트들의 상태를 논리적으로 그룹지어 표시합니다.
              </p>
            </div>
          </div>

          <ul className={styles.statusList}>
            <li>
              <span className={styles.statusName}>거래 내역 API</span>
              <span
                className={`${styles.statusBadge} ${
                  health.status === "UP"
                    ? styles.badgeUp
                    : styles.badgeDegraded
                }`}
              >
                {health.status === "UP" ? "정상" : "확인 필요"}
              </span>
              <span className={styles.statusDesc}>
                <code>/api/v1/payments/list</code> – 거래 내역 조회
              </span>
            </li>
            <li>
              <span className={styles.statusName}>가맹점 API</span>
              <span
                className={`${styles.statusBadge} ${
                  health.status === "UP"
                    ? styles.badgeUp
                    : styles.badgeDegraded
                }`}
              >
                {health.status === "UP" ? "정상" : "확인 필요"}
              </span>
              <span className={styles.statusDesc}>
                <code>/api/v1/merchants/*</code> – 가맹점 목록/상세 조회
              </span>
            </li>
            <li>
              <span className={styles.statusName}>공통 코드 API</span>
              <span
                className={`${styles.statusBadge} ${
                  health.status === "UP"
                    ? styles.badgeUp
                    : styles.badgeDegraded
                }`}
              >
                {health.status === "UP" ? "정상" : "확인 필요"}
              </span>
              <span className={styles.statusDesc}>
                <code>/api/v1/common/*</code> – 결제/가맹점 상태 코드 조회
              </span>
            </li>
          </ul>
        </div>

        {/* 모니터 */}
        <div className={`${styles.card} ${styles.detailCard}`}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3 className={styles.sectionTitle}>모니터링 메모</h3>
              <p className={styles.sectionSub}>
                실제 운영 환경이라면 추가로 확인할만한 모니터링 항목들입니다.
              </p>
            </div>
          </div>

          <ul className={styles.memoList}>
            <li>
              <span className={styles.memoIcon}>📈</span>
              <div>
                <div className={styles.memoTitle}>응답 시간 추이</div>
                <div className={styles.memoText}>
                  health-check 응답 시간(ms)을 주기적으로 수집하여
                  그래프로 시각화할 수 있습니다.
                </div>
              </div>
            </li>
            <li>
              <span className={styles.memoIcon}>📊</span>
              <div>
                <div className={styles.memoTitle}>에러 비율</div>
                <div className={styles.memoText}>
                  결제/가맹점 API별 4xx/5xx 비율을 모니터링하여 장애
                  전조를 조기에 탐지합니다.
                </div>
              </div>
            </li>
            <li>
              <span className={styles.memoIcon}>🔔</span>
              <div>
                <div className={styles.memoTitle}>알림 연동</div>
                <div className={styles.memoText}>
                  장애 발생 시 Slack / 이메일 / SMS 등으로 알림을 발송하는
                  구조를 설계할 수 있습니다.
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerNote}>
        현재 health-check 기준 상태:{" "}
        <strong>
          {health.status === "UP"
            ? "UP (정상)"
            : health.status === "DOWN"
            ? "DOWN (장애 또는 응답 없음)"
            : "UNKNOWN"}
        </strong>
      </div>
    </div>
  );
}