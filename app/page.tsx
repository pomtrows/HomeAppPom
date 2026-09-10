import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { StocksWidget } from "@/components/widgets/StocksWidget";
import { GasStationWidget } from "@/components/widgets/GasStationWidget";
import { ShoppingWidget } from "@/components/widgets/ShoppingWidget";
import { MealsWidget } from "@/components/widgets/MealsWidget";
import { LinksWidget } from "@/components/widgets/LinksWidget";
import { fmtFullDate } from "@/lib/format";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-[-0.02em]">Maison</h1>
        <p className="text-sm text-muted mt-1 capitalize">
          {fmtFullDate(new Date())}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <WeatherWidget />
        <ShoppingWidget />
        <MealsWidget />
        <StocksWidget />
        <GasStationWidget />
        <LinksWidget />
      </div>
    </div>
  );
}
