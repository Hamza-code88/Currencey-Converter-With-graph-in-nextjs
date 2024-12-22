import CurrencyConverter from './components/Converter';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-blue-50 ">
      <div className="flex justify-center items-center gap-8 px-6 py-12 flex-col sm:flex-row ">
        {/* Currency Converter Component */}
        <div className=" ">
          <CurrencyConverter />
        </div>
      </div>
    </div>
  );
}
