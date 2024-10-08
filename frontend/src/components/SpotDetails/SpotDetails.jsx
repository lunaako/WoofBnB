import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom"
import { useEffect } from "react";
import { getASpotThunk } from "../../store/currSpot";
import './SpotDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw } from '@fortawesome/free-solid-svg-icons';
import ReviewsList from "./ReviewsList";
import { formatRating } from "../../utils/util";

export default function SpotDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getASpotThunk(id))
  }, [dispatch, id])

  const spot = useSelector(state => state.currSpot);

  if (!spot || Object.keys(spot).length === 0) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  const { Owner: { firstName, lastName, id: ownerId }, SpotImages, avgStarRating, city, state, country, name, description, price, numReviews } = spot;

  
  let reviews;
  if (numReviews === 0) {
    reviews = null;
  } else if (numReviews === 1) {
    reviews = '· 1 Review';
  } else if (numReviews > 1) {
    reviews = `· ${numReviews} Reviews`
  }

  return (
    <div className="detail-spot-header">

      <div className="spot-header">
        <h1>{name}</h1>
        <p>{city}, {state}, {country}</p>
      </div>

      <div className="detail-img-container">
        {
          SpotImages.map(({ id, url }, index) => {
            let className;
            switch (index) {
              case 0:
                className = 'main';
                break;
              case 1:
                className = 'side1';
                break;
              case 2:
                className = 'side2';
                break;
              case 3:
                className = 'side3';
                break;
              case 4:
                className = 'side4';
                break;
              default:
                className = '';
            }

            return (
              <img
                key={id}
                className={`img ${className}`}
                src={`${url}`}
                alt='img'
              />
            );
          })
        }
      </div>

      <div className="spots-lower-info">

        <div className="detail-spot-description">
          <h2>Hosted by {firstName} {lastName}</h2>
          <p>{description}</p>
        </div>

        <div className="detail-right-info">
          <div className="detail-price-review-rating">
            <p className="price-night">${price} <br/><span>per night</span></p>

            <span className="avg-reviews"> <FontAwesomeIcon icon={faPaw} /> {avgStarRating !== null ? formatRating(avgStarRating) : `New`} {reviews}</span>
          </div>

          <button
            onClick={() => alert('Feature Coming Soon...')}
          >Reserve</button>
        </div>
      </div>

      <div className="spot-detail-line"></div>

      <ReviewsList 
      spotId={id} 
      reviewCount={reviews} 
      avgStarRating={avgStarRating} 
      ownerId={ownerId} />
    </div>
  )
}