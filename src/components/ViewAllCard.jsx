import { useNavigate } from 'react-router-dom';

const ViewAllCard = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div className="view-all-card" onClick={() => navigate(`/viewall?category=${category}`)}>
      <i className="fa-solid fa-arrow-right"></i>
      <h3>View All</h3>
    </div>
  );
};

export default ViewAllCard;
