import './styles/tokens.css';
import './styles/ui.css';
import { createGame } from './game/createGame';
const game = createGame();
if (import.meta.hot) import.meta.hot.dispose(() => game.destroy(true));
