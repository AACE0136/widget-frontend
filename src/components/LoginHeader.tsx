import widget from '../assets/widget-logo.svg';

export default function LoginHeader() {
  return (
    <header className="bg-white ">
      <div className="flex justify-center items-centermax-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <img src={widget} alt="Affine Logo" className="h-10" />
          <div className="border-l border-gray-300 h-10"></div>
          <div className="text-base font-semibold text-black italic m-0">
            PBI Widget Tool
          </div>
        </div>
      </div>
    </header>
  );
}
