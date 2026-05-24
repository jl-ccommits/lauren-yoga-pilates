import { initActions } from './actions.js?v=20260523-duration50';
import { render } from './render.js?v=20260523-duration50';
import { loadState } from './store.js?v=20260523-duration50';
import { maybeShowFirstRunTour } from './ui.js?v=20260523-duration50';

loadState();
initActions();
render();
maybeShowFirstRunTour();
