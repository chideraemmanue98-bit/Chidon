import { createContext } from 'react';

export const BookContext = createContext<{ onSendToBook?: (content: string, title?: string) => void }>({});
