import React, { useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Card, Avatar,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Divider, InputAdornment, Tooltip, Badge
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, CloseOutlined, DownloadOutlined,
  VisibilityOutlined, VerifiedOutlined, PendingOutlined,
  FolderOutlined, PersonOutlined, CalendarMonthOutlined,
  CheckCircleOutlined, WarningAmberOutlined, StorageOutlined
} from '@mui/icons-material';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const FONT = "'Cormorant Garamond', 'Georgia', serif";
const BODY = "'Mulish', 'system-ui', sans-serif";

// ─── Types ─────────────────────────────────────────────────────────────────────
type DocType = 'Aadhar' | 'PAN' | 'Offer Letter' | 'Contract' | 'ID Card' | 'Certificate' | 'Resume';

interface EmpDoc {
  id: string; empId: string; empName: string; dept: string;
  docType: DocType; fileName: string; uploadedOn: string;
  size: string; verified: boolean; version?: number;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const DOC_CFG: Record<DocType, { color: string; bg: string; emoji: string; label: string }> = {
  'Aadhar':      { color: '#2563eb', bg: '#eff6ff', emoji: '🪪', label: 'Aadhar Card' },
  'PAN':         { color: '#d97706', bg: '#fffbeb', emoji: '📄', label: 'PAN Card' },
  'Offer Letter':{ color: '#059669', bg: '#f0fdf4', emoji: '📝', label: 'Offer Letter' },
  'Contract':    { color: '#7c3aed', bg: '#f5f3ff', emoji: '📋', label: 'Contract' },
  'ID Card':     { color: '#0891b2', bg: '#ecfeff', emoji: '🎴', label: 'ID Card' },
  'Certificate': { color: '#be185d', bg: '#fdf2f8', emoji: '🏆', label: 'Certificate' },
  'Resume':      { color: '#374151', bg: '#f9fafb', emoji: '📑', label: 'Resume / CV' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const avatarBg = (n: string) => ['#be185d','#7c3aed','#059669','#d97706','#2563eb','#0891b2'][n.charCodeAt(0) % 6];
const initials  = (n: string) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const DOCS: EmpDoc[] = [
  { id:'D1',  empId:'EMP-001', empName:'Rahul Sharma',  dept:'Sales',     docType:'Aadhar',       fileName:'rahul_aadhar.pdf',          uploadedOn:'2024-03-05', size:'1.2 MB', verified:true,  version:1 },
  { id:'D2',  empId:'EMP-001', empName:'Rahul Sharma',  dept:'Sales',     docType:'PAN',          fileName:'rahul_pan.pdf',             uploadedOn:'2024-03-05', size:'0.8 MB', verified:true,  version:1 },
  { id:'D3',  empId:'EMP-001', empName:'Rahul Sharma',  dept:'Sales',     docType:'Offer Letter', fileName:'offer_letter_EMP001.pdf',   uploadedOn:'2024-02-28', size:'0.5 MB', verified:true,  version:2 },
  { id:'D4',  empId:'EMP-001', empName:'Rahul Sharma',  dept:'Sales',     docType:'Resume',       fileName:'rahul_resume_v2.pdf',       uploadedOn:'2024-03-01', size:'0.4 MB', verified:false, version:2 },
  { id:'D5',  empId:'EMP-002', empName:'Priya Mehta',   dept:'Sales',     docType:'Contract',     fileName:'contract_EMP002.pdf',       uploadedOn:'2023-06-20', size:'2.1 MB', verified:true,  version:1 },
  { id:'D6',  empId:'EMP-002', empName:'Priya Mehta',   dept:'Sales',     docType:'PAN',          fileName:'priya_pan.pdf',             uploadedOn:'2023-06-20', size:'0.7 MB', verified:false, version:1 },
  { id:'D7',  empId:'EMP-002', empName:'Priya Mehta',   dept:'Sales',     docType:'Aadhar',       fileName:'priya_aadhar.pdf',          uploadedOn:'2023-06-18', size:'1.1 MB', verified:true,  version:1 },
  { id:'D8',  empId:'EMP-003', empName:'Arjun Singh',   dept:'Sales',     docType:'Aadhar',       fileName:'arjun_aadhar.pdf',          uploadedOn:'2024-01-15', size:'1.0 MB', verified:true,  version:1 },
  { id:'D9',  empId:'EMP-003', empName:'Arjun Singh',   dept:'Sales',     docType:'Resume',       fileName:'arjun_cv.pdf',              uploadedOn:'2024-01-10', size:'0.6 MB', verified:false, version:1 },
  { id:'D10', empId:'EMP-004', empName:'Kavita Joshi',  dept:'HR',        docType:'Certificate',  fileName:'hr_cert_kavita.pdf',        uploadedOn:'2023-09-10', size:'3.2 MB', verified:false, version:1 },
  { id:'D11', empId:'EMP-004', empName:'Kavita Joshi',  dept:'HR',        docType:'Contract',     fileName:'kavita_contract.pdf',       uploadedOn:'2023-09-05', size:'1.8 MB', verified:true,  version:1 },
  { id:'D12', empId:'EMP-006', empName:'Sneha Patel',   dept:'Finance',   docType:'ID Card',      fileName:'sneha_id.pdf',              uploadedOn:'2023-11-05', size:'0.3 MB', verified:true,  version:1 },
  { id:'D13', empId:'EMP-006', empName:'Sneha Patel',   dept:'Finance',   docType:'Offer Letter', fileName:'offer_sneha.pdf',           uploadedOn:'2023-11-02', size:'0.5 MB', verified:true,  version:1 },
  { id:'D14', empId:'EMP-007', empName:'Vikram Das',    dept:'Sales',     docType:'Aadhar',       fileName:'vikram_aadhar.pdf',         uploadedOn:'2024-05-10', size:'0.9 MB', verified:false, version:1 },
];

// ─── Doc Card ──────────────────────────────────────────────────────────────────
const DocCard: React.FC<{ doc: EmpDoc; onVerify: (id: string) => void }> = ({ doc, onVerify }) => {
  const dc = DOC_CFG[doc.docType];
  return (
    <Card sx={{
      borderRadius: 4, border: '1px solid', borderColor: `${dc.color}20`,
      boxShadow: 'none', overflow: 'hidden', transition: 'all 0.2s',
      '&:hover': { boxShadow: `0 8px 28px ${dc.color}14`, transform: 'translateY(-2px)', borderColor: `${dc.color}50` }
    }}>
      <Box sx={{ height: 3, bgcolor: dc.color }} />
      <Box sx={{ p: 2.5 }}>
        {/* Top row */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
          <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            {dc.emoji}
          </Box>
          <Box flex={1} minWidth={0}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography sx={{ fontFamily: BODY, fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>{dc.label}</Typography>
              {doc.verified
                ? <Chip label="Verified" size="small" icon={<CheckCircleOutlined sx={{ fontSize: '11px !important', color: '#16a34a !important' }} />}
                    sx={{ fontSize: 9.5, height: 18, bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 800, fontFamily: BODY }} />
                : <Chip label="Pending" size="small" icon={<PendingOutlined sx={{ fontSize: '11px !important', color: '#d97706 !important' }} />}
                    sx={{ fontSize: 9.5, height: 18, bgcolor: '#fef9c3', color: '#92400e', fontWeight: 800, fontFamily: BODY }} />
              }
            </Stack>
            <Typography sx={{ fontFamily: BODY, fontSize: 11, color: '#9ca3af', mt: 0.2 }}>{doc.docType}</Typography>
          </Box>
        </Stack>

        {/* Employee */}
        <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
          <Avatar sx={{ width: 22, height: 22, bgcolor: avatarBg(doc.empName), fontSize: 9, fontWeight: 800 }}>{initials(doc.empName)}</Avatar>
          <Typography sx={{ fontSize: 11.5, fontFamily: BODY, fontWeight: 700, color: '#374151' }}>{doc.empName}</Typography>
          <Chip label={doc.dept} size="small" sx={{ fontSize: 9, height: 15, bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 700, fontFamily: BODY }} />
        </Stack>

        {/* File info */}
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#f9fafb', mb: 2 }}>
          <Typography sx={{ fontSize: 10.5, fontFamily: 'monospace', color: '#374151', fontWeight: 600 }} noWrap>{doc.fileName}</Typography>
          <Stack direction="row" justifyContent="space-between" mt={0.5}>
            <Typography sx={{ fontSize: 10, color: '#9ca3af', fontFamily: BODY }}>{doc.size}</Typography>
            <Stack direction="row" spacing={1}>
              {doc.version && doc.version > 1 && (
                <Typography sx={{ fontSize: 10, color: '#7c3aed', fontFamily: BODY, fontWeight: 700 }}>v{doc.version}</Typography>
              )}
              <Typography sx={{ fontSize: 10, color: '#9ca3af', fontFamily: BODY }}>
                {new Date(doc.uploadedOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1}>
          <Button size="small" fullWidth startIcon={<VisibilityOutlined sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, border: '1px solid #e5e7eb', borderRadius: 2, color: '#374151', '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
            View
          </Button>
          <Button size="small" fullWidth startIcon={<DownloadOutlined sx={{ fontSize: 14 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, border: `1px solid ${dc.color}40`, borderRadius: 2, color: dc.color, bgcolor: dc.bg, '&:hover': { filter: 'brightness(0.96)' } }}>
            Download
          </Button>
        </Stack>
        {!doc.verified && (
          <Button size="small" fullWidth startIcon={<VerifiedOutlined sx={{ fontSize: 14 }} />}
            onClick={() => onVerify(doc.id)}
            sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, fontSize: 11.5, mt: 1, border: '1px solid #86efac', borderRadius: 2, color: '#16a34a', '&:hover': { bgcolor: '#f0fdf4' } }}>
            Mark as Verified
          </Button>
        )}
      </Box>
    </Card>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const DocumentsPage: React.FC = () => {
  const [docs, setDocs]             = useState<EmpDoc[]>(DOCS);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [empFilter, setEmpFilter]   = useState('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newDoc, setNewDoc]         = useState<Partial<EmpDoc>>({ docType: 'Aadhar', verified: false });
  const fileRef                     = useRef<HTMLInputElement>(null);

  const employees = useMemo(() => [...new Set(docs.map(d => d.empName))], [docs]);

  const filtered = useMemo(() => docs.filter(d =>
    (!search || d.empName.toLowerCase().includes(search.toLowerCase()) || d.fileName.toLowerCase().includes(search.toLowerCase()) || d.docType.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'ALL' || d.docType === typeFilter) &&
    (empFilter === 'ALL'  || d.empName === empFilter) &&
    (verifiedFilter === 'ALL' || (verifiedFilter === 'VERIFIED' ? d.verified : !d.verified))
  ), [docs, search, typeFilter, empFilter, verifiedFilter]);

  const stats = {
    total:    docs.length,
    verified: docs.filter(d => d.verified).length,
    pending:  docs.filter(d => !d.verified).length,
    employees: employees.length,
  };

  const verifyDoc = (id: string) => setDocs(p => p.map(d => d.id === id ? { ...d, verified: true } : d));

  const uploadDoc = () => {
    if (!newDoc.empName || !newDoc.docType) return;
    setDocs(p => [...p, {
      ...newDoc as EmpDoc,
      id: `D${Date.now()}`,
      fileName: `${newDoc.empName?.split(' ')[0].toLowerCase()}_${newDoc.docType?.toLowerCase().replace(' ','_')}.pdf`,
      uploadedOn: new Date().toISOString().split('T')[0],
      size: '—',
      version: 1,
    }]);
    setUploadOpen(false);
    setNewDoc({ docType: 'Aadhar', verified: false });
  };

  return (
    <Box sx={{ bgcolor: '#f8f7ff', minHeight: '100vh', pb: 8, fontFamily: BODY }}>

      {/* ── HEADER ── */}
      <Box sx={{
        px: { xs: 3, md: 5 }, pt: 5, pb: 4,
        background: 'linear-gradient(135deg, #0f0720 0%, #240f5c 55%, #0f0520 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: '#a78bfa12', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, borderRadius: '50%', bgcolor: '#c4b5fd08', pointerEvents: 'none' }} />
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-end' }} spacing={3}>
          <Box>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: 'white', letterSpacing: -1.5, lineHeight: 0.9 }}>Document</Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, color: '#c4b5fd' }}>Vault</Typography>
            <Typography sx={{ fontFamily: BODY, fontSize: 13, color: '#7c3aed60', mt: 1.5 }}>
              Secure S3 storage · Version control · HR verification
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setUploadOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, boxShadow: '0 4px 14px #7c3aed40' }}>
            Upload Document
          </Button>
        </Stack>

        {/* Stats */}
        <Grid container spacing={2} mt={3}>
          {[
            { label: 'Total Documents', value: stats.total,    color: '#c4b5fd', icon: <FolderOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Verified',        value: stats.verified, color: '#86efac', icon: <CheckCircleOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Pending Verify',  value: stats.pending,  color: '#fde68a', icon: <WarningAmberOutlined sx={{ fontSize: 18 }} /> },
            { label: 'Employees',       value: stats.employees,color: '#a5b4fc', icon: <PersonOutlined sx={{ fontSize: 18 }} /> },
          ].map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#7c3aed60', textTransform: 'uppercase', letterSpacing: 1, fontFamily: BODY }}>{s.label}</Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: 30, fontWeight: 700, color: s.color, letterSpacing: -1, lineHeight: 1.1, mt: 0.3 }}>{s.value}</Typography>
                  </Box>
                  <Box sx={{ color: s.color, opacity: 0.4 }}>{s.icon}</Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── FILTER BAR ── */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', px: { xs: 3, md: 5 }, py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} flexWrap="wrap">
          <TextField placeholder="Search employee, file, type…" size="small" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 16, color: '#9ca3af' }} /></InputAdornment>, sx: { borderRadius: 2.5, fontFamily: BODY } }}
            sx={{ flex: 1, maxWidth: 280 }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Document Type</InputLabel>
            <Select value={typeFilter} label="Document Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Types</MenuItem>
              {Object.entries(DOC_CFG).map(([k, v]) => (
                <MenuItem key={k} value={k} sx={{ fontFamily: BODY }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{v.emoji}</span><span>{v.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Employee</InputLabel>
            <Select value={empFilter} label="Employee" onChange={e => setEmpFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All Employees</MenuItem>
              {employees.map(e => <MenuItem key={e} value={e} sx={{ fontFamily: BODY }}>{e}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontFamily: BODY }}>Status</InputLabel>
            <Select value={verifiedFilter} label="Status" onChange={e => setVerifiedFilter(e.target.value)} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
              <MenuItem value="ALL" sx={{ fontFamily: BODY }}>All</MenuItem>
              <MenuItem value="VERIFIED" sx={{ fontFamily: BODY }}>✅ Verified</MenuItem>
              <MenuItem value="PENDING" sx={{ fontFamily: BODY }}>⏳ Pending</MenuItem>
            </Select>
          </FormControl>
          <Typography sx={{ fontSize: 12, color: '#9ca3af', fontFamily: BODY, fontWeight: 600, flexShrink: 0 }}>{filtered.length} documents</Typography>
        </Stack>
      </Box>

      {/* ── DOC TYPE QUICK FILTER ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 2.5, pb: 0.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(DOC_CFG).map(([key, val]) => {
            const count = docs.filter(d => d.docType === key).length;
            return (
              <Box key={key} onClick={() => setTypeFilter(typeFilter === key ? 'ALL' : key)}
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.6, borderRadius: 10, border: '1px solid', borderColor: typeFilter === key ? val.color : '#e5e7eb', bgcolor: typeFilter === key ? val.bg : 'white', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { borderColor: val.color } }}>
                <span style={{ fontSize: 13 }}>{val.emoji}</span>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, fontFamily: BODY, color: typeFilter === key ? val.color : '#6b7280' }}>{key}</Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, fontFamily: BODY, color: typeFilter === key ? val.color : '#9ca3af' }}>{count}</Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* ── GRID ── */}
      <Box sx={{ px: { xs: 3, md: 5 }, pt: 3 }}>
        <Grid container spacing={2.5}>
          {filtered.map(d => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={d.id}>
              <DocCard doc={d} onVerify={verifyDoc} />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <FolderOutlined sx={{ fontSize: 60, color: '#e5e7eb' }} />
                <Typography sx={{ fontFamily: BODY, color: '#9ca3af', fontWeight: 700, mt: 1.5 }}>No documents found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* ── UPLOAD DIALOG ── */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        <Box sx={{ height: 5, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
        <DialogTitle sx={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Upload Document
          <IconButton onClick={() => setUploadOpen(false)}><CloseOutlined /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Employee Name" size="small" fullWidth value={newDoc.empName || ''}
                  onChange={e => setNewDoc(p => ({ ...p, empName: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Employee ID" size="small" fullWidth value={newDoc.empId || ''}
                  onChange={e => setNewDoc(p => ({ ...p, empId: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, fontFamily: BODY } }} />
              </Grid>
              <Grid item xs={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: BODY }}>Document Type</InputLabel>
                  <Select value={newDoc.docType} label="Document Type" onChange={e => setNewDoc(p => ({ ...p, docType: e.target.value as DocType }))} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
                    {Object.entries(DOC_CFG).map(([k, v]) => (
                      <MenuItem key={k} value={k} sx={{ fontFamily: BODY }}>
                        <Stack direction="row" spacing={1} alignItems="center"><span>{v.emoji}</span><span>{v.label}</span></Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel sx={{ fontFamily: BODY }}>Department</InputLabel>
                  <Select value={newDoc.dept || ''} label="Department" onChange={e => setNewDoc(p => ({ ...p, dept: e.target.value }))} sx={{ borderRadius: 2.5, fontFamily: BODY }}>
                    {['Sales','Marketing','Finance','HR','Operations'].map(d => <MenuItem key={d} value={d} sx={{ fontFamily: BODY }}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Drop zone */}
            <Box
              onClick={() => fileRef.current?.click()}
              sx={{ border: '2px dashed #e5e7eb', borderRadius: 3, p: 5, textAlign: 'center', cursor: 'pointer', bgcolor: '#fafafa', transition: 'all 0.2s', '&:hover': { borderColor: '#7c3aed', bgcolor: '#f5f3ff' } }}>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.png" hidden />
              <Typography sx={{ fontSize: 40, mb: 1 }}>📁</Typography>
              <Typography sx={{ fontFamily: BODY, fontWeight: 700, fontSize: 13, color: '#374151' }}>Click to browse or drag & drop</Typography>
              <Typography sx={{ fontFamily: BODY, fontSize: 11.5, color: '#9ca3af', mt: 0.5 }}>Supports PDF, JPG, PNG · Max 5 MB</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setUploadOpen(false)} sx={{ textTransform: 'none', fontWeight: 700, fontFamily: BODY, color: '#6b7280' }}>Cancel</Button>
          <Button variant="contained" onClick={uploadDoc} disabled={!newDoc.empName}
            sx={{ textTransform: 'none', fontWeight: 800, fontFamily: BODY, borderRadius: 2.5, bgcolor: '#7c3aed', '&:hover': { bgcolor: '#6d28d9' }, boxShadow: 'none' }}>
            Upload Document
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;