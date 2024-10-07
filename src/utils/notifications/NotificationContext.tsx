import React, { createContext, useContext, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

interface NotificationOptions {
    type: NotificationType;
    content: string;
}

interface NotificationContextProps {
    showNotification: (options: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<NotificationType>(NotificationType.SUCCESS);
    const [content, setContent] = useState('');

    const showNotification = ({ type, content }: NotificationOptions) => {
        setType(type);
        setContent(content);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
                    {content}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
