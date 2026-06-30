import 'modern-normalize';
import { mountCategoryCard } from '../components/category-card/category-card.js';
import { mountDailyNorm } from '../components/daily-norm/daily-norm.js';
import { mountFilters } from '../components/filters/filters.js';
import { mountFooter } from '../components/footer/footer.js';
import { mountHeader } from '../components/header/header.js';
import { mountHero } from '../components/hero/hero.js';
import { mountPagination } from '../components/pagination/pagination.js';
import { mountQuote } from '../components/quote/quote.js';
import { mountScrollUp } from '../components/ui/scroll-up/scroll-up.js';
import '../styles/main.scss';

function bootstrap() {
  const at = (name) => document.querySelector(`[data-component="${name}"]`);

  mountHeader(at('header'));
  mountHero(at('hero'));
  mountFilters(at('filters'));
  mountCategoryCard(at('category-list'));
  mountPagination(at('pagination'));
  mountQuote(at('quote'));
  mountDailyNorm(at('daily-norm'));
  mountFooter(at('footer'));
  mountScrollUp(at('scroll-up'));
}

document.addEventListener('DOMContentLoaded', bootstrap);
