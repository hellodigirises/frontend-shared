import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, Stack, Button, Grid, Chip, IconButton,
  CircularProgress, Paper, Tab, Tabs, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, Divider, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Badge, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddOutlined, SearchOutlined, FilterListOutlined, DownloadOutlined,
  GridViewOutlined, ViewListOutlined, FolderOutlined, RefreshOutlined,
  VisibilityOutlined, ShareOutlined, DeleteOutlineOutlined, HistoryOutlined,
  CheckOutlined, CloseOutlined, WarningAmberOutlined, VerifiedOutlined,
  CreateOutlined, LinkOutlined, PrintOutlined, LockOutlined,
  InsertDriveFileOutlined, UploadFileOutlined
} from '@mui/icons-material';
import {
  Document, DocumentCategory, DocumentStatus, EntityType, FileType,
  KYCRecord, AgreementTemplate, Agreement, AuditEntry,
  DocumentVaultStats,
  DOC_CATEGORY_CFG, DOC_STATUS_CFG, ENTITY_TYPE_CFG, FILE_TYPE_CFG,
  AGREEMENT_STATUS_CFG,
  formatDate, formatFileSize, timeAgo, daysUntilExpiry,
  avatarColor, initials
} from './documentTypes';
import DocumentUploadDialog from './DocumentUploadDialog';
import { KYCVerificationPanel, AgreementGeneratorDialog, ESignatureDialog } from './KYCAgreements';
import api from '../../../../api/axios';

// ─── Document Card ────────────────────────────────────────────────────────────
const DocumentCard: React.FC<{
  doc: Document;
  onView: () => void;
  onShare: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  viewMode: 'grid' | 'list';
}> = ({ doc, onView, onShare, onApprove, onReject, onDelete, viewMode }) => {
  const catCfg = DOC_CATEGORY_CFG[doc.category];
  const stCfg = DOC_STATUS_CFG[doc.status];
  const ftCfg = FILE_TYPE_CFG[doc.fileType];
  const expiry = doc.expiryDate ? daysUntilExpiry(doc.expiryDate) : null;
  const isExpiringSoon = expiry !== null && expiry >= 0 && expiry <= 30;
  const isExpired = expiry !== null && expiry < 0;
  const entityCfg = ENTITY_TYPE_CFG[doc.entityType];

  if (viewMode === 'list') {
    return (
      <TableRow hover sx={{ '& td': { py: 1.25 }, cursor: 'pointer' }} onClick={onView}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2, bgcolor: ftCfg.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0
            }}>
              {ftCfg.icon}
            </Box>
            <Box>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="body2" fontWeight={800} noWrap sx={{ maxWidth: 240 }}>
                  {doc.displayName ?? doc.fileName}
                </Typography>
                {doc.version > 1 && (
                  <Chip label={`v${doc.version}`} size="small" sx={{ fontSize: 9, height: 16, bgcolor: '#f3f4f6', fontWeight: 700 }} />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">{doc.fileName} · {formatFileSize(doc.fileSize)}</Typography>
            </Box>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip label={`${catCfg.icon} ${catCfg.label}`} size="small"
            sx={{ bgcolor: catCfg.bg, color: catCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
        </TableCell>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography fontSize={13}>{entityCfg.icon}</Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
              {doc.entityLabel ?? doc.entityType}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell>
          <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
            sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
        </TableCell>
        <TableCell>
          {doc.expiryDate ? (
            <Typography variant="caption" fontWeight={700}
              sx={{ color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#374151' }}>
              {isExpired ? `Expired ${Math.abs(expiry!)}d ago` : isExpiringSoon ? `⚠ ${expiry}d left` : formatDate(doc.expiryDate)}
            </Typography>
          ) : <Typography variant="caption" color="text.secondary">—</Typography>}
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">{timeAgo(doc.createdAt)}</Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" justifyContent="flex-end" spacing={0.25}>
            {doc.status === 'UNDER_REVIEW' && (
              <>
                <Tooltip title="Approve">
                  <IconButton size="small" onClick={e => { e.stopPropagation(); onApprove(); }} sx={{ color: '#10b981' }}>
                    <CheckOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton size="small" onClick={e => { e.stopPropagation(); onReject(); }} sx={{ color: '#ef4444' }}>
                    <CloseOutlined sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title="Share">
              <IconButton size="small" onClick={e => { e.stopPropagation(); onShare(); }}>
                <ShareOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={e => { e.stopPropagation(); onDelete(); }} sx={{ color: 'error.main' }}>
                <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Paper variant="outlined" sx={{
      borderRadius: 3.5, overflow: 'hidden', cursor: 'pointer',
      transition: 'all .2s', border: '1.5px solid',
      borderColor: isExpired ? '#fca5a5' : isExpiringSoon ? '#fde68a' : '#e5e7eb',
      '&:hover': { borderColor: catCfg.color, boxShadow: `0 8px 24px ${catCfg.color}20`, transform: 'translateY(-2px)' }
    }} onClick={onView}>
      {/* Preview area */}
      <Box sx={{ height: 100, bgcolor: catCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {doc.thumbnailUrl ? (
          <img src={doc.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Typography fontSize={48} sx={{ opacity: 0.6 }}>{ftCfg.icon}</Typography>
        )}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip label={stCfg.label} size="small"
            sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 9, height: 18 }} />
        </Box>
        {isExpiringSoon && !isExpired && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
            <Chip label={`⚠ ${expiry}d left`} size="small"
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 9, height: 18 }} />
          </Box>
        )}
        {isExpired && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 8 }}>
            <Chip label="Expired" size="small"
              sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 800, fontSize: 9, height: 18 }} />
          </Box>
        )}
        {doc.version > 1 && (
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            <Chip label={`v${doc.version}`} size="small"
              sx={{ bgcolor: 'rgba(0,0,0,.6)', color: '#fff', fontWeight: 800, fontSize: 9, height: 18 }} />
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={800} noWrap mb={0.5}>
          {doc.displayName ?? doc.fileName}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75} mb={1.25}>
          <Chip label={`${catCfg.icon} ${catCfg.label}`} size="small"
            sx={{ bgcolor: catCfg.bg, color: catCfg.color, fontWeight: 700, fontSize: 9, height: 18 }} />
          <Typography variant="caption" color="text.secondary" noWrap>{formatFileSize(doc.fileSize)}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.75} mb={1.5}>
          <Avatar sx={{ width: 18, height: 18, fontSize: 8, bgcolor: avatarColor(doc.uploadedBy.name), fontWeight: 800 }}>
            {initials(doc.uploadedBy.name)}
          </Avatar>
          <Typography variant="caption" color="text.secondary">{timeAgo(doc.createdAt)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Share">
              <IconButton size="small" onClick={e => { e.stopPropagation(); onShare(); }} sx={{ p: 0.5 }}>
                <ShareOutlined sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" sx={{ p: 0.5 }}>
                <DownloadOutlined sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Stack>
          {doc.status === 'UNDER_REVIEW' && (
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={e => { e.stopPropagation(); onApprove(); }}
                sx={{ p: 0.5, color: '#10b981' }}>
                <CheckOutlined sx={{ fontSize: 14 }} />
              </IconButton>
              <IconButton size="small" onClick={e => { e.stopPropagation(); onReject(); }}
                sx={{ p: 0.5, color: '#ef4444' }}>
                <CloseOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

// ─── Share Link Dialog ────────────────────────────────────────────────────────
const ShareDialog: React.FC<{ doc: Document | null; open: boolean; onClose: () => void }> = ({ doc, open, onClose }) => {
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState('VIEW');
  const [expiry, setExpiry] = useState('7');
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [link] = useState(`https://docs.proptrack.in/share/${Math.random().toString(36).slice(2)}`);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontFamily: '"Lora", serif', fontWeight: 700, fontSize: '1.2rem' }}>🔗 Share Document</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{doc?.displayName ?? doc?.fileName}</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Divider />
      <DialogContent>
        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>Access Level</Typography>
            <Stack direction="row" spacing={1.25}>
              {[{ v: 'VIEW', l: '👁 View Only' }, { v: 'DOWNLOAD', l: '⬇ Download' }, { v: 'EDIT', l: '✏️ Edit' }].map(a => (
                <Box key={a.v} onClick={() => setAccess(a.v)}
                  sx={{
                    flex: 1, p: 1.5, borderRadius: 2.5, textAlign: 'center', cursor: 'pointer', border: '1.5px solid',
                    borderColor: access === a.v ? '#6366f1' : '#e5e7eb', bgcolor: access === a.v ? '#eef2ff' : '#fff'
                  }}>
                  <Typography variant="caption" fontWeight={800} sx={{ color: access === a.v ? '#6366f1' : '#9ca3af', fontSize: 10 }}>{a.l}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>Link Expires In</Typography>
            <Stack direction="row" spacing={1}>
              {['1', '7', '30', 'Never'].map(d => (
                <Chip key={d} label={d === 'Never' ? 'Never' : `${d}d`} size="small" clickable
                  variant={expiry === d ? 'filled' : 'outlined'}
                  color={expiry === d ? 'primary' : 'default'}
                  onClick={() => setExpiry(d)}
                  sx={{ fontWeight: 700, fontSize: 11 }} />
              ))}
            </Stack>
          </Box>

          <TextField fullWidth label="Send to Email (Optional)" size="small" value={email}
            onChange={e => setEmail(e.target.value)} type="email"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />

          {linkGenerated && (
            <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75}>Shareable Link</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" sx={{ flex: 1, fontFamily: 'monospace', fontSize: 10, color: '#6366f1' }} noWrap>{link}</Typography>
                <IconButton size="small" onClick={() => navigator.clipboard?.writeText(link)}>
                  <LinkOutlined sx={{ fontSize: 15 }} />
                </IconButton>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Close</Button>
        <Button variant="contained" disableElevation onClick={() => setLinkGenerated(true)}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5 }}>
          {linkGenerated ? '📧 Send Email' : '🔗 Generate Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Document Vault Stats ─────────────────────────────────────────────────────
const VaultStats: React.FC<{ stats: DocumentVaultStats }> = ({ stats }) => (
  <Grid container spacing={2} mb={3}>
    {[
      { icon: '📂', label: 'Total Documents', value: stats.totalDocuments, color: '#6366f1' },
      { icon: '🔍', label: 'Pending Approval', value: stats.pendingApprovals, color: '#f59e0b' },
      { icon: '⚠️', label: 'Expiring This Month', value: stats.expiringThisMonth, color: '#ef4444' },
      { icon: '🪪', label: 'KYC Pending', value: stats.kycPending, color: '#8b5cf6' },
      { icon: '✍️', label: 'Agreements Pending', value: stats.agreementsPending, color: '#0ea5e9' },
      { icon: '📤', label: 'Uploaded Today', value: stats.uploadedToday, color: '#10b981' },
    ].map(k => (
      <Grid item xs={6} sm={4} md={2} key={k.label}>
        <Paper variant="outlined" sx={{
          p: 2.5, borderRadius: 3.5, textAlign: 'center',
          transition: 'all .2s', '&:hover': { borderColor: k.color, transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${k.color}20` }
        }}>
          <Typography fontSize={22} mb={0.5}>{k.icon}</Typography>
          <Typography variant="h5" fontWeight={900} sx={{ color: k.color, lineHeight: 1 }}>{k.value}</Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 10 }}>{k.label}</Typography>
        </Paper>
      </Grid>
    ))}
  </Grid>
);

// ─── Folder/Entity Navigator ──────────────────────────────────────────────────
const EntityNav: React.FC<{
  selected: string;
  onChange: (v: string) => void;
  counts: Record<string, number>;
}> = ({ selected, onChange, counts }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, width: 200, flexShrink: 0 }}>
    <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1.5 }}>
      Browse by Entity
    </Typography>
    <Stack spacing={0.5}>
      <Box onClick={() => onChange('ALL')}
        sx={{
          px: 1.5, py: 1.25, borderRadius: 2.5, cursor: 'pointer', transition: 'all .12s',
          bgcolor: selected === 'ALL' ? '#eef2ff' : 'transparent',
          '&:hover': { bgcolor: '#f5f3ff' }
        }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontSize={14}>🗂</Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color: selected === 'ALL' ? '#6366f1' : '#374151' }}>All Documents</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700 }}>{counts['ALL'] ?? 0}</Typography>
        </Stack>
      </Box>
      {Object.entries(ENTITY_TYPE_CFG).map(([k, v]) => (
        <Box key={k} onClick={() => onChange(k)}
          sx={{
            px: 1.5, py: 1.25, borderRadius: 2.5, cursor: 'pointer', transition: 'all .12s',
            bgcolor: selected === k ? '#eef2ff' : 'transparent',
            '&:hover': { bgcolor: '#f5f3ff' }
          }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontSize={14}>{v.icon}</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: selected === k ? '#6366f1' : '#374151', fontSize: 12 }}>
                {v.label}
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700 }}>{counts[k] ?? 0}</Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  </Paper>
);

// ─── Main DocumentsPage ───────────────────────────────────────────────────────
const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [kycRecords, setKycRecords] = useState<KYCRecord[]>([]);
  const [templates, setTemplates] = useState<AgreementTemplate[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<Document | null>(null);
  const [agreementGenTemplate, setAgreementGenTemplate] = useState<AgreementTemplate | null>(null);
  const [signTarget, setSignTarget] = useState<Agreement | null>(null);

  const stats: DocumentVaultStats = useMemo(() => ({
    totalDocuments: documents.length,
    totalSize: documents.reduce((s, d) => s + d.fileSize, 0),
    pendingApprovals: documents.filter(d => d.status === 'UNDER_REVIEW').length,
    expiringThisMonth: documents.filter(d => d.expiryDate && daysUntilExpiry(d.expiryDate) >= 0 && daysUntilExpiry(d.expiryDate) <= 30).length,
    kycPending: kycRecords.filter(r => r.status === 'PENDING').length,
    agreementsPending: agreements.filter(a => a.status === 'SENT' || a.status === 'VIEWED').length,
    uploadedToday: documents.filter(d => {
      const t = new Date(); const cd = new Date(d.createdAt);
      return cd.getFullYear() === t.getFullYear() && cd.getMonth() === t.getMonth() && cd.getDate() === t.getDate();
    }).length,
    rejectedDocuments: documents.filter(d => d.status === 'REJECTED').length,
  }), [documents, kycRecords, agreements]);

  const entityCounts = useMemo(() => {
    const m: Record<string, number> = { ALL: documents.length };
    documents.forEach(d => { m[d.entityType] = (m[d.entityType] ?? 0) + 1; });
    return m;
  }, [documents]);

  const fetchData = async () => {
    try {
      const [dRes, kRes, tRes, aRes] = await Promise.all([
        api.get('/documents'),
        api.get('/kyc'),
        api.get('/agreement-templates'),
        api.get('/agreements'),
      ]);
      setDocuments(dRes.data?.data ?? dRes.data ?? []);
      setKycRecords(kRes.data?.data ?? kRes.data ?? []);
      setTemplates(tRes.data?.data ?? tRes.data ?? []);
      setAgreements(aRes.data?.data ?? aRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (docId: string) => {
    try { await api.put(`/documents/${docId}`, { status: 'APPROVED' }); fetchData(); } catch (e) { console.error(e); }
  };
  const handleReject = async (docId: string) => {
    try { await api.put(`/documents/${docId}`, { status: 'REJECTED' }); fetchData(); } catch (e) { console.error(e); }
  };
  const handleDelete = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try { await api.delete(`/documents/${docId}`); fetchData(); } catch (e) { console.error(e); }
  };

  const filtered = useMemo(() => documents.filter(d => {
    const q = search.toLowerCase();
    const matchQ = !q || (d.displayName ?? d.fileName).toLowerCase().includes(q) ||
      (d.entityLabel ?? '').toLowerCase().includes(q) || (d.tags ?? []).some(t => t.toLowerCase().includes(q));
    const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchEntity = entityFilter === 'ALL' || d.entityType === entityFilter;
    return matchQ && matchCat && matchStatus && matchEntity;
  }), [documents, search, categoryFilter, statusFilter, entityFilter]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} mb={3.5} spacing={2}>
        <Box>
          <Typography sx={{ fontFamily: '"Lora", serif', fontWeight: 700, fontSize: '2.25rem', letterSpacing: -1, lineHeight: 1.1, color: '#0f172a' }}>
            Document Vault
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.75}>
            {documents.length} documents · KYC · Agreements · Secure storage
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<DownloadOutlined />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}>Export</Button>
          <Button variant="contained" disableElevation startIcon={<UploadFileOutlined />}
            onClick={() => setUploadOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3, px: 2.5 }}>
            Upload Documents
          </Button>
        </Stack>
      </Stack>

      {/* ── KPI Strip ── */}
      <VaultStats stats={stats} />

      {/* ── Alerts ── */}
      {(stats.pendingApprovals > 0 || stats.expiringThisMonth > 0) && (
        <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap">
          {stats.pendingApprovals > 0 && (
            <Chip label={`🔍 ${stats.pendingApprovals} documents awaiting approval`}
              clickable onClick={() => { setStatusFilter('UNDER_REVIEW'); setMainTab(0); }}
              sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {stats.expiringThisMonth > 0 && (
            <Chip icon={<WarningAmberOutlined sx={{ fontSize: '14px !important' }} />}
              label={`${stats.expiringThisMonth} documents expiring this month`}
              sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
          {stats.kycPending > 0 && (
            <Chip label={`🪪 ${stats.kycPending} KYC verifications pending`}
              clickable onClick={() => setMainTab(2)}
              sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 800, fontSize: 11, height: 28 }} />
          )}
        </Stack>
      )}

      {/* ── Tabs ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}>
          {[
            { label: '📂 All Documents' },
            { label: '✍️ Agreements' },
            { label: `🪪 KYC (${stats.kycPending} pending)` },
            { label: '📋 Templates' },
          ].map((t, i) => (
            <Tab key={i} label={t.label}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', minHeight: 44 }} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={fetchData} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
          {mainTab === 0 && (
            <Stack direction="row" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setViewMode('list')} sx={{ color: viewMode === 'list' ? 'primary.main' : 'text.secondary', borderRadius: '8px 0 0 8px' }}>
                <ViewListOutlined fontSize="small" />
              </IconButton>
              <Divider orientation="vertical" />
              <IconButton size="small" onClick={() => setViewMode('grid')} sx={{ color: viewMode === 'grid' ? 'primary.main' : 'text.secondary', borderRadius: '0 8px 8px 0' }}>
                <GridViewOutlined fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* ── Tab 0: All Documents ── */}
      {mainTab === 0 && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
          {/* Entity navigator */}
          <EntityNav selected={entityFilter} onChange={setEntityFilter} counts={entityCounts} />

          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Filters */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField fullWidth placeholder="Search documents, tags, entity..." size="small"
                  value={search} onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment>, sx: { borderRadius: 2.5 } }} />
                {[
                  { label: 'Category', val: categoryFilter, set: setCategoryFilter, opts: [['ALL', 'All Categories'], ...Object.entries(DOC_CATEGORY_CFG).map(([k, v]) => [k, `${v.icon} ${v.label}`])] },
                  { label: 'Status', val: statusFilter, set: setStatusFilter, opts: [['ALL', 'All Statuses'], ...Object.entries(DOC_STATUS_CFG).map(([k, v]) => [k, `${v.icon} ${v.label}`])] },
                ].map(f => (
                  <FormControl key={f.label} size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{f.label}</InputLabel>
                    <Select value={f.val} label={f.label} onChange={e => f.set(e.target.value)} sx={{ borderRadius: 2.5 }}>
                      {f.opts.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                    </Select>
                  </FormControl>
                ))}
              </Stack>
            </Paper>

            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Showing <strong>{filtered.length}</strong> of <strong>{documents.length}</strong> documents
            </Typography>

            {viewMode === 'grid' ? (
              <Grid container spacing={2}>
                {filtered.map(doc => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                    <DocumentCard doc={doc} viewMode="grid"
                      onView={() => { }} onShare={() => setShareTarget(doc)}
                      onApprove={() => handleApprove(doc.id)} onReject={() => handleReject(doc.id)}
                      onDelete={() => handleDelete(doc.id)} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        {['Document', 'Category', 'Entity', 'Status', 'Expiry', 'Uploaded', 'Actions'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5, color: '#374151' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 10, color: 'text.secondary' }}>
                            <Typography fontSize={40} mb={1.5}>📂</Typography>
                            <Typography variant="body2">No documents match your filters</Typography>
                          </TableCell>
                        </TableRow>
                      ) : filtered.map(doc => (
                        <DocumentCard key={doc.id} doc={doc} viewMode="list"
                          onView={() => { }} onShare={() => setShareTarget(doc)}
                          onApprove={() => handleApprove(doc.id)} onReject={() => handleReject(doc.id)}
                          onDelete={() => handleDelete(doc.id)} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Box>
        </Stack>
      )}

      {/* ── Tab 1: Agreements ── */}
      {mainTab === 1 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="body1" fontWeight={800}>Digital Agreements ({agreements.length})</Typography>
            {templates.length > 0 && (
              <Button variant="contained" disableElevation startIcon={<CreateOutlined />}
                onClick={() => setAgreementGenTemplate(templates[0])}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
                Generate Agreement
              </Button>
            )}
          </Stack>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Agreement', 'Customer', 'Status', 'Sent To', 'Sent At', 'Signed At', 'Actions'].map(h => (
                      <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agreements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography fontSize={36} mb={1}>✍️</Typography>
                        <Typography variant="body2" color="text.secondary">No agreements generated yet</Typography>
                      </TableCell>
                    </TableRow>
                  ) : agreements.map(a => {
                    const stCfg = AGREEMENT_STATUS_CFG[a.status];
                    return (
                      <TableRow key={a.id} hover sx={{ '& td': { py: 1.25 } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>{a.templateName}</Typography>
                          {a.projectName && <Typography variant="caption" color="text.secondary">{a.projectName} · Unit {a.unitNumber}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 9, bgcolor: avatarColor(a.customerName), fontWeight: 800 }}>
                              {initials(a.customerName)}
                            </Avatar>
                            <Typography variant="caption" fontWeight={700}>{a.customerName}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                            sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{a.sentTo ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{a.sentAt ? timeAgo(a.sentAt) : '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {a.signedAt ? (
                            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>✅ {formatDate(a.signedAt)}</Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.25}>
                            {(a.status === 'SENT' || a.status === 'VIEWED') && (
                              <Button size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: 11, borderRadius: 2, fontWeight: 700 }}
                                onClick={() => setSignTarget(a)}>
                                ✍️ Sign
                              </Button>
                            )}
                            {a.generatedPdfUrl && (
                              <Tooltip title="Download PDF">
                                <IconButton size="small"><DownloadOutlined sx={{ fontSize: 16 }} /></IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* ── Tab 2: KYC ── */}
      {mainTab === 2 && (
        <KYCVerificationPanel records={kycRecords} onRefresh={fetchData} />
      )}

      {/* ── Tab 3: Templates ── */}
      {mainTab === 3 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography variant="body1" fontWeight={800}>Agreement Templates ({templates.length})</Typography>
            <Button variant="contained" disableElevation startIcon={<AddOutlined />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}>
              Create Template
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {templates.map(t => (
              <Grid item xs={12} sm={6} lg={4} key={t.id}>
                <Paper variant="outlined" sx={{
                  p: 3, borderRadius: 3.5, cursor: 'pointer', transition: 'all .2s',
                  '&:hover': { borderColor: '#6366f1', boxShadow: '0 8px 24px rgba(99,102,241,.12)' }
                }}>
                  <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      📝
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={800}>{t.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.description}</Typography>
                      {t.isDefault && <Chip label="⭐ Default" size="small" sx={{ ml: 0.5, fontSize: 9, height: 16, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700 }} />}
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
                    {t.variables.slice(0, 4).map(v => (
                      <Chip key={v.key} label={v.label} size="small"
                        sx={{ fontSize: 9, height: 18, bgcolor: '#f3f4f6', fontWeight: 600 }} />
                    ))}
                    {t.variables.length > 4 && (
                      <Chip label={`+${t.variables.length - 4} more`} size="small"
                        sx={{ fontSize: 9, height: 18, bgcolor: '#f3f4f6', fontWeight: 600 }} />
                    )}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" pt={1.5} sx={{ borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" color="text.secondary">Used {t.usageCount} times</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, fontWeight: 700 }}>
                        Edit
                      </Button>
                      <Button size="small" variant="contained" disableElevation
                        onClick={() => setAgreementGenTemplate(t)}
                        sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, fontWeight: 700 }}>
                        Generate
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Dialogs ── */}
      <DocumentUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        entityType="BOOKING" entityId=""
        defaultCategory="KYC"
        onSave={fetchData}
      />
      <ShareDialog doc={shareTarget} open={!!shareTarget} onClose={() => setShareTarget(null)} />
      {agreementGenTemplate && (
        <AgreementGeneratorDialog
          open={!!agreementGenTemplate}
          onClose={() => setAgreementGenTemplate(null)}
          template={agreementGenTemplate}
          onSave={fetchData}
        />
      )}
      {signTarget && (
        <ESignatureDialog
          open={!!signTarget}
          onClose={() => setSignTarget(null)}
          agreementId={signTarget.id}
          customerName={signTarget.customerName}
          agreementTitle={signTarget.templateName}
          onSigned={fetchData}
        />
      )}
    </Box>
  );
};

export default DocumentsPage;