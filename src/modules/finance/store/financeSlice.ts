// src/modules/finance/store/financeSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { financeApi } from '../api/finance.api';

const th = <R,A=void>(name: string, fn: (a:A)=>Promise<R>) =>
  createAsyncThunk<R,A>(`finance/${name}`, fn);

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchDashboard       = th('dashboard',       async () => (await financeApi.get('/dashboard')).data.data);
export const fetchInstallments    = th<any,any>('installments',   async(p) => (await financeApi.get('/installments',{params:p})).data.data);
export const doPayInstallment     = th<any,any>('payInstall',     async({id,...b}) => (await financeApi.put(`/installments/${id}/pay`,b)).data.data);
export const fetchPayments        = th<any,any>('payments',       async(p) => (await financeApi.get('/payments',{params:p})).data.data);
export const doCreatePayment      = th<any,any>('createPayment',  async(b) => (await financeApi.post('/payments',b)).data.data);
export const fetchInvoices        = th<any,any>('invoices',       async(p) => (await financeApi.get('/invoices',{params:p})).data.data);
export const doCreateInvoice      = th<any,any>('createInvoice',  async(b) => (await financeApi.post('/invoices',b)).data.data);
export const fetchReceipts        = th<any,any>('receipts',       async(p) => (await financeApi.get('/receipts',{params:p})).data.data);
export const fetchCommissions     = th<any,any>('commissions',    async(p) => (await financeApi.get('/commissions',{params:p})).data.data);
export const doCreateCommission   = th<any,any>('createComm',     async(b) => (await financeApi.post('/commissions',b)).data.data);
export const doApproveCommission  = th<any,string>('approveComm', async(id) => (await financeApi.put(`/commissions/${id}/approve`)).data.data);
export const doPayCommission      = th<any,any>('payComm',        async({id,...b}) => (await financeApi.put(`/commissions/${id}/pay`,b)).data.data);
export const fetchExpenseCategories=th<any[],void>('expCats',     async() => (await financeApi.get('/expense-categories')).data.data);
export const fetchExpenses        = th<any,any>('expenses',       async(p) => (await financeApi.get('/expenses',{params:p})).data.data);
export const doCreateExpense      = th<any,any>('createExpense',  async(b) => (await financeApi.post('/expenses',b)).data.data);
export const doApproveExpense     = th<any,string>('approveExp',  async(id) => (await financeApi.put(`/expenses/${id}/approve`)).data.data);
export const fetchVendorPayments  = th<any,any>('vendorPay',      async(p) => (await financeApi.get('/vendor-payments',{params:p})).data.data);
export const doCreateVendorPayment= th<any,any>('createVendorPay',async(b) => (await financeApi.post('/vendor-payments',b)).data.data);
export const doProcessVendorPayment=th<any,any>('processVendorPay',async({id,...b}) => (await financeApi.put(`/vendor-payments/${id}/process`,b)).data.data);
export const fetchBankAccounts    = th<any[],void>('bankAccounts',  async() => (await financeApi.get('/bank-accounts')).data.data);
export const doCreateBankAccount  = th<any,any>('createBank',     async(b) => (await financeApi.post('/bank-accounts',b)).data.data);
export const fetchBankTxs         = th<any,any>('bankTxs',        async(p) => (await financeApi.get('/bank-transactions',{params:p})).data.data);

// ── State ─────────────────────────────────────────────────────────────────────
interface FinanceState {
  dashboard        : any;
  installments     : { data:any[]; total:number };
  payments         : { data:any[]; total:number };
  invoices         : { data:any[]; total:number };
  receipts         : { data:any[]; total:number };
  commissions      : { data:any[]; total:number };
  expenseCategories: any[];
  expenses         : { data:any[]; total:number };
  vendorPayments   : { data:any[]; total:number };
  bankAccounts     : any[];
  bankTransactions : { data:any[]; total:number };
  loading          : Record<string,boolean>;
  error            : string|null;
}
const init: FinanceState = {
  dashboard:null, installments:{data:[],total:0}, payments:{data:[],total:0},
  invoices:{data:[],total:0}, receipts:{data:[],total:0}, commissions:{data:[],total:0},
  expenseCategories:[], expenses:{data:[],total:0}, vendorPayments:{data:[],total:0},
  bankAccounts:[], bankTransactions:{data:[],total:0}, loading:{}, error:null,
};

const financeSlice = createSlice({
  name:'finance', initialState:init,
  reducers:{ clearError: s => { s.error = null; } },
  extraReducers: b => {
    const pend=(k:string)=>(s:FinanceState)=>{s.loading[k]=true;s.error=null;};
    const fail=(k:string)=>(s:FinanceState,a:any)=>{s.loading[k]=false;s.error=a.error.message??'Error';};
    b
      .addCase(fetchDashboard.pending,   pend('dashboard'))
      .addCase(fetchDashboard.fulfilled, (s,a)=>{s.loading.dashboard=false;s.dashboard=a.payload;})
      .addCase(fetchDashboard.rejected,  fail('dashboard'))
      .addCase(fetchInstallments.pending,   pend('installments'))
      .addCase(fetchInstallments.fulfilled, (s,a)=>{s.loading.installments=false;s.installments=a.payload;})
      .addCase(doPayInstallment.fulfilled,  (s,a)=>{const x=a.payload as any;const i=s.installments.data.findIndex(d=>d.id===x.id);if(i!==-1)s.installments.data[i]=x;})
      .addCase(fetchPayments.pending,   pend('payments'))
      .addCase(fetchPayments.fulfilled, (s,a)=>{s.loading.payments=false;s.payments=a.payload;})
      .addCase(doCreatePayment.fulfilled,(s,a)=>{s.payments.data.unshift(a.payload);s.payments.total++;})
      .addCase(fetchInvoices.pending,   pend('invoices'))
      .addCase(fetchInvoices.fulfilled, (s,a)=>{s.loading.invoices=false;s.invoices=a.payload;})
      .addCase(doCreateInvoice.fulfilled,(s,a)=>{s.invoices.data.unshift(a.payload);s.invoices.total++;})
      .addCase(fetchReceipts.pending,   pend('receipts'))
      .addCase(fetchReceipts.fulfilled, (s,a)=>{s.loading.receipts=false;s.receipts=a.payload;})
      .addCase(fetchCommissions.pending,   pend('commissions'))
      .addCase(fetchCommissions.fulfilled, (s,a)=>{s.loading.commissions=false;s.commissions=a.payload;})
      .addCase(doCreateCommission.fulfilled,(s,a)=>{s.commissions.data.unshift(a.payload);s.commissions.total++;})
      .addCase(doApproveCommission.fulfilled,(s,a)=>{const x=a.payload as any;const i=s.commissions.data.findIndex(d=>d.id===x.id);if(i!==-1)s.commissions.data[i]=x;})
      .addCase(doPayCommission.fulfilled,(s,a)=>{const x=a.payload as any;const i=s.commissions.data.findIndex(d=>d.id===x.id);if(i!==-1)s.commissions.data[i]=x;})
      .addCase(fetchExpenseCategories.fulfilled,(s,a)=>{s.expenseCategories=a.payload;})
      .addCase(fetchExpenses.pending,   pend('expenses'))
      .addCase(fetchExpenses.fulfilled, (s,a)=>{s.loading.expenses=false;s.expenses=a.payload;})
      .addCase(doCreateExpense.fulfilled,(s,a)=>{s.expenses.data.unshift(a.payload);s.expenses.total++;})
      .addCase(doApproveExpense.fulfilled,(s,a)=>{const x=a.payload as any;const i=s.expenses.data.findIndex(d=>d.id===x.id);if(i!==-1)s.expenses.data[i]=x;})
      .addCase(fetchVendorPayments.pending,   pend('vendorPayments'))
      .addCase(fetchVendorPayments.fulfilled, (s,a)=>{s.loading.vendorPayments=false;s.vendorPayments=a.payload;})
      .addCase(doCreateVendorPayment.fulfilled,(s,a)=>{s.vendorPayments.data.unshift(a.payload);s.vendorPayments.total++;})
      .addCase(doProcessVendorPayment.fulfilled,(s,a)=>{const x=a.payload as any;const i=s.vendorPayments.data.findIndex(d=>d.id===x.id);if(i!==-1)s.vendorPayments.data[i]=x;})
      .addCase(fetchBankAccounts.fulfilled,(s,a)=>{s.bankAccounts=a.payload;})
      .addCase(doCreateBankAccount.fulfilled,(s,a)=>{s.bankAccounts.push(a.payload);})
      .addCase(fetchBankTxs.pending,   pend('bankTxs'))
      .addCase(fetchBankTxs.fulfilled, (s,a)=>{s.loading.bankTxs=false;s.bankTransactions=a.payload;});
  },
});
export const { clearError } = financeSlice.actions;
export default financeSlice.reducer;
