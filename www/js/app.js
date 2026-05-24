import { initActions } from './actions.js?v=20260523-notes';
import { render } from './render.js?v=20260523-notes';
import { loadState } from './store.js?v=20260523-notes';
import { maybeShowFirstRunTour } from './ui.js?v=20260523-notes';

loadState();
initActions();
render();
maybeShowFirstRunTour();
