import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Stack, Button, TextField, Chip,
    IconButton, Divider, Grid, Paper, CircularProgress,
    Alert, FormControl, InputLabel, Select, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Avatar, Tabs, Tab, InputAdornment
} from '@mui/material';
import {
    CloseOutlined, CheckCircleOutlined, CancelOutlined,
    VerifiedOutlined, UploadFileOutlined, VisibilityOutlined,
    CreateOutlined, AutoAwesomeOutlined, SendOutlined,
    DownloadOutlined, EditOutlined
} from '@mui/icons-material';
import {
    KYCRecord, AgreementTemplate, Agreement, AgreementStatus,
    KYC_STATUS_CFG, AGREEMENT_STATUS_CFG, KYC_REQUIRED_DOCS,
    formatDate, timeAgo, avatarColor, initials
} from './documentTypes';
import api from '../../../../api/axios';

// ─── KYC Verification Panel ───────────────────────────────────────────────────

export const KYCVerificationPanel: React.FC<{
    records: KYCRecord[];
    onRefresh: () => void;
}> = ({ records, onRefresh }) => {
    const [selected, setSelected] = useState<KYCRecord | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    const pendingCount = records.filter(r => r.status === 'PENDING').length;
    const verifiedCount = records.filter(r => r.status === 'VERIFIED').length;
    const rejectedCount = records.filter(r => r.status === 'REJECTED').length;

    const filtered = records.filter(r =>
        filterStatus === 'ALL' ? true : r.status === filterStatus
    );

    const handleVerify = async (id: string, approve: boolean) => {
        setProcessing(true);
        try {
            await api.put(`/kyc/${id}`, {
                status: approve ? 'VERIFIED' : 'REJECTED',
                rejectionReason: !approve ? rejectionReason : undefined,
            });
            onRefresh();
            setSelected(null);
        } catch (e) { console.error(e); }
        finally { setProcessing(false); }
    };

    return (
        <Box>
            {/* KPI strip */}
            <Grid container spacing={2} mb={3}>
                {[
                    { label: 'Pending Verification', value: pendingCount, color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
                    { label: 'Verified', value: verifiedCount, color: '#10b981', bg: '#d1fae5', icon: '✅' },
                    { label: 'Rejected', value: rejectedCount, color: '#ef4444', bg: '#fee2e2', icon: '❌' },
                    { label: 'Total Customers', value: records.length, color: '#6366f1', bg: '#eef2ff', icon: '👤' },
                ].map(k => (
                    <Grid item xs={6} sm={3} key={k.label}>
                        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                            <Typography fontSize={24} mb={0.5}>{k.icon}</Typography>
                            <Typography variant="h5" fontWeight={900} sx={{ color: k.color }}>{k.value}</Typography>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">{k.label}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body1" fontWeight={800}>Customer KYC Records</Typography>
                <Stack direction="row" spacing={1}>
                    {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map(s => (
                        <Chip key={s} label={s === 'ALL' ? 'All' : KYC_STATUS_CFG[s as any]?.label ?? s}
                            size="small" clickable
                            variant={filterStatus === s ? 'filled' : 'outlined'}
                            color={filterStatus === s ? 'primary' : 'default'}
                            onClick={() => setFilterStatus(s)}
                            sx={{ fontWeight: 700, fontSize: 11 }} />
                    ))}
                </Stack>
            </Stack>

            <Grid container spacing={2}>
                {/* Customer list */}
                <Grid item xs={12} md={selected ? 5 : 12}>
                    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        {['Customer', 'Documents', 'Completeness', 'Status', 'Action'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 800, fontSize: 11, py: 1.5 }}>{h}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map(r => {
                                        const stCfg = KYC_STATUS_CFG[r.status];
                                        return (
                                            <TableRow key={r.id} hover
                                                onClick={() => setSelected(r)}
                                                sx={{ cursor: 'pointer', bgcolor: selected?.id === r.id ? '#f5f3ff' : 'inherit', '& td': { py: 1.25 } }}>
                                                <TableCell>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: avatarColor(r.customerName), fontSize: 11, fontWeight: 900 }}>
                                                            {initials(r.customerName)}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={800}>{r.customerName}</Typography>
                                                            {r.bookingId && <Typography variant="caption" color="text.secondary">Booking #{r.bookingId.slice(-6)}</Typography>}
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5}>
                                                        {KYC_REQUIRED_DOCS.map(d => {
                                                            const hasDoc = !!(r as any)[d.key];
                                                            return (
                                                                <Typography key={d.key} fontSize={14} sx={{ opacity: hasDoc ? 1 : 0.25 }} title={d.label}>
                                                                    {d.icon}
                                                                </Typography>
                                                            );
                                                        })}
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ width: 80 }}>
                                                        <Stack direction="row" justifyContent="space-between" mb={0.25}>
                                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>{r.completeness}%</Typography>
                                                        </Stack>
                                                        <Box sx={{ height: 4, bgcolor: '#f3f4f6', borderRadius: 2, overflow: 'hidden' }}>
                                                            <Box sx={{
                                                                height: '100%', width: `${r.completeness}%`,
                                                                bgcolor: r.completeness >= 100 ? '#10b981' : r.completeness >= 60 ? '#f59e0b' : '#ef4444',
                                                                borderRadius: 2
                                                            }} />
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={`${stCfg.icon} ${stCfg.label}`} size="small"
                                                        sx={{ bgcolor: stCfg.bg, color: stCfg.color, fontWeight: 800, fontSize: 10, height: 22 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="small" variant="outlined" sx={{ textTransform: 'none', borderRadius: 2, fontSize: 11, fontWeight: 700 }}>
                                                        Review
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Review Panel */}
                {selected && (
                    <Grid item xs={12} md={7}>
                        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', position: 'sticky', top: 16 }}>
                            <Box sx={{ px: 3, py: 2.5, bgcolor: '#0f172a' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="body1" fontWeight={900} color="#fff">{selected.customerName}</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>KYC Review · {formatDate(selected.createdAt)}</Typography>
                                    </Box>
                                    <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: '#64748b' }}>
                                        <CloseOutlined fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', display: 'block', mb: 2 }}>
                                    Document Checklist
                                </Typography>
                                <Stack spacing={1.5} mb={3}>
                                    {KYC_REQUIRED_DOCS.map(d => {
                                        const hasDoc = !!(selected as any)[d.key];
                                        return (
                                            <Stack key={d.key} direction="row" alignItems="center" justifyContent="space-between"
                                                sx={{ p: 2, borderRadius: 2.5, bgcolor: hasDoc ? '#f0fdf4' : '#fafafa', border: `1px solid ${hasDoc ? '#86efac' : '#e5e7eb'}` }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <Typography fontSize={20}>{d.icon}</Typography>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700}>{d.label}</Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {d.required ? '⭐ Required' : 'Optional'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                {hasDoc ? (
                                                    <Stack direction="row" spacing={1}>
                                                        <Button size="small" sx={{ textTransform: 'none', fontSize: 11, borderRadius: 2 }}>
                                                            <VisibilityOutlined sx={{ fontSize: 14, mr: 0.5 }} /> View
                                                        </Button>
                                                        <CheckCircleOutlined sx={{ color: '#10b981', fontSize: 20 }} />
                                                    </Stack>
                                                ) : (
                                                    <Chip label="Missing" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
                                                )}
                                            </Stack>
                                        );
                                    })}
                                </Stack>

                                {selected.status === 'PENDING' && (
                                    <Box>
                                        <TextField fullWidth label="Rejection Reason (if rejecting)" size="small"
                                            multiline rows={2} value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                                        <Stack direction="row" spacing={1.5}>
                                            <Button fullWidth variant="contained" disableElevation
                                                onClick={() => handleVerify(selected.id, true)}
                                                disabled={processing || selected.completeness < 60}
                                                sx={{
                                                    textTransform: 'none', fontWeight: 800, borderRadius: 2.5,
                                                    bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }
                                                }}>
                                                {processing ? <CircularProgress size={18} color="inherit" /> : '✅ Approve KYC'}
                                            </Button>
                                            <Button fullWidth variant="outlined"
                                                onClick={() => handleVerify(selected.id, false)}
                                                disabled={processing}
                                                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, borderColor: '#ef4444', color: '#ef4444' }}>
                                                ❌ Reject
                                            </Button>
                                        </Stack>
                                    </Box>
                                )}

                                {selected.status === 'VERIFIED' && (
                                    <Alert severity="success" sx={{ borderRadius: 3 }}>
                                        ✅ KYC verified by {selected.verifiedBy?.name ?? 'Admin'} on {selected.verifiedAt ? formatDate(selected.verifiedAt) : '—'}
                                    </Alert>
                                )}
                                {selected.status === 'REJECTED' && (
                                    <Alert severity="error" sx={{ borderRadius: 3 }}>
                                        ❌ Rejected: {selected.rejectionReason ?? 'No reason provided'}
                                    </Alert>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

// ─── Agreement Generator Dialog ───────────────────────────────────────────────

interface AgreementGenProps {
    open: boolean;
    onClose: () => void;
    template: AgreementTemplate | null;
    bookingId?: string;
    defaultValues?: Record<string, string>;
    onSave: () => void;
}

export const AgreementGeneratorDialog: React.FC<AgreementGenProps> = ({
    open, onClose, template, bookingId, defaultValues = {}, onSave
}) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const [recipientEmail, setRecipientEmail] = useState('');
    const [sendNow, setSendNow] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState(false);

    useEffect(() => {
        if (open && template) {
            const initial: Record<string, string> = {};
            template.variables.forEach(v => { initial[v.key] = defaultValues[v.key] ?? v.defaultValue ?? ''; });
            setValues(initial);
            setGenerated(false);
        }
    }, [open, template]);

    const set = (k: string, v: string) => setValues(prev => ({ ...prev, [k]: v }));

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post('/agreements/generate', {
                templateId: template!.id, bookingId, filledVariables: values,
                sentTo: sendNow ? recipientEmail : undefined,
            });
            setGenerated(true);
            onSave();
        } catch (e) { console.error(e); }
        finally { setGenerating(false); }
    };

    if (!template) return null;
    const missingRequired = template.variables.filter(v => v.required && !values[v.key]?.trim());

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4, maxHeight: '90vh' } }}>
            <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontFamily: '"Lora", serif', fontWeight: 700, fontSize: '1.35rem', color: '#0f172a' }}>
                            ✍️ Generate Agreement
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{template.name}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <CloseOutlined fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>
            <Divider />
            <DialogContent sx={{ px: 3.5, py: 3 }}>
                {generated ? (
                    <Stack alignItems="center" spacing={2.5} py={4}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                            ✅
                        </Box>
                        <Typography variant="h6" fontWeight={800} textAlign="center">Agreement Generated!</Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center">
                            {sendNow && recipientEmail ? `Sent to ${recipientEmail} for digital signature` : 'Agreement created and saved to document vault'}
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                            <Button variant="outlined" startIcon={<DownloadOutlined />} sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}>
                                Download PDF
                            </Button>
                            <Button variant="contained" disableElevation onClick={onClose} sx={{ textTransform: 'none', borderRadius: 2.5, fontWeight: 700 }}>
                                Done
                            </Button>
                        </Stack>
                    </Stack>
                ) : (
                    <Stack spacing={3}>
                        <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>
                            Fill Template Variables
                        </Typography>
                        <Grid container spacing={2}>
                            {template.variables.map(v => (
                                <Grid item xs={12} sm={v.type === 'text' && v.key.includes('address') ? 12 : 6} key={v.key}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>
                                        {v.label}{v.required ? ' *' : ''}
                                    </Typography>
                                    <TextField fullWidth size="small" type={v.type === 'date' ? 'date' : 'text'}
                                        value={values[v.key] ?? ''} onChange={e => set(v.key, e.target.value)}
                                        placeholder={v.defaultValue ?? ''}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={v.type === 'currency' ? { startAdornment: <InputAdornment position="start">₹</InputAdornment> } : undefined}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                                </Grid>
                            ))}
                        </Grid>

                        <Divider />

                        <Box>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1.5 }}>
                                Delivery Options
                            </Typography>
                            <Stack spacing={1.5}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between"
                                    sx={{
                                        p: 2, borderRadius: 3, border: '1.5px solid', borderColor: sendNow ? '#6366f1' : '#e5e7eb',
                                        bgcolor: sendNow ? '#eef2ff' : '#fff', cursor: 'pointer'
                                    }}
                                    onClick={() => setSendNow(true)}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <SendOutlined sx={{ color: sendNow ? '#6366f1' : '#9ca3af', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={700}>Send for Digital Signature</Typography>
                                            <Typography variant="caption" color="text.secondary">Email agreement with e-sign link</Typography>
                                        </Box>
                                    </Stack>
                                    <Box sx={{
                                        width: 18, height: 18, borderRadius: '50%', border: `2px solid ${sendNow ? '#6366f1' : '#d1d5db'}`,
                                        bgcolor: sendNow ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {sendNow && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />}
                                    </Box>
                                </Stack>

                                <Stack direction="row" alignItems="center" justifyContent="space-between"
                                    sx={{
                                        p: 2, borderRadius: 3, border: '1.5px solid', borderColor: !sendNow ? '#6366f1' : '#e5e7eb',
                                        bgcolor: !sendNow ? '#eef2ff' : '#fff', cursor: 'pointer'
                                    }}
                                    onClick={() => setSendNow(false)}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <DownloadOutlined sx={{ color: !sendNow ? '#6366f1' : '#9ca3af', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight={700}>Generate PDF Only</Typography>
                                            <Typography variant="caption" color="text.secondary">Save to vault, share manually later</Typography>
                                        </Box>
                                    </Stack>
                                    <Box sx={{
                                        width: 18, height: 18, borderRadius: '50%', border: `2px solid ${!sendNow ? '#6366f1' : '#d1d5db'}`,
                                        bgcolor: !sendNow ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {!sendNow && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />}
                                    </Box>
                                </Stack>
                            </Stack>

                            {sendNow && (
                                <TextField fullWidth label="Recipient Email *" size="small" type="email"
                                    value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                                    sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                            )}
                        </Box>
                    </Stack>
                )}
            </DialogContent>

            {!generated && (
                <>
                    <Divider />
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
                        <Button variant="contained" disableElevation onClick={handleGenerate}
                            disabled={generating || missingRequired.length > 0 || (sendNow && !recipientEmail)}
                            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
                            {generating ? <CircularProgress size={18} color="inherit" /> : sendNow ? '📧 Generate & Send' : '📄 Generate PDF'}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

// ─── E-Signature Canvas ───────────────────────────────────────────────────────

export const ESignatureDialog: React.FC<{
    open: boolean; onClose: () => void;
    agreementId: string; customerName: string; agreementTitle: string;
    onSigned: () => void;
}> = ({ open, onClose, agreementId, customerName, agreementTitle, onSigned }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [method, setMethod] = useState<'draw' | 'upload' | 'otp'>('draw');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [signing, setSigning] = useState(false);

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setDrawing(true);
        ctx.beginPath();
        const rect = canvasRef.current!.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#0f172a';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasSignature(true);
    };
    const endDraw = () => setDrawing(false);
    const clearSig = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) { ctx.clearRect(0, 0, 600, 160); setHasSignature(false); }
    };

    const handleSign = async () => {
        setSigning(true);
        try {
            const signatureData = method === 'draw' ? canvasRef.current?.toDataURL() : undefined;
            await api.post(`/agreements/${agreementId}/sign`, { method, signatureData, otp: method === 'otp' ? otp : undefined });
            onSigned(); onClose();
        } catch (e) { console.error(e); }
        finally { setSigning(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 4 } }}>
            <Box sx={{ px: 3.5, pt: 3, pb: 2.5, bgcolor: '#0f172a' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography sx={{ fontFamily: '"Lora", serif', fontWeight: 700, fontSize: '1.2rem', color: '#f1f5f9' }}>
                            ✍️ Digital Signature
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{agreementTitle}</Typography>
                    </Box>
                    <IconButton size="small" onClick={onClose} sx={{ color: '#64748b', border: '1px solid #1e293b', borderRadius: 2 }}>
                        <CloseOutlined fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>
            <Divider />
            <DialogContent sx={{ px: 3.5, py: 3 }}>
                <Stack spacing={3}>
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                        Signing as <strong>{customerName}</strong> — this signature is legally binding
                    </Alert>

                    {/* Method tabs */}
                    <Stack direction="row" spacing={1.25}>
                        {[
                            { k: 'draw', label: 'Draw Signature', icon: '✏️' },
                            { k: 'upload', label: 'Upload Image', icon: '📎' },
                            { k: 'otp', label: 'OTP Confirm', icon: '📱' },
                        ].map(m => (
                            <Box key={m.k} onClick={() => setMethod(m.k as any)}
                                sx={{
                                    flex: 1, p: 1.75, borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                                    border: '2px solid', transition: 'all .15s',
                                    borderColor: method === m.k ? '#6366f1' : '#e5e7eb',
                                    bgcolor: method === m.k ? '#eef2ff' : '#fff'
                                }}>
                                <Typography fontSize={20}>{m.icon}</Typography>
                                <Typography variant="caption" fontWeight={800} sx={{ color: method === m.k ? '#6366f1' : '#9ca3af', display: 'block', fontSize: 10 }}>
                                    {m.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    {method === 'draw' && (
                        <Box>
                            <Stack direction="row" justifyContent="space-between" mb={1}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Sign in the box below</Typography>
                                <Button size="small" sx={{ textTransform: 'none', fontSize: 11 }} onClick={clearSig}>Clear</Button>
                            </Stack>
                            <Box sx={{
                                border: '2px solid', borderColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden',
                                bgcolor: '#fafafa', cursor: 'crosshair'
                            }}>
                                <canvas ref={canvasRef} width={600} height={160} style={{ display: 'block', width: '100%', height: 160 }}
                                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw} />
                            </Box>
                            {!hasSignature && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.75 }}>
                                    Draw your signature above
                                </Typography>
                            )}
                        </Box>
                    )}

                    {method === 'upload' && (
                        <Box sx={{ p: 4, border: '2px dashed #d1d5db', borderRadius: 3, textAlign: 'center', cursor: 'pointer', bgcolor: '#fafafa' }}>
                            <Typography fontSize={36} mb={1}>📎</Typography>
                            <Typography variant="body2" fontWeight={700}>Upload signature image</Typography>
                            <Typography variant="caption" color="text.secondary">JPG or PNG, transparent background preferred</Typography>
                        </Box>
                    )}

                    {method === 'otp' && (
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                An OTP will be sent to the customer's registered mobile number to confirm identity.
                            </Typography>
                            <Stack direction="row" spacing={1.5}>
                                <Button variant="outlined" disabled={otpSent}
                                    onClick={() => setOtpSent(true)}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2.5, whiteSpace: 'nowrap' }}>
                                    {otpSent ? '✅ OTP Sent' : '📱 Send OTP'}
                                </Button>
                                <TextField fullWidth label="Enter 6-digit OTP" size="small" value={otp}
                                    onChange={e => setOtp(e.target.value.slice(0, 6))} disabled={!otpSent}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }} />
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
                <Button variant="contained" disableElevation onClick={handleSign}
                    disabled={signing || (method === 'draw' && !hasSignature) || (method === 'otp' && otp.length !== 6)}
                    sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
                    {signing ? <CircularProgress size={18} color="inherit" /> : '✍️ Sign Agreement'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default KYCVerificationPanel;