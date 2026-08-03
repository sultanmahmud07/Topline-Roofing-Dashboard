import { IUser } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { FiLogOut, FiUser, FiMap, FiBriefcase, FiSettings, FiLayers, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import defaultUserPic from '../../assets/images/default/default-user.png';
import { authApi, useLogoutMutation } from "@/redux/features/auth/auth.api";
import { useAppDispatch } from "@/redux/hook";
import { Box, ChartNoAxesCombined } from "lucide-react";

type Props = {
    userInfo?: IUser | null;
};

const UserProfileMenu: React.FC<Props> = ({ userInfo = null }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const [logout] = useLogoutMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        function handleDocClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleDocClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleDocClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    const displayName = userInfo?.name ?? userInfo?.email?.split?.("@")[0] ?? "Guest";

    const handleSignOut = async () => {
        await logout(undefined);
        dispatch(authApi.util.resetApiState());
        navigate("/login");
    };

    // Shared styling classes for menu items to keep code clean and consistent
    const menuItemClass = "flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";

    return (
        <div ref={ref} className="relative inline-block text-left">
            {/* Trigger */}
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer focus:outline-none transition 
                ${open 
                    ? "ring-1 ring-offset-1 ring-primary dark:ring-offset-gray-900" 
                    : "hover:ring-1 hover:ring-offset-1 hover:ring-primary/20 dark:hover:ring-primary/40"
                }`}
            >
                {/* avatar */}
                <div className="w-10 md:w-12 h-10 md:h-12 border border-primary rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {userInfo?.picture ? (
                        <img src={defaultUserPic} alt={displayName} width={100} height={100} className="w-full h-full object-cover" />
                    ) : (
                        <img src={defaultUserPic} alt={displayName} className="w-full h-full object-cover" />
                    )}
                </div>
                <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                </svg>
            </button>

            {/* Dropdown */}
            <div
                role="menu"
                aria-hidden={!open}
                className={`absolute right-0 mt-2 w-64 rounded bg-white dark:bg-gray-800 shadow-lg dark:ring-1 ring-black ring-opacity-5 dark:ring-gray-700 z-50 transform transition-all origin-top-right 
                ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
            >
                {/* header showing avatar + name */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
                            <img src={defaultUserPic} alt={displayName} className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo?.email ?? ""}</div>
                        </div>
                    </div>
                </div>

                {/* menu items */}
                <div className="py-1">
                    {/* --- 1. COMMON LINKS --- */}
                    {(userInfo?.role === "SENDER" || userInfo?.role === "RECEIVER") && (
                        <Link to="/track" className={menuItemClass} role="menuitem">
                            <FiMap className="w-4 h-4" />
                            Track Parcel
                        </Link>
                    )}

                    {/* --- 2. SENDER LINKS --- */}
                    {userInfo?.role === "SENDER" && (
                        <>
                            <Link to="/sender/overview" className={menuItemClass} role="menuitem">
                                <ChartNoAxesCombined className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link to="/sender/parcels" className={menuItemClass} role="menuitem">
                                <Box className="w-4 h-4" />
                                My Parcel
                            </Link>
                        </>
                    )}

                    {/* --- 3. RECEIVER LINKS --- */}
                    {userInfo?.role === "RECEIVER" && (
                        <>
                            <Link to="/receiver/overview" className={menuItemClass} role="menuitem">
                                <FiLayers className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <Link to="/receiver/all-parcel" className={menuItemClass} role="menuitem">
                                <Box className="w-4 h-4" />
                                My Parcels
                            </Link>
                        </>
                    )}

                    {/* --- 4. ADMIN LINKS --- */}
                    {(userInfo?.role === "ADMIN" || userInfo?.role === "SUPER_ADMIN") && (
                        <>
                            <Link to="/admin" className={menuItemClass} role="menuitem">
                                <FiSettings className="w-4 h-4" />
                                Admin Dashboard
                            </Link>
                            <Link to="/admin/user/all" className={menuItemClass} role="menuitem">
                                <FiUsers className="w-4 h-4" />
                                Manage Users
                            </Link>
                            <Link to="/admin/parcels" className={menuItemClass} role="menuitem">
                                <FiBriefcase className="w-4 h-4" />
                                Manage Listings
                            </Link>
                            <Link to="/admin/profile" className={menuItemClass} role="menuitem">
                                <FiUser className="w-4 h-4" />
                                Profile
                            </Link>
                        </>
                    )}

                    {/* --- 5. LOGOUT --- */}
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                            onClick={handleSignOut}
                            className="w-full cursor-pointer text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            role="menuitem"
                            type="button"
                        >
                            <FiLogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileMenu;