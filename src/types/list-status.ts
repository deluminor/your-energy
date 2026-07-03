export interface ListStatus {
  showRefreshing: (root: HTMLElement) => void;
  hideRefreshing: (root: HTMLElement) => void;
  renderLoading: (root: HTMLElement, srLabel: string) => void;
  renderEmpty: (root: HTMLElement, message: string) => void;
}
