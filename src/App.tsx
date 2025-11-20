// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import MerchantsPage from "./pages/MerchantsPage";
import MerchantDetailPage from "./pages/MerchantDetailPage";
import CommonCodesPage from "./pages/CommonCodesPage";
import HealthPage from "./pages/HealthPage";
import MerchantCreatePage from "./pages/MerchantCreatePage";
import MerchantEditPage from "./pages/MerchantEditPage";
import TransactionDetailPage from "./pages/TransactionDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:paymentCode"element={<TransactionDetailPage />}/>
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/merchants/:mchtCode" element={<MerchantDetailPage />} />
          <Route path="/common-codes" element={<CommonCodesPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/merchants/new" element={<MerchantCreatePage />} />
          <Route path="/merchants/:mchtCode/edit" element={<MerchantEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
