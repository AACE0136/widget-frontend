import Header from '../components/Header';

export default function WidgetScannerPage() {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Header />
      <main className="max-w-[1920px] mx-auto px-6 py-8 bg-[#F6F6F6]">
        {/* Main content will go here */}
        <div className="bg-white rounded-lg shadow-sm py-12 px-16">
          <p className="text-[#1E1E1E] text-2xl">PBI External Widget Checker</p>
        </div>
      </main>
    </div>
  );
}
