type TReview = {
  rating: number;
};

export class AvgRating {
  public static async getAvgRating(reviews: Array<TReview>) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return avgRating;
  }
}
