import 'modern-normalize';
import { mountDailyNorm } from '../components/daily-norm/daily-norm.js';
import { mountExerciseCard } from '../components/exercise-card/exercise-card.js';
import { mountFooter } from '../components/footer/footer.js';
import { mountHeader } from '../components/header/header.js';
import { mountQuote } from '../components/quote/quote.js';
import { mountScrollUp } from '../components/ui/scroll-up/scroll-up.js';
import '../styles/main.scss';

function bootstrap() {
  const at = (name) => document.querySelector(`[data-component="${name}"]`);

  mountHeader(at('header'));
  mountExerciseCard(at('favorites-list'));
  mountQuote(at('quote'));
  mountDailyNorm(at('daily-norm'));
  mountFooter(at('footer'));
  mountScrollUp(at('scroll-up'));
}

document.addEventListener('DOMContentLoaded', bootstrap);
