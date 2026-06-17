import { AdminLayout } from "./components/layout/AdminLayout";

function App() {
  return (
    <AdminLayout>
      {(currentTab) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🏗️</div>
            <p className="text-slate-500 font-medium"> Khuôn đã dựng xong thành công!</p>
            <h3 className="text-xl font-bold mt-1 text-brand-emerald">
              Tab hiện tại đang kích hoạt: <span className="underline text-brand-yellow-container bg-brand-primary px-3 py-1 rounded-md">{currentTab}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2">Sẵn sàng để đổ dữ liệu tính năng vào đây.</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default App;