import { NavLink } from "react-router-dom";
import { Pencil, BarChart3 } from "lucide-react";

const tabs = [
    { to: "editar", label: "Editar", icon: Pencil },
    { to: "metricas", label: "Métricas", icon: BarChart3 },
];

export function TabBar() {
    return (
        <nav className="sticky bottom-0 flex border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-50">
            {tabs.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${isActive ? "text-[#2563eb] font-semibold" : "text-slate-500 hover:text-slate-800"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="absolute top-0 left-[30%] right-[30%] h-0.5 rounded-full bg-[#2563eb]" />
                            )}
                            <Icon size={19} />
                            <span className="text-[11px]">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
