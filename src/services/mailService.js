
const STORAGE_KEY = 'gravity_mails';

const mockMails = [
    {
        id: 1,
        folder: 'Inbox',
        from: { name: 'John Doe', email: 'john@example.com' },
        to: 'me',
        subject: 'Project Update: Q4 Goals',
        body: "Hi Team,\n\nI hope you're all having a great week. I wanted to share a quick update regarding our progress on the Q4 goals. We are currently on track to meet our primary objectives, but we need to double down on the marketing initiative.\n\nKey highlights:\n- User acquisition is up by 15%\n- Retention rate has stabilized at 85%\n- New feature rollout is scheduled for next Tuesday\n\nPlease review the attached documents for more detailed metrics.\n\nBest,\nJohn",
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        read: false,
        starred: false,
        attachments: [{ name: 'Q4_Report_Final.pdf', size: '2.4 MB' }]
    },
    {
        id: 2,
        folder: 'Inbox',
        from: { name: 'Alice Smith', email: 'alice@example.com' },
        to: 'me',
        subject: 'Meeting Reschedule',
        body: "Hey, can we move our meeting to 3 PM instead of 2 PM? Something came up.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: true,
        starred: true,
        attachments: []
    },
    {
        id: 3,
        folder: 'Inbox',
        from: { name: 'Support Team', email: 'support@service.com' },
        to: 'me',
        subject: 'Ticket #12345 Resolved',
        body: "Your issue has been resolved. Please rate our service.",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        read: true,
        starred: false,
        attachments: []
    },
    {
        id: 4,
        folder: 'Drafts',
        from: { name: 'Me', email: 'me@example.com' },
        to: 'HR',
        subject: 'Holiday Request',
        body: "Hi, I would like to request leave for...",
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        read: true,
        starred: false,
        attachments: []
    },
    {
        id: 5,
        folder: 'Inbox',
        from: { name: 'Newsletter', email: 'news@tech.com' },
        to: 'me',
        subject: 'Tech Trends 2024',
        body: "Here are the top tech trends to watch out for in 2024...",
        date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        read: false,
        starred: false,
        attachments: []
    }
];

export const mailService = {
    initialize: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMails));
        }
    },

    getAllMails: () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    getMailsByFolder: (folder) => {
        const mails = mailService.getAllMails();
        if (folder === 'Starred') {
            return mails.filter(m => m.starred && m.folder !== 'Trash');
        }
        return mails.filter(m => m.folder === folder);
    },

    getMail: (id) => {
        const mails = mailService.getAllMails();
        return mails.find(m => m.id === id);
    },

    createMail: (mail) => {
        const mails = mailService.getAllMails();
        const newMail = {
            ...mail,
            id: Date.now(),
            date: new Date().toISOString(),
            read: true,
            folder: 'Sent', // By default, created mails go to Sent
            starred: false,
            attachments: mail.attachments || []
        };
        mails.unshift(newMail);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mails));
        return newMail;
    },

    updateMail: (id, updates) => {
        const mails = mailService.getAllMails();
        const index = mails.findIndex(m => m.id === id);
        if (index !== -1) {
            mails[index] = { ...mails[index], ...updates };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mails));
            return mails[index];
        }
        return null;
    },

    deleteMail: (id) => {
        let mails = mailService.getAllMails();
        const mail = mails.find(m => m.id === id);

        if (mail) {
            if (mail.folder === 'Trash') {
                // Permanently delete
                mails = mails.filter(m => m.id !== id);
            } else {
                // Move to Trash
                mail.folder = 'Trash';
                // We need to write back the modified mail object into the array if we didn't use map/filter above that creates new ref for the *list* but mutation works if object ref is same.
                // However, let's be safe and map it.
                mails = mails.map(m => m.id === id ? { ...m, folder: 'Trash' } : m);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mails));
        }
    }
};

// Initialize on load
mailService.initialize();
