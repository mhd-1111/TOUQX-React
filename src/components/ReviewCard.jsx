const ReviewCard = ({ review }) => {
  const content = review.content.length > 450 
    ? review.content.substring(0, 450) + "..." 
    : review.content;

  return (
    <div className="review-card">
      <h3>⭐ {review.author_details.rating ?? "N/A"}/10</h3>
      <p>{content}</p>
      <div className="review-author">— {review.author}</div>
    </div>
  );
};

export default ReviewCard;
