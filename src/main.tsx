import './main.css';

import { createRoot } from 'react-dom/client';

import App from './app';

const container = document.getElementById('root');
const root = createRoot(container as HTMLDivElement);
root.render(<App />);
