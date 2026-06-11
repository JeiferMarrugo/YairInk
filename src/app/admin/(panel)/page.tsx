import Image from "next/image";
import { Suspense } from "react";
import AdminTopBar from "@/components/admin/AdminTopBar";
import DashboardWelcome from "@/components/admin/DashboardWelcome";
import ScheduleCard from "@/components/admin/ScheduleCard";
import {
  AppointmentTrendsChart,
  RevenueAreaChart,
} from "@/components/admin/DashboardCharts";
import {
  getAppointmentTrends,
  getDashboardDateLabel,
  getDashboardMetrics,
  getRecentActivity,
  getRevenueTrends,
  getTodaySchedule,
} from "@/lib/admin-dashboard";
import { getPublicContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    { images },
    metrics,
    recentActivity,
    todaySchedule,
    appointmentTrends,
    revenueTrends,
  ] = await Promise.all([
    getPublicContent(),
    getDashboardMetrics(),
    getRecentActivity(),
    getTodaySchedule(),
    getAppointmentTrends(),
    getRevenueTrends(),
  ]);

  const dateLabel = getDashboardDateLabel();

  return (
    <>
      <Suspense fallback={null}>
        <DashboardWelcome />
      </Suspense>
      <AdminTopBar searchPlaceholder="Buscar clientes..." />
      <main className="flex-1 overflow-y-auto bg-off-white p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl">Resumen del Taller</h1>
          <p className="mt-1 text-sm capitalize text-black/50">{dateLabel}</p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <MetricCard
            label="INGRESOS TOTALES"
            value={metrics.revenue.value}
            detail={metrics.revenue.detail}
            highlight
          />
          <MetricCard
            label="CITAS ESTA SEMANA"
            value={metrics.appointments.value}
            detail={metrics.appointments.detail}
          />
          <MetricCard
            label="NUEVOS CLIENTES"
            value={metrics.newClients.value}
            detail={metrics.newClients.detail}
          />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="border border-black/10 bg-white p-6 lg:col-span-2">
            <h2 className="font-serif text-xl">Tendencias de Citas</h2>
            <p className="mt-1 text-[10px] text-black/40">
              Consultas vs sesiones — últimos 7 días
            </p>
            <div className="mt-4">
              <AppointmentTrendsChart data={appointmentTrends} />
            </div>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <h2 className="font-serif text-xl">Actividad Reciente</h2>
            {recentActivity.length === 0 ? (
              <p className="mt-6 text-xs text-black/40">
                Aún no hay actividad registrada.
              </p>
            ) : (
              <ul className="mt-6 space-y-5">
                {recentActivity.map((item) => (
                  <li key={item.id} className="border-b border-black/5 pb-4">
                    <p className="text-xs font-medium">{item.title}</p>
                    <p className="mt-1 text-[10px] text-black/50">{item.detail}</p>
                    <p className="mt-1 text-[9px] text-black/30">{item.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-8 border border-black/10 bg-white p-6">
          <h2 className="font-serif text-xl">Evolución de Ingresos</h2>
          <p className="mt-1 text-[10px] text-black/40">
            Suma por mes según última sesión de clientes
          </p>
          <div className="mt-4">
            {revenueTrends.length === 0 ? (
              <p className="text-xs text-black/40">
                Sin datos de ingresos todavía.
              </p>
            ) : (
              <RevenueAreaChart data={revenueTrends} />
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl">Agenda de Hoy</h2>
            <span className="text-[9px] tracking-[0.15em] text-black/40">
              {todaySchedule.length}{" "}
              {todaySchedule.length === 1 ? "CITA" : "CITAS"}
            </span>
          </div>
          {todaySchedule.length === 0 ? (
            <p className="text-sm text-black/45">
              No hay citas confirmadas ni pendientes para hoy.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {todaySchedule.map((item) => (
                <ScheduleCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>

        <div className="relative aspect-[21/7] w-full overflow-hidden">
          <Image
            src={images.studio}
            alt="Estudio YAIRINK"
            fill
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 px-6 text-center text-white">
            <blockquote className="max-w-2xl font-serif text-xl italic md:text-2xl">
              &ldquo;El arte es la intersección de la precisión clínica y la
              emoción humana.&rdquo;
            </blockquote>
            <p className="mt-4 text-[10px] tracking-[0.2em] text-white/60">
              — EL MANIFIESTO DEL TALLER
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function MetricCard({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: string;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border border-black/10 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${
        highlight ? "bg-beige" : "bg-white"
      }`}
    >
      <p className="text-[9px] tracking-[0.15em] text-black/50">{label}</p>
      <p className="mt-2 font-serif text-2xl sm:text-3xl">{value}</p>
      <p className="mt-2 text-[10px] text-black/40">{detail}</p>
    </div>
  );
}
