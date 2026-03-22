import { configureStore } from '@reduxjs/toolkit';
import superadminReducer from '../modules/superadmin/store/superadminSlice';
import authReducer from './slices/authSlice';
//import realestateReducer from '../modules/realestate/realestateSlice';
import tenantAdminReducer from '../modules/tenant-admin/tenantAdminSlice';
import tenantAdminUsersReducer from '../modules/tenant-admin/store/usersSlice';
import agentReducer from '../modules/agent/store/agentSlice';
import managerReducer from '../modules/sales-manager/store/salesSlice';
import hrReducer from '../modules/hr/store/hrSlice';
import financeReducer from '../modules/finance/store/financeSlice';

import communicationReducer from './slices/communicationSlice';

export const store = configureStore({
    reducer: {
        superadmin: superadminReducer,
        auth: authReducer,
        // realestate: realestateReducer,
        tenantAdmin: tenantAdminReducer,
        tenantAdminUsers: tenantAdminUsersReducer,
        agent: agentReducer,
        sales: managerReducer,
        hr: hrReducer,
        finance: financeReducer,
        communication: communicationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;