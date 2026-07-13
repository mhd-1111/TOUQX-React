import { PROFILE_185 } from '../config';

const CastCard = ({ actor }) => {
  return (
    <div className="cast-card">
      <img src={`${PROFILE_185}${actor.profile_path}`} alt={actor.name} />
      <h4>{actor.name}</h4>
      <p>{actor.character || "Cast Member"}</p>
    </div>
  );
};

export default CastCard;
