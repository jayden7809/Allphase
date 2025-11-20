import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import styles from "./MerchantEditPage.module.css";

interface MerchantForm {
  mchtCode: string;
  name: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  memo: string;
}

export default function MerchantEditPage() {
  const navigate = useNavigate();
  const { mchtCode } = useParams<{ mchtCode: string }>();

  const [form, setForm] = useState<MerchantForm>({
    mchtCode: "",
    name: "",
    status: "ACTIVE",
    contactEmail: "",
    contactPhone: "",
    memo: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // 실제 API 연동 대신, 라우트 파라미터 기반으로 Mock 초기 값 세팅
  useEffect(() => {
    if (mchtCode) {
      setForm({
        mchtCode,
        name: `Mock 가맹점 (${mchtCode})`,
        status: "ACTIVE",
        contactEmail: "mock-merchant@example.com",
        contactPhone: "010-0000-0000",
        memo: "이 화면은 가맹점 정보 수정 UX를 위한 Mock 페이지입니다.",
      });
    }
  }, [mchtCode]);

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
    // 실제 수정 요청 대신 Mock 동작
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>가맹점 정보 수정 (Mock)</h2>
          <p className={styles.headerSub}>
            {mchtCode ? `가맹점 코드: ${mchtCode}` : "가맹점 코드 정보 없음"}
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badgeMock}>Mock 화면</span>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() =>
              mchtCode
                ? navigate(`/merchants/${mchtCode}`)
                : navigate("/merchants")
            }
          >
            상세 페이지로 돌아가기
          </button>
        </div>
      </div>

      <div className={styles.notice}>
        이 화면은 <strong>가맹점 수정 흐름을 시연하기 위한 Mock 페이지</strong>입니다.
        실제로 서버 데이터는 변경되지 않습니다.
      </div>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formRow}>
            <label className={styles.label}>가맹점 코드</label>
            <input
              className={styles.input}
              name="mchtCode"
              value={form.mchtCode}
              readOnly
            />
            <p className={styles.helper}>
              가맹점 코드는 수정할 수 없습니다. (식별자)
            </p>
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>상호명</label>
            <input
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
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
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>연락처</label>
            <input
              className={styles.input}
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formRowFull}>
            <label className={styles.label}>메모</label>
            <textarea
              className={styles.textarea}
              name="memo"
              value={form.memo}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() =>
              mchtCode
                ? navigate(`/merchants/${mchtCode}`)
                : navigate("/merchants")
            }
          >
            취소
          </button>
          <button type="submit" className={styles.primaryBtn}>
            수정 내용 저장 (Mock)
          </button>
        </div>

        {submitted && (
          <div className={styles.successMessage}>
            ✅ 실제 서버 요청 없이, 수정된 정보가 저장된 것처럼 처리했습니다.
          </div>
        )}
      </form>
    </div>
  );
}