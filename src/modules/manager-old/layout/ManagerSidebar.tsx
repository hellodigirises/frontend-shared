import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Collapse,
  Divider,
  Typography,
} from '@mui/material';
import {
  DashboardOutlined,
  PeopleAltOutlined,
  AccountTreeOutlined,
  ExploreOutlined,
  BookmarkAddedOutlined,
  AssignmentOutlined,
  ConfirmationNumberOutlined,
  NotificationsOutlined,
  BarChartOutlined,
  GroupsOutlined,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 256;

interface NavGroup {
  subheader?: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; icon: React.ReactNode; path: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: 'Team Dashboard', icon: <DashboardOutlined />, path: '/manager/dashboard' },
    ],
  },
  {
    subheader: 'TEAM MANAGEMENT',
    items: [
      { label: 'Agents', icon: <GroupsOutlined />, path: '/manager/agents' },
      { label: 'Leads Overview', icon: <PeopleAltOutlined />, path: '/manager/leads' },
      { label: 'Pipeline Overview', icon: <AccountTreeOutlined />, path: '/manager/pipeline' },
    ],
  },
  {
    subheader: 'OPERATIONS',
    items: [
      { label: 'Site Visits', icon: <ExploreOutlined />, path: '/manager/visits' },
      { label: 'Team Bookings', icon: <BookmarkAddedOutlined />, path: '/manager/bookings' },
      { label: 'Team Tasks', icon: <AssignmentOutlined />, path: '/manager/tasks' },
      { label: 'Calendar', icon: <AssignmentOutlined />, path: '/calendar' },
    ],
  },
  {
    subheader: 'ANALYTICS & SUPPORT',
    items: [
      { label: 'Reports', icon: <BarChartOutlined />, path: '/manager/reports' },
      { label: 'Tickets', icon: <ConfirmationNumberOutlined />, path: '/manager/tickets' },
      { label: 'Notifications', icon: <NotificationsOutlined />, path: '/manager/notifications' },
    ],
  },
];

const ManagerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#0F172A',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Realesso
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
          SALES MANAGER
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', flexGrow: 1, py: 1 }}>
        {NAV_GROUPS.map((group, gi) => (
          <Box key={gi}>
            {group.subheader && (
              <ListSubheader
                sx={{
                  bgcolor: 'transparent',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  lineHeight: '32px',
                  px: 3,
                }}
              >
                {group.subheader}
              </ListSubheader>
            )}
            <List dense disablePadding>
              {group.items.map((item) =>
                item.children ? (
                  <Box key={item.label}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => toggleGroup(item.label)}
                        sx={{
                          px: 2.5,
                          py: 1,
                          mx: 1,
                          borderRadius: 1.5,
                          color: 'rgba(255,255,255,0.6)',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                        />
                        {openGroups[item.label] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={openGroups[item.label]} timeout="auto" unmountOnExit>
                      <List dense disablePadding sx={{ pl: 2 }}>
                        {item.children.map((child) => (
                          <ListItem key={child.path} disablePadding>
                            <ListItemButton
                              selected={isActive(child.path)}
                              onClick={() => navigate(child.path)}
                              sx={{
                                px: 2.5,
                                py: 0.75,
                                mx: 1,
                                borderRadius: 1.5,
                                color: isActive(child.path) ? 'white' : 'rgba(255,255,255,0.5)',
                                bgcolor: isActive(child.path) ? 'rgba(245,158,11,0.25)' : 'transparent',
                                '&.Mui-selected': { bgcolor: 'rgba(245,158,11,0.25)' },
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' },
                                '&.Mui-selected:hover': { bgcolor: 'rgba(245,158,11,0.35)' },
                              }}
                            >
                              <ListItemIcon
                                sx={{ minWidth: 30, color: isActive(child.path) ? '#F59E0B' : 'inherit' }}
                              >
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                primaryTypographyProps={{ fontSize: 13, fontWeight: isActive(child.path) ? 600 : 400 }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ) : (
                  <ListItem key={item.label} disablePadding>
                    <ListItemButton
                      selected={!!(item.path && isActive(item.path))}
                      onClick={() => item.path && navigate(item.path)}
                      sx={{
                        px: 2.5,
                        py: 1,
                        mx: 1,
                        borderRadius: 1.5,
                        color: item.path && isActive(item.path) ? 'white' : 'rgba(255,255,255,0.6)',
                        bgcolor:
                          item.path && isActive(item.path) ? 'rgba(245,158,11,0.25)' : 'transparent',
                        '&.Mui-selected': { bgcolor: 'rgba(245,158,11,0.25)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: 'white' },
                        '&.Mui-selected:hover': { bgcolor: 'rgba(245,158,11,0.35)' },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: item.path && isActive(item.path) ? '#F59E0B' : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: item.path && isActive(item.path) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              )}
            </List>
            {gi < NAV_GROUPS.length - 1 && (
              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
            )}
          </Box>
        ))}
      </Box>
    </Drawer>
  );
};

export default ManagerSidebar;
