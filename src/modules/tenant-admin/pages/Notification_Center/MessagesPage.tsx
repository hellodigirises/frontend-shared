import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, Stack, Button, Chip, IconButton,
    Paper, Divider, Avatar, TextField, InputAdornment,
    Tooltip, Badge, CircularProgress, Menu, MenuItem
} from '@mui/material';
import {
    SearchOutlined, AddOutlined, AttachFileOutlined,
    SendOutlined, MoreVertOutlined, EmojiEmotionsOutlined,
    DoneAllOutlined, PushPinOutlined, GroupAddOutlined,
    ArchiveOutlined, CloseOutlined, MicOutlined
} from '@mui/icons-material';
import {
    Conversation, Message, ConvParticipant,
    avatarColor, initials, timeAgo, formatTime, formatDate, formatFileSize
} from './notifTypes';
import api from '../../../../api/axios';

interface Props {
    conversations: Conversation[];
    currentUserId: string;
    currentUserName: string;
    onRefresh: () => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😊', '🎉', '😂', '🔥'];

// ─── Conversation Item ────────────────────────────────────────────────────────
const ConvItem: React.FC<{
    conv: Conversation;
    selected: boolean;
    onClick: () => void;
    currentUserId: string;
}> = ({ conv, selected, onClick, currentUserId }) => {
    const other = (conv.participants || []).find(p => p.id !== currentUserId);
    const name = conv.type === 'GROUP' ? (conv.name ?? 'Group') : (other?.name ?? 'Unknown');
    const isOnline = conv.type === 'DIRECT' && !!other?.isOnline;

    return (
        <Box onClick={onClick} sx={{
            px: 2, py: 1.75, cursor: 'pointer', transition: 'all .12s',
            bgcolor: selected ? '#eef2ff' : 'transparent',
            borderLeft: `3px solid ${selected ? '#6366f1' : 'transparent'}`,
            '&:hover': { bgcolor: selected ? '#eef2ff' : '#f8fafc' },
        }}>
            <Stack direction="row" spacing={1.75} alignItems="center">
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    {conv.type === 'GROUP' ? (
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 3, bgcolor: '#eef2ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                        }}>
                            👥
                        </Box>
                    ) : (
                        <Avatar sx={{ width: 40, height: 40, bgcolor: avatarColor(name), fontSize: 14, fontWeight: 900 }}>
                            {initials(name)}
                        </Avatar>
                    )}
                    {isOnline && (
                        <Box sx={{
                            width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981',
                            border: '2px solid #fff', position: 'absolute', bottom: -1, right: -1
                        }} />
                    )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={conv.unreadCount > 0 ? 900 : 700}
                            noWrap sx={{ color: '#0f172a' }}>
                            {name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>
                            {conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color={conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                            fontWeight={conv.unreadCount > 0 ? 700 : 400} noWrap sx={{ flex: 1, fontSize: 12 }}>
                            {conv.lastMessage?.content ?? 'Start chatting...'}
                        </Typography>
                        {conv.unreadCount > 0 && (
                            <Box sx={{
                                width: 18, height: 18, borderRadius: 9, bgcolor: '#6366f1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Typography sx={{ fontSize: 10, fontWeight: 900, color: '#fff' }}>
                                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Stack>
        </Box>
    );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{
    msg: Message;
    isMine: boolean;
    showAvatar: boolean;
    onReact: (msgId: string, emoji: string) => void;
}> = ({ msg, isMine, showAvatar, onReact }) => {
    const [showActions, setShowActions] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
    const reactions = msg.reactions ?? {};
    const hasReactions = Object.values(reactions).some(arr => arr.length > 0);

    return (
        <Box sx={{
            display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
            alignItems: 'flex-end', gap: 1, mb: 0.75,
            '&:hover .msg-actions': { opacity: 1 },
        }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}>
            {/* Avatar */}
            {!isMine && (
                <Avatar sx={{
                    width: 28, height: 28, fontSize: 10, bgcolor: avatarColor(msg.senderName), fontWeight: 900,
                    opacity: showAvatar ? 1 : 0, flexShrink: 0
                }}>
                    {initials(msg.senderName)}
                </Avatar>
            )}

            <Box sx={{ maxWidth: '68%' }}>
                {/* Sender name */}
                {!isMine && showAvatar && (
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#374151', display: 'block', mb: 0.5, ml: 0.5 }}>
                        {msg.senderName}
                    </Typography>
                )}

                {/* Reply preview */}
                {msg.replyToContent && (
                    <Box sx={{
                        mb: 0.5, px: 1.5, py: 0.75, borderRadius: '12px 12px 0 0',
                        bgcolor: isMine ? '#3730a3' : '#f3f4f6', borderLeft: '3px solid',
                        borderLeftColor: isMine ? '#c7d2fe' : '#d1d5db'
                    }}>
                        <Typography variant="caption" sx={{ color: isMine ? '#c7d2fe' : '#6b7280', display: 'block' }} noWrap>
                            {msg.replyToContent}
                        </Typography>
                    </Box>
                )}

                {/* Bubble */}
                <Box sx={{
                    px: 2, py: 1.25, borderRadius: msg.replyToContent
                        ? `0 0 ${isMine ? '16px 4px' : '4px 16px'} 16px`
                        : isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    bgcolor: isMine ? '#6366f1' : '#fff',
                    boxShadow: isMine ? 'none' : '0 1px 3px rgba(0,0,0,.08)',
                    border: isMine ? 'none' : '1px solid #f1f5f9',
                }}>
                    {msg.attachments?.map(att => (
                        <Box key={att.id} sx={{ mb: 1, p: 1.5, borderRadius: 2, bgcolor: isMine ? '#4338ca' : '#f8fafc', cursor: 'pointer' }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontSize={20}>📎</Typography>
                                <Box>
                                    <Typography variant="caption" fontWeight={700} sx={{ color: isMine ? '#e0e7ff' : '#374151' }}>{att.fileName}</Typography>
                                    <Typography variant="caption" sx={{ color: isMine ? '#a5b4fc' : '#9ca3af', display: 'block', fontSize: 10 }}>{formatFileSize(att.fileSize)}</Typography>
                                </Box>
                            </Stack>
                        </Box>
                    ))}

                    <Typography variant="body2" sx={{ color: isMine ? '#fff' : '#0f172a', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5} mt={0.5}>
                        <Typography variant="caption" sx={{ fontSize: 9, color: isMine ? '#a5b4fc' : '#9ca3af' }}>
                            {formatTime(msg.createdAt)}
                        </Typography>
                        {isMine && (
                            <Typography sx={{ fontSize: 12 }}>
                                {msg.status === 'READ' ? '✓✓' : msg.status === 'DELIVERED' ? '✓✓' : '✓'}
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {/* Reactions */}
                {hasReactions && (
                    <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap"
                        justifyContent={isMine ? 'flex-end' : 'flex-start'}>
                        {Object.entries(reactions).filter(([, arr]) => arr.length > 0).map(([emoji, users]) => (
                            <Box key={emoji} onClick={() => onReact(msg.id, emoji)}
                                sx={{
                                    px: 1, py: 0.25, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e5e7eb',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5,
                                    '&:hover': { bgcolor: '#f3f4f6' }
                                }}>
                                <Typography fontSize={13}>{emoji}</Typography>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{users.length}</Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>

            {/* Hover actions */}
            {showActions && (
                <Stack className="msg-actions" direction="row" spacing={0.25}
                    sx={{ opacity: 0, transition: 'opacity .15s', alignSelf: 'center' }}>
                    <Tooltip title="React">
                        <IconButton size="small" onClick={e => setEmojiAnchor(e.currentTarget)}
                            sx={{ width: 24, height: 24, bgcolor: 'background.paper', boxShadow: 1 }}>
                            <EmojiEmotionsOutlined sx={{ fontSize: 13 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}

            {/* Emoji picker */}
            <Menu anchorEl={emojiAnchor} open={!!emojiAnchor} onClose={() => setEmojiAnchor(null)}>
                <Stack direction="row" sx={{ px: 1 }}>
                    {EMOJI_REACTIONS.map(e => (
                        <MenuItem key={e} onClick={() => { onReact(msg.id, e); setEmojiAnchor(null); }}
                            sx={{ fontSize: 20, p: 0.75, borderRadius: 1.5, minWidth: 0 }}>
                            {e}
                        </MenuItem>
                    ))}
                </Stack>
            </Menu>
        </Box>
    );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────
const ChatPanel: React.FC<{
    conv: Conversation;
    messages: Message[];
    currentUserId: string;
    onSend: (content: string, attachments?: File[]) => Promise<void>;
    onReact: (msgId: string, emoji: string) => void;
    loading: boolean;
}> = ({ conv, messages, currentUserId, onSend, onReact, loading }) => {
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const endRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const other = conv.participants.find(p => p.id !== currentUserId);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return;
        setSending(true);
        try { await onSend(input.trim(), attachments); setInput(''); setAttachments([]); }
        catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const name = conv.type === 'GROUP' ? (conv.name ?? 'Group') : (other?.name ?? 'Unknown');
    const isOnline = conv.type === 'DIRECT' && other?.isOnline;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat header */}
            <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ position: 'relative' }}>
                            {conv.type === 'GROUP' ? (
                                <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</Box>
                            ) : (
                                <Avatar sx={{ width: 38, height: 38, bgcolor: avatarColor(name), fontSize: 13, fontWeight: 900 }}>{initials(name)}</Avatar>
                            )}
                            {isOnline && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981', border: '2px solid #fff', position: 'absolute', bottom: -1, right: -1 }} />}
                        </Box>
                        <Box>
                            <Typography variant="body1" fontWeight={800}>{name}</Typography>
                            <Typography variant="caption" sx={{ color: isOnline ? '#10b981' : '#9ca3af', fontWeight: isOnline ? 700 : 400 }}>
                                {isOnline ? 'Online now' : other?.lastSeen ? `Last seen ${timeAgo(other.lastSeen)}` : `${conv.participants.length} members`}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                        <IconButton size="small"><MoreVertOutlined fontSize="small" /></IconButton>
                    </Stack>
                </Stack>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2, bgcolor: '#f8fafc' }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}><CircularProgress size={28} /></Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <Typography fontSize={36} mb={1}>💬</Typography>
                        <Typography variant="body2">Send a message to start the conversation</Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map((msg, i) => {
                            const isMine = msg.senderId === currentUserId;
                            const showAvatar = !isMine && (i === 0 || messages[i - 1].senderId !== msg.senderId);
                            const isNewDay = i === 0 || formatDate(messages[i - 1].createdAt) !== formatDate(msg.createdAt);
                            return (
                                <React.Fragment key={msg.id}>
                                    {isNewDay && (
                                        <Box sx={{ textAlign: 'center', my: 2 }}>
                                            <Chip label={formatDate(msg.createdAt)} size="small"
                                                sx={{ bgcolor: '#e2e8f0', color: '#64748b', fontWeight: 700, fontSize: 10 }} />
                                        </Box>
                                    )}
                                    <MessageBubble msg={msg} isMine={isMine} showAvatar={showAvatar}
                                        onReact={onReact} />
                                </React.Fragment>
                            );
                        })}
                        <div ref={endRef} />
                    </>
                )}
            </Box>

            {/* Attachment previews */}
            {attachments.length > 0 && (
                <Box sx={{ px: 2.5, py: 1.25, bgcolor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {attachments.map((f, i) => (
                            <Chip key={i} label={f.name} size="small"
                                onDelete={() => setAttachments(a => a.filter((_, j) => j !== i))}
                                sx={{ fontWeight: 700, fontSize: 10 }} />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Input bar */}
            <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff', borderTop: '1px solid #f1f5f9' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-end">
                    <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
                        onChange={e => e.target.files && setAttachments(a => [...a, ...Array.from(e.target.files!)])} />
                    <IconButton size="small" onClick={() => fileInputRef.current?.click()}
                        sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1' } }}>
                        <AttachFileOutlined />
                    </IconButton>
                    <TextField fullWidth multiline maxRows={4} size="small" value={input}
                        onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder={`Message ${name}...`}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#f8fafc' } }} />
                    <IconButton onClick={handleSend} disabled={sending || (!input.trim() && attachments.length === 0)}
                        sx={{
                            bgcolor: '#6366f1', color: '#fff', width: 40, height: 40, flexShrink: 0,
                            '&:hover': { bgcolor: '#4338ca' }, '&:disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                        }}>
                        {sending ? <CircularProgress size={16} color="inherit" /> : <SendOutlined />}
                    </IconButton>
                </Stack>
            </Box>
        </Box>
    );
};

// ─── Messages Page ────────────────────────────────────────────────────────────
const MessagesPage: React.FC<Props> = ({ conversations, currentUserId, currentUserName, onRefresh }) => {
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState('');
    const [loadingMsgs, setLoadingMsgs] = useState(false);

    const totalUnread = (conversations || []).reduce((s, c) => s + (c?.unreadCount || 0), 0);

    const filteredConvs = useMemo(() => {
        const convList = conversations || [];
        if (!search) return convList;
        const q = search.toLowerCase();
        return convList.filter(c => {
            const other = (c.participants || []).find(p => p.id !== currentUserId);
            return (other?.name ?? c.name ?? '').toLowerCase().includes(q) ||
                (c.lastMessage?.content ?? '').toLowerCase().includes(q);
        });
    }, [conversations, search, currentUserId]);

    const selectedConv = conversations.find(c => c.id === selectedConvId) ?? null;

    const loadMessages = async (convId: string) => {
        setLoadingMsgs(true);
        try {
            const res = await api.get(`/messages/${convId}`);
            setMessages(res.data?.data ?? res.data ?? []);
        } catch (e) { console.error(e); }
        finally { setLoadingMsgs(false); }
    };

    const handleSelectConv = (convId: string) => {
        setSelectedConvId(convId);
        loadMessages(convId);
    };

    const handleSend = async (content: string) => {
        if (!selectedConvId) return;
        const newMsg: Message = {
            id: `temp-${Date.now()}`, conversationId: selectedConvId,
            senderId: currentUserId, senderName: currentUserName,
            content, status: 'SENT', createdAt: new Date().toISOString(),
        };
        setMessages(m => [...m, newMsg]);
        await api.post('/messages', { conversationId: selectedConvId, content });
    };

    const handleReact = async (msgId: string, emoji: string) => {
        try { await api.post(`/messages/${msgId}/react`, { emoji }); }
        catch (e) { console.error(e); }
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', bgcolor: '#fff', borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            {/* Sidebar */}
            <Box sx={{ width: 320, borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* Sidebar header */}
                <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>Messages</Typography>
                            {totalUnread > 0 && (
                                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>{totalUnread} unread</Typography>
                            )}
                        </Box>
                        <Tooltip title="New conversation">
                            <IconButton size="small" sx={{ bgcolor: '#eef2ff', color: '#6366f1', '&:hover': { bgcolor: '#e0e7ff' } }}>
                                <AddOutlined />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                    <TextField fullWidth placeholder="Search messages..." size="small" value={search}
                        onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment>, sx: { borderRadius: 2.5 } }} />
                </Box>

                {/* Conversation list */}
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Stack divider={<Divider />}>
                        {filteredConvs.map(conv => (
                            <ConvItem key={conv.id} conv={conv} selected={selectedConvId === conv.id}
                                onClick={() => handleSelectConv(conv.id)} currentUserId={currentUserId} />
                        ))}
                    </Stack>
                    {filteredConvs.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography fontSize={32} mb={1}>💬</Typography>
                            <Typography variant="body2">No conversations found</Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Chat area */}
            {selectedConv ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <ChatPanel conv={selectedConv} messages={messages} currentUserId={currentUserId}
                        onSend={handleSend} onReact={handleReact} loading={loadingMsgs} />
                </Box>
            ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc' }}>
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        <Typography fontSize={56} mb={2}>💬</Typography>
                        <Typography variant="h6" fontWeight={700} mb={0.75}>Select a conversation</Typography>
                        <Typography variant="body2">Choose from your messages on the left</Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default MessagesPage;