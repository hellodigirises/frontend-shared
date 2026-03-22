// src/modules/hr/pages/DocumentsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  CloudUpload, Folder, Delete, OpenInNew,
  Badge, CreditCard, Description, School, Work,
} from '@mui/icons-material';
import { useAppDispatch, H, DATE, fieldSx, labelSx, selectFieldSx } from '../hooks';
import { PageHeader, Card, DataTable } from '../components/ui';
import { hrApi } from '../api/hr.api';

const DOC_TYPES = ['AADHAR','PAN','OFFER_LETTER','CONTRACT','CERTIFICATE','BANK_DETAILS','EDUCATION','EXPERIENCE','OTHER'];

const DOC_ICON: Record<string, React.ReactNode> = {
  AADHAR      : <Badge />,
  PAN         : <CreditCard />,
  OFFER_LETTER: <Description />,
  CONTRACT    : <Work />,
  CERTIFICATE : <School />,
  BANK_DETAILS: <CreditCard />,
  EDUCATION   : <School />,
  EXPERIENCE  : <Work />,
  OTHER       : <Folder />,
};

const DOC_COLOR: Record<string, string> = {
  AADHAR: H.teal, PAN: H.amber, OFFER_LETTER: H.primary,
  CONTRACT: H.purple, CERTIFICATE: H.indigo,
  BANK_DETAILS: H.coral, EDUCATION: '#10B981',
  EXPERIENCE: '#F97316', OTHER: H.textSub,
};

function UploadDialog({ open, onClose, employeeId, onUploaded }: {
  open: boolean; onClose: () => void;
  employeeId: string; onUploaded: () => void;
}) {
  const [f, setF] = useState({ documentType: 'AADHAR', title: '', fileUrl: '', expiresAt: '' });
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!employeeId) return;
    await hrApi.post(`/employees/${employeeId}/documents`, f);
    onUploaded();
    onClose();
    setF({ documentType: 'AADHAR', title: '', fileUrl: '', expiresAt: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: H.surface, border: `1px solid ${H.border}`, borderRadius: '14px' } }}>
      <DialogTitle sx={{ color: H.text, fontWeight: 700, fontSize: 15, pb: 1 }}>Upload Document</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={0.25}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel sx={labelSx}>Document Type</InputLabel>
              <Select value={f.documentType} label="Document Type" onChange={e => set('documentType', e.target.value)} sx={selectFieldSx}>
                {DOC_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Title *"
              value={f.title} onChange={e => set('title', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth size="small" label="File URL * (S3 / CDN link)"
              value={f.fileUrl} onChange={e => set('fileUrl', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: labelSx }}
              helperText="Upload to S3 first and paste the URL here"
              FormHelperTextProps={{ sx: { color: H.textSub, fontSize: 11 } }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth size="small" label="Expiry Date (optional)" type="date"
              value={f.expiresAt} onChange={e => set('expiresAt', e.target.value)}
              sx={fieldSx} InputLabelProps={{ sx: { ...labelSx, shrink: true } }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: H.textSub, textTransform: 'none', fontSize: 13 }}>Cancel</Button>
        <Button variant="contained" disabled={!f.title || !f.fileUrl || !employeeId} onClick={submit}
          sx={{ bgcolor: H.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function DocumentsPage() {
  const [docs,     setDocs]     = useState<any[]>([]);
  const [empId,    setEmpId]    = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const loadDocs = async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const r = await hrApi.get(`/employees/${empId}/documents`);
      setDocs(r.data.data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadDocs(); }, [empId]);

  const filtered = docs.filter(d => !typeFilter || d.documentType === typeFilter);

  const deleteDoc = async (id: string) => {
    await hrApi.delete(`/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  const cols = [
    { label: 'Type', render: (r: any) => {
      const color = DOC_COLOR[r.documentType] ?? H.textSub;
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ color, '& svg': { fontSize: 16 } }}>{DOC_ICON[r.documentType] ?? <Folder />}</Box>
          <Chip label={r.documentType.replace(/_/g, ' ')} size="small"
            sx={{ fontSize: 10, height: 20, bgcolor: `${color}12`, color }} />
        </Box>
      );
    }},
    { label: 'Title',     render: (r: any) => <Typography sx={{ color: H.text, fontSize: 12.5 }}>{r.title}</Typography> },
    { label: 'Uploaded',  render: (r: any) => <Typography sx={{ color: H.textSub, fontSize: 12 }}>{DATE(r.createdAt)}</Typography> },
    { label: 'Expires',   render: (r: any) => <Typography sx={{ color: r.expiresAt ? H.amber : H.textSub, fontSize: 12 }}>{DATE(r.expiresAt)}</Typography> },
    { label: 'By',        render: (r: any) => <Typography sx={{ color: H.textSub, fontSize: 12 }}>{r.uploadedBy ?? '—'}</Typography> },
    { label: '', render: (r: any) => (
      <Box display="flex" gap={0.25}>
        <Tooltip title="View">
          <IconButton size="small" component="a" href={r.fileUrl} target="_blank"
            sx={{ color: H.primary }}><OpenInNew sx={{ fontSize: 14 }} /></IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => deleteDoc(r.id)}
            sx={{ color: H.coral }}><Delete sx={{ fontSize: 14 }} /></IconButton>
        </Tooltip>
      </Box>
    )},
  ];

  return (
    <Box>
      <PageHeader
        title="Document Vault"
        subtitle="Securely store and manage employee documents"
        action={
          <Button variant="contained" startIcon={<CloudUpload />} size="small"
            onClick={() => setOpen(true)} disabled={!empId}
            sx={{ bgcolor: H.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: 13 }}>
            Upload Document
          </Button>
        }
      />

      {/* Filters */}
      <Box display="flex" gap={1.5} mb={3} flexWrap="wrap">
        <TextField size="small" placeholder="Enter Employee ID to load documents" value={empId}
          onChange={e => setEmpId(e.target.value)}
          sx={{ width: 320, '& .MuiOutlinedInput-root': { bgcolor: H.surface, color: H.text, borderRadius: '8px', '& fieldset': { borderColor: H.border }, fontSize: 13 } }}
          inputProps={{ style: { fontSize: 13 } }} />
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <InputLabel sx={labelSx}>Document Type</InputLabel>
          <Select value={typeFilter} label="Document Type" onChange={e => setTypeFilter(e.target.value)} sx={selectFieldSx}>
            <MenuItem value="" sx={{ fontSize: 13 }}>All Types</MenuItem>
            {DOC_TYPES.map(t => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Summary tiles */}
      {docs.length > 0 && (
        <Grid container spacing={1.5} mb={3}>
          {DOC_TYPES.filter(t => docs.some(d => d.documentType === t)).map(type => {
            const count = docs.filter(d => d.documentType === type).length;
            const color = DOC_COLOR[type] ?? H.textSub;
            return (
              <Grid item key={type}>
                <Box
                  onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    bgcolor: typeFilter === type ? `${color}18` : H.surface,
                    border: `1px solid ${typeFilter === type ? `${color}40` : H.border}`,
                    borderRadius: '10px', px: 1.5, py: 0.75, cursor: 'pointer',
                    '&:hover': { bgcolor: `${color}12` },
                  }}>
                  <Box sx={{ color, '& svg': { fontSize: 15 } }}>{DOC_ICON[type]}</Box>
                  <Typography sx={{ color: typeFilter === type ? color : H.textSub, fontSize: 12, fontWeight: typeFilter === type ? 600 : 400 }}>
                    {type.replace(/_/g, ' ')}
                  </Typography>
                  <Box sx={{ bgcolor: `${color}20`, color, fontSize: 10, fontWeight: 700, px: 0.75, py: 0.1, borderRadius: '4px' }}>
                    {count}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      {!empId
        ? (
          <Box py={8} textAlign="center">
            <Folder sx={{ fontSize: 48, color: H.border, mb: 2 }} />
            <Typography sx={{ color: H.textSub, fontSize: 14 }}>Enter an employee ID to view their documents</Typography>
          </Box>
        )
        : (
          <Card>
            <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No documents found" />
          </Card>
        )
      }

      <UploadDialog open={open} onClose={() => setOpen(false)} employeeId={empId} onUploaded={loadDocs} />
    </Box>
  );
}
