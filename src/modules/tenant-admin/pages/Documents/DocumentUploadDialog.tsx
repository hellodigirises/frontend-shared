import React, { useState, useRef, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Stack, Button, TextField, Chip,
  IconButton, Divider, Grid, Paper, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Alert,
  LinearProgress
} from '@mui/material';
import {
  CloseOutlined, CloudUploadOutlined, InsertDriveFileOutlined,
  DeleteOutlineOutlined, CheckCircleOutlined, ImageOutlined
} from '@mui/icons-material';
import {
  DocumentCategory, EntityType, FileType,
  DOC_CATEGORY_CFG, ENTITY_TYPE_CFG, FILE_TYPE_CFG,
  formatFileSize, getFileType
} from './documentTypes';
import api from '../../../../api/axios';

interface UploadFile {
  id: string;
  file: File;
  fileType: FileType;
  displayName: string;
  category: DocumentCategory;
  description: string;
  tags: string[];
  expiryDate: string;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  entityLabel?: string;
  defaultCategory?: DocumentCategory;
  onSave: () => void;
}

const SUGGESTED_TAGS: Record<DocumentCategory, string[]> = {
  KYC: ['Identity', 'Verified', 'Original', 'Self-attested'],
  LEGAL: ['RERA', 'Approved', 'Certified', 'Notarized'],
  FINANCE: ['Receipt', 'Invoice', 'Tax', 'Statement'],
  MARKETING: ['Brochure', 'Floor Plan', '3D', 'Master Plan'],
  INTERNAL: ['Confidential', 'Draft', 'Final'],
  AGREEMENT: ['Signed', 'Pending Signature', 'Draft'],
};

const DocumentUploadDialog: React.FC<Props> = ({
  open, onClose, entityType, entityId, entityLabel, defaultCategory = 'KYC', onSave
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createUploadFile = (file: File, cat: DocumentCategory): UploadFile => {
    const ft = getFileType(file.name);
    const preview = (ft === 'JPG' || ft === 'PNG') ? URL.createObjectURL(file) : undefined;
    return {
      id: `${Date.now()}-${Math.random()}`,
      file, fileType: ft,
      displayName: file.name.replace(/\.[^.]+$/, ''),
      category: cat, description: '', tags: [],
      expiryDate: '', preview, progress: 0, status: 'pending',
    };
  };

  const addFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(f => createUploadFile(f, defaultCategory));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, [defaultCategory]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const updateFile = (id: string, updates: Partial<UploadFile>) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const toggleTag = (fileId: string, tag: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    const tags = file.tags.includes(tag) ? file.tags.filter(t => t !== tag) : [...file.tags, tag];
    updateFile(fileId, { tags });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    for (const f of files) {
      if (f.status !== 'pending') continue;
      updateFile(f.id, { status: 'uploading', progress: 10 });
      try {
        const formData = new FormData();
        formData.append('file', f.file);
        formData.append('displayName', f.displayName);
        formData.append('category', f.category);
        formData.append('description', f.description);
        formData.append('tags', JSON.stringify(f.tags));
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);
        if (f.expiryDate) formData.append('expiryDate', f.expiryDate);
        updateFile(f.id, { progress: 50 });
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = e.total ? Math.round((e.loaded / e.total) * 80) + 10 : 50;
            updateFile(f.id, { progress: pct });
          },
        });
        updateFile(f.id, { status: 'done', progress: 100 });
      } catch (e: any) {
        updateFile(f.id, { status: 'error', error: 'Upload failed. Try again.' });
      }
    }
    setUploading(false);
    const allDone = files.every(f => f.status === 'done' || f.status === 'error');
    if (allDone && files.some(f => f.status === 'done')) { onSave(); setTimeout(onClose, 800); }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, maxHeight: '94vh' } }}>

      <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontFamily: '"Lora", serif', fontWeight: 700, fontSize: '1.4rem', color: '#0f172a' }}>
              📂 Upload Documents
            </Typography>
            {entityLabel && (
              <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                <Typography fontSize={13} sx={{ color: ENTITY_TYPE_CFG[entityType].color }}>
                  {ENTITY_TYPE_CFG[entityType].icon} {entityLabel}
                </Typography>
              </Stack>
            )}
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider />
      <DialogContent sx={{ px: 3.5, py: 3 }}>
        <Stack spacing={3}>
          {/* Drop Zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: isDragging ? '#6366f1' : '#d1d5db',
              borderRadius: 4, p: 5, textAlign: 'center', cursor: 'pointer',
              bgcolor: isDragging ? '#eef2ff' : '#fafafa',
              transition: 'all .2s',
              '&:hover': { borderColor: '#6366f1', bgcolor: '#f5f3ff' },
            }}>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
              style={{ display: 'none' }} onChange={e => e.target.files && addFiles(e.target.files)} />
            <CloudUploadOutlined sx={{ fontSize: 48, color: isDragging ? '#6366f1' : '#d1d5db', mb: 1.5, transition: 'color .2s' }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: isDragging ? '#6366f1' : '#374151', mb: 0.75 }}>
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>or click to browse</Typography>
            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
              {['PDF', 'JPG', 'PNG', 'DOCX', 'XLSX'].map(t => (
                <Chip key={t} label={t} size="small" sx={{ fontWeight: 700, fontSize: 10 }} />
              ))}
            </Stack>
          </Box>

          {/* File list */}
          {files.length > 0 && (
            <Stack spacing={2}>
              {files.map(f => {
                const ftCfg = FILE_TYPE_CFG[f.fileType];
                const catCfg = DOC_CATEGORY_CFG[f.category];
                const isImg = f.fileType === 'JPG' || f.fileType === 'PNG';
                return (
                  <Paper key={f.id} variant="outlined" sx={{
                    borderRadius: 3, overflow: 'hidden',
                    borderColor: f.status === 'done' ? '#6ee7b7' : f.status === 'error' ? '#fca5a5' : '#e5e7eb'
                  }}>

                    {/* File header */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2.5, py: 2 }}>
                      {isImg && f.preview ? (
                        <Box sx={{ width: 48, height: 48, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={f.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ) : (
                        <Box sx={{
                          width: 48, height: 48, borderRadius: 2, bgcolor: ftCfg.color + '15',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24
                        }}>
                          {ftCfg.icon}
                        </Box>
                      )}

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={700} noWrap sx={{ flex: 1 }}>{f.file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatFileSize(f.file.size)}</Typography>
                          {f.status === 'done' && <CheckCircleOutlined sx={{ color: '#10b981', fontSize: 18 }} />}
                          {f.status !== 'uploading' && f.status !== 'done' && (
                            <IconButton size="small" onClick={() => removeFile(f.id)}><DeleteOutlineOutlined sx={{ fontSize: 16 }} /></IconButton>
                          )}
                        </Stack>
                        {f.status === 'uploading' && (
                          <LinearProgress variant="determinate" value={f.progress} sx={{
                            mt: 0.75, height: 4, borderRadius: 2,
                            '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' }
                          }} />
                        )}
                        {f.status === 'error' && <Typography variant="caption" sx={{ color: '#ef4444' }}>{f.error}</Typography>}
                      </Box>
                    </Stack>

                    {/* File config */}
                    {f.status === 'pending' && (
                      <Box sx={{ px: 2.5, pb: 2.5, borderTop: '1px solid #f1f5f9', pt: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={5}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>
                              Display Name
                            </Typography>
                            <TextField fullWidth size="small" value={f.displayName}
                              onChange={e => updateFile(f.id, { displayName: e.target.value })}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>
                              Category
                            </Typography>
                            <FormControl fullWidth size="small">
                              <Select value={f.category} onChange={e => updateFile(f.id, { category: e.target.value as DocumentCategory })}
                                sx={{ borderRadius: 2 }}>
                                {Object.entries(DOC_CATEGORY_CFG).map(([k, v]) => (
                                  <MenuItem key={k} value={k}>{v.icon} {v.label}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>
                              Expiry Date
                            </Typography>
                            <TextField fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                              value={f.expiryDate} onChange={e => updateFile(f.id, { expiryDate: e.target.value })}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                          </Grid>
                          <Grid item xs={12}>
                            <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', mb: 1 }}>
                              Quick Tags
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" spacing={0.75}>
                              {(SUGGESTED_TAGS[f.category] ?? []).map(tag => (
                                <Chip key={tag} label={tag} size="small" clickable
                                  variant={f.tags.includes(tag) ? 'filled' : 'outlined'}
                                  color={f.tags.includes(tag) ? 'primary' : 'default'}
                                  onClick={() => toggleTag(f.id, tag)}
                                  sx={{ fontWeight: 700, fontSize: 10, my: 0.25 }} />
                              ))}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          )}

          {doneCount > 0 && (
            <Alert severity="success" sx={{ borderRadius: 3 }}>
              {doneCount} file{doneCount > 1 ? 's' : ''} uploaded successfully
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {files.length} file{files.length !== 1 ? 's' : ''} selected{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={handleUpload}
            disabled={uploading || pendingCount === 0}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2.5, px: 4 }}>
            {uploading ? <CircularProgress size={18} color="inherit" /> : `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadDialog;