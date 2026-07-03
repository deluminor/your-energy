export interface Exercise {
  _id: string;
  name: string;
  rating: number | string;
  burnedCalories: number | string;
  bodyPart: string;
  target: string;
  equipment?: string;
  popularity?: string | number;
  gifUrl?: string;
  description?: string;
}
