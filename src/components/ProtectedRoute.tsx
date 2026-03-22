import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { MODULE_REGISTRY } from '../core/registry/modules';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { pathname } = useLocation();
  const userRole = user?.role?.toUpperCase?.() || '';
  
  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.map((role) => role.toUpperCase()).includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Enforcement of Granular Module/Page permissions for non-SuperAdmins
  if (userRole !== 'SUPERADMIN' && user.tenant) {
    const config = user.tenant.modules || { enabledModules: [], disabledPages: [] };
    const enabledModules = config.enabledModules || [];
    const disabledPages = config.disabledPages || [];
    const hasModuleConfig = Array.isArray(enabledModules) && enabledModules.length > 0;

    // Keep default behavior permissive when no module configuration has been assigned yet.
    if (!hasModuleConfig) {
      return <Outlet />;
    }

    // Check if the current path matches a managed page
    for (const mod of MODULE_REGISTRY) {
      const match = mod.pages.find(pg => pathname.startsWith(pg.path));
      if (match) {
        // 1. If entire module is disabled
        if (!enabledModules.includes(mod.id)) {
          return <Navigate to="/admin/dashboard" replace />;
        }
        // 2. If specific page is disabled
        if (disabledPages.includes(match.id)) {
          return <Navigate to="/admin/dashboard" replace />;
        }
        break;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
