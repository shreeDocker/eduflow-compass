import { statusMeta, type Subject } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";

export function MetroMap({ subject }: { subject: Subject }) {
  const stations = subject.chapters;

  return (
    <div className="card-elevated overflow-x-auto p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-bold font-display">{subject.name}</h3>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Academic Metro Line
        </span>
      </div>

      <div className="relative flex min-w-[560px] items-center gap-0 py-6">
        {stations.map((ch, i) => {
          const meta = statusMeta[ch.status];
          const isLast = i === stations.length - 1;
          return (
            <div key={ch.id} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center">
                <Link
                  to="/class/$id"
                  params={{ id: ch.id }}
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
                    ch.status === "teaching" ? "animate-station-pulse" : ""
                  }`}
                  style={{
                    backgroundColor: meta.token,
                    borderColor: "var(--background)",
                    boxShadow: "0 0 0 2px " + meta.token,
                  }}
                  aria-label={`${ch.title} — ${meta.label}`}
                />
                <div className="mt-3 max-w-[80px] text-center">
                  <p className="text-xs font-semibold leading-tight">{ch.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {meta.label}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div
                  className="mx-1 h-1 flex-1 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${meta.token}, ${
                      statusMeta[stations[i + 1].status].token
                    })`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
