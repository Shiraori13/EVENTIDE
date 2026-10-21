import './styles/tokens.css';
import './styles/ui.css';
import './styles/identity.css';
import { createGame } from './game/createGame';
import { loadFonts } from './game/services/FontService';
let game: ReturnType<typeof createGame> | undefined;
let disposed = false;
void loadFonts().then(status => { document.documentElement.dataset.fontStatus = status; if (!disposed) game = createGame(); });
if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; game?.destroy(true); });
