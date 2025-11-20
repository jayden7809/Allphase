import { NavLink, Outlet } from "react-router-dom";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>PG</div>
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>올페이즈 대시보드</div>
            <div className={styles.logoSub}>Payment Gateway Admin</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>메인</p>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            대시보드
          </NavLink>

          <p className={styles.navSection}>거래 관리</p>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            거래 내역
          </NavLink>

          <p className={styles.navSection}>가맹점</p>
          <NavLink
            to="/merchants"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            가맹점 목록
          </NavLink>

          <p className={styles.navSection}>시스템</p>
          <NavLink
            to="/common-codes"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            공통 코드
          </NavLink>
          <NavLink
            to="/health"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.active}`
                : styles.navItem
            }
          >
            시스템 상태
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.footerTitle}>올페이즈</span>
          <span className={styles.footerSub}>
            © 2025 All rights reserved.
          </span>
        </div>
      </aside>

      {/* 메인 컨텐츠 영역 */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
