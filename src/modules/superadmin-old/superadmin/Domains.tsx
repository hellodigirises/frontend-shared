import React, { useState } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton } from '@mui/material';
import { DomainOutlined, CheckCircleOutlined, ErrorOutline, DeleteOutline } from '@mui/icons-material';

const initialDomains = [
  { id: '1', tenant: 'Tiny Homes', domain: 'tiny.realesso.com', type: 'SUBDOMAIN', verified: true, ssl: 'Active' },
  { id: '2', tenant: 'Modern Realty', domain: 'crm.modernrealty.com', type: 'CUSTOM_DOMAIN', verified: false, ssl: 'Pending' },
  { id: '3', tenant: 'Global Empire', domain: 'sales.global.com', type: 'CUSTOM_DOMAIN', verified: true, ssl: 'Active' },
];

const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState(initialDomains);

  const toggleVerification = (id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, verified: !d.verified, ssl: !d.verified ? 'Active' : 'Pending' } : d));
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Tenant Domains</Typography>
        <Typography variant="body1" color="text.secondary">Manage subdomains and custom domains for all tenants.</Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'var(--bg-subtle)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Domain Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SSL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {domains.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.tenant}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DomainOutlined fontSize="small" color="disabled" />
                      <Typography variant="body2">{row.domain}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.type} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    {row.verified ? (
                      <Chip icon={<CheckCircleOutlined />} label="Verified" size="small" color="success" sx={{ fontWeight: 600 }} />
                    ) : (
                      <Chip icon={<ErrorOutline />} label="Unverified" size="small" color="warning" sx={{ fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={row.ssl === 'Active' ? 'success.main' : 'text.disabled'}>
                      {row.ssl}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {!row.verified && (
                        <Button size="small" variant="contained" color="success" onClick={() => toggleVerification(row.id)}>
                          Verify DNS
                        </Button>
                      )}
                      <IconButton size="small" color="error">
                        <DeleteOutline />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DomainsPage;
