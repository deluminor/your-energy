/**
 * @param {number} [rating]
 * @returns {string}
 */
export function renderRatingStars(rating = 0) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  return `<span class="rating-stars" data-rating="${safeRating}">★★★★★</span>`;
}
