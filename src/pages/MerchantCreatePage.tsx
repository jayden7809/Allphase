import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent, ChangeEvent } from "react";
import styles from "./MerchantCreatePage.module.css";

interface MerchantForm {
  mchtCode: string;
  name: string;
  bizNo: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  settlementCycle: string;
  memo: string;
}

export default function MerchantCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<MerchantForm>({
    mchtCode: "",
    name: "",
    bizNo: "",
    status: "ACTIVE",
    contactEmail: "",
    contactPhone: "",
    settlementCycle: "DAILY",
    memo: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubmitted(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ⚠️ 실제 서버 요청 대신 Mock 동작
    // 여기서는 단순히 "등록 완료" 메시지만 표시
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>가맹점 등록 (Mock)</h2>
          <p className={styles.headerSub}>
            실제 등록 API 연동 없이, 가맹점 등록 UX만 확인할 수 있는 MockUp 화면입니다.
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badgeMock}>Mock 화면</span>
          {/* <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate("/merchants")}
          >
            가맹점 목록으로
          </button> */}
        </div>
      </div>

      {/* 안내 */}
      <div className={styles.notice}>
        이 화면은 <strong>등록/수정 UX를 보여주기 위한 Mock 페이지</strong>이며,
        실제로 서버로 데이터가 전송되지는 않습니다.
      </div>

      {/* 폼 카드 */}
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label className={styles.label}>
              가맹점 코드 <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              name="mchtCode"
              value={form.mchtCode}
              onChange={handleChange}
              placeholder="예: MCHT-ONLINE-001"
              required
            />
            <p className={styles.helper}>
              내부 식별용 가맹점 코드입니다. 중복되지 않게 관리됩니다.
            </p>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>
              상호명 <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="예: 올페이즈 스토어"
              required
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>사업자 번호</label>
            <input
              className={styles.input}
              name="bizNo"
              value={form.bizNo}
              onChange={handleChange}
              placeholder="예: 123-45-67890"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>가맹점 상태</label>
            <select
              className={styles.select}
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">운영 중</option>
              <option value="INACTIVE">중지</option>
              <option value="PENDING">준비 중</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>정산 이메일</label>
            <input
              className={styles.input}
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="예: settlement@merchant.com"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>연락처</label>
            <input
              className={styles.input}
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="예: 010-1234-5678"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>정산 주기</label>
            <select
              className={styles.select}
              name="settlementCycle"
              value={form.settlementCycle}
              onChange={handleChange}
            >
              <option value="DAILY">일 정산</option>
              <option value="WEEKLY">주 정산</option>
              <option value="MONTHLY">월 정산</option>
            </select>
          </div>

          <div className={styles.formRowFull}>
            <label className={styles.label}>메모</label>
            <textarea
              className={styles.textarea}
              name="memo"
              value={form.memo}
              onChange={handleChange}
              placeholder="가맹점 특이사항, 정산 유의사항 등을 기록합니다."
              rows={4}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate(-1)}
          >
            돌아가기
          </button>
          <button type="submit" className={styles.primaryBtn}>
            등록 (Mock)
          </button>
        </div>

        {submitted && (
          <div className={styles.successMessage}>
            ✅ 실제 서버 요청 없이, Mock 데이터 기준으로 가맹점 등록이 완료된
            것으로 가정합니다.
          </div>
        )}
      </form>
    </div>
  );
}