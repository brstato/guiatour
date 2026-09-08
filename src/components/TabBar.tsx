import { NavLink } from "react-router-dom";
import { Pencil, BarChart3 } from "lucide-react";

const tabs = [
    { to: "editar", label: "Editar", icon: Pencil },
    { to: "metricas", label: "Métricas", icon: BarChart3 },
];

export function TabBar() {
    return (
        <nav className="sticky bottom-0 flex border-t border-slate-800 bg-[#0f1428] z-50">
            {tabs.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                        `relative flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors ${isActive ? "text-orange-500" : "text-slate-400"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="absolute top-0 left-[30%] right-[30%] h-0.5 rounded-full bg-orange-500" />
                            )}
                            <Icon size={19} />
                            <span className="text-[11px] font-medium">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
}
