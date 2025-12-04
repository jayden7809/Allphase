프로젝트 개요

본 프로젝트는 주요 데이터를 조회하고 시각화하는 관리자용 대시보드 웹 애플리케이션입니다.

요구사항에 따라 다음 기능을 구현했습니다.
	•	대시보드 화면
	•	거래 내역 리스트 화면
	•	가맹점 목록 / 상세
	•	공통 코드 조회
	•	시스템 상태 모니터링

모든 UI는 CSS Modules로 직접 디자인하였습니다.


주요 기능 설명

1.대시보드 (Dashboard)
	•	총 거래 금액 / 건수 / 상태별 성공·실패·취소·대기 요약
	•	결제 상태 비율 도넛 차트
	•	최근 일별 거래 금액 라인 차트
	•	최근 거래 리스트 (최신순)
	•	전체 레이아웃은 사이드바와 통일된 커스텀 UI 적용


2.거래 내역 페이지 (Transactions)
	•	/payments/list 기반 전체 거래 조회
	•	상태·결제유형·검색 필터
	•	금액 / 결제일시 컬럼 정렬 기능
	•	클릭 시 ASC/DESC 토글
	•	페이지당 표시 개수 선택 (10/20/30)
	•	최신순 정렬 기본 적용
	•	상세 페이지(/transactions/:paymentCode) 제공


3.가맹점 목록 / 상세 페이지

✔ 가맹점 목록
	•	코드/이름 검색
	•	상태 필터
	•	코드 순 정렬
	•	상태 배지 적용
	•	(Mock) “가맹점 등록” 버튼 제공

✔ 가맹점 상세
	•	/merchants/details/{mchtCode} 조회
	•	가맹점 기본 정보
	•	결제 상태 비율 도넛 차트
	•	최근 매출 라인 차트
	•	최근 거래 리스트
	•	“목록으로 돌아가기” 버튼 제공


4.공통 코드 페이지 (Common Codes)
	•	결제 상태 코드
	•	결제 수단 코드
	•	가맹점 상태 코드
	•	/common/** API 기반
	•	그룹별 카드 + 테이블 UI 구성


5.시스템 상태 페이지 (System Status)
	•	/health 엔드포인트 기반 상태 체크
		→ 현재 API 서버는 해당 엔드포인트가 비활성화되어 연결 실패 시 DOWN 상태로 표시되도록 처리
	•	서버 상태 / 응답 시간(ms) / 점검 시간 표시
	•	API 그룹별 상태 배지 표시
	•	실제 서비스 운영 환경을 고려한 UI 구성


사용 기술 (Tech Stack)

Frontend
	•	React 18
	•	TypeScript
	•	Vite
	•	React Router DOM
	•	Axios
	•	Recharts

Styling
	•	CSS Modules

디자인 의도 (UI/UX)

	•	좌측 사이드바는 딥 블루-그린 계열로 눈의 피로도를 줄이고 안정감 부여
	•	사이드바 Hover/Active는 주황색 계열로 시각적 포커스를 제공
	•	우측 메인 영역은 밝은회색 배경으로 가독성 향상
	•	모든 정보는 카드 기반 UI로 시각화
	•	성공/실패/취소 등 상태값은 색상 배지로 직관적으로 표현
	•	테이블은 최신 실무형 Admin Dashboard 스타일 참고하여 직접 설계

----------------------------------------------------
설치 및 실행 방법

✔ Node / npm 버전
	•	Node: 20.x LTS 필수
	•	npm: 10.x 이상

  터미널에서 확인:
  node -v
  npm -v

  설치
  npm install

  실행
  npm run dev

  접속:
http://localhost:5173


환경 변수 (.env)
선택적으로 다음과 같이 설정할 수 있습니다.
VITE_API_BASE_URL=https://recruit.paysbypays.com/api/v1
src/lib/api.ts 에서 자동으로 사용됩니다.

디렉터리 구조
src/
 ├── layout/
 │    ├── Layout.tsx
 │    └── layout.module.css
 │
 ├── pages/
 │    ├── DashboardPage.tsx
 │    ├── DashboardPage.module.css
 │    ├── TransactionsPage.tsx
 │    ├── TransactionsPage.module.css
 │    ├── MerchantsPage.tsx
 │    ├── MerchantsPage.module.css
 │    ├── MerchantDetailPage.tsx
 │    ├── MerchantDetailPage.module.css
 │    ├── CommonCodesPage.tsx
 │    ├── CommonCodesPage.module.css
 │    ├── HealthPage.tsx
 │    └── HealthPage.module.css
 │
 ├── lib/
 │    └── api.ts
 │
 └── main.tsx / App.tsx

 감사합니다. 🙏
