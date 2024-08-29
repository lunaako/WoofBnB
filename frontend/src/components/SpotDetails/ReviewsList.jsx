import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getReviewsThunk } from "../../store/reviews";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import dateTransform, { sortReviews } from "../../utils/date";
import OpenModalButton from "../OpenModalButton/OpenModalButton.jsx";
import './SpotDetails.css';
import PostReviewModal from "../PostReviewModal/PostReviewModal.jsx";
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal.jsx";

export default function ReviewsList({ spotId, reviewCount, avgStarRating, ownerId }) {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const currUser = useSelector(state => state.session);
  const reviews = useSelector(state => state.reviews);


  useEffect(() => {

    dispatch(getReviewsThunk(spotId)).then(() => {
      setIsLoaded(true)
    })
  }, [dispatch, spotId]);


  const reviewArr = Object.values(reviews);

  //!sort the reviews from latest to oldest
  sortReviews(reviewArr);

  const reviewV2 = !reviewArr.length 
                && currUser.user !== null 
                && ownerId !== currUser.user.id;

  // console.log(reviews);

  const buttonDisabled = currUser.user === null 
                        || ownerId === currUser.user.id
                        || reviewArr.find(review => review.userId   === currUser.user.id);
                        
  
  return (
    <div className="spot-review-block">

      <div className="review-header">
        <h2>
          <FontAwesomeIcon icon={faStar} /> {avgStarRating !== null ? Number(avgStarRating.toFixed(2)).toFixed(1) : `New`} {reviewCount}
        </h2>
      </div>

      <div className={buttonDisabled ? 'post-review-disable' : 'post-review-button'}>
        <OpenModalButton
          buttonText="Post Your Review"
          modalComponent={<PostReviewModal spotId={spotId}/>}
        />
      </div>
      
      {
        isLoaded && 
        !!reviewArr.length &&
        <div className="review-detail">
        {
          reviewArr.map(review => (
            <div key={review.id} >
              <h3>{review.User.firstName}</h3>
              <h3>{dateTransform(review.createdAt)}</h3>
              <p>{review.review}</p>

              <div
                className={currUser.user === null
                  || currUser.user.id !== review.userId ? 'disable-delete' : 'delete-review-button'
                }
              >
                <OpenModalButton
                  buttonText='Delete'
                  modalComponent={<DeleteReviewModal 
                                  reviewId={review.id}
                                  spotId={spotId}
                                  />}
                />
              </div>


            </div>
          ))
        }
      </div>
      }

      {
        reviewV2 &&
        <div className="no-review-alter">
          <p>Be the first to post a review!</p>
        </div>
      }

    </div>
  )
}