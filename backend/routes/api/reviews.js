const express = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Review, User, Spot, ReviewImage } = require('../../db/models');

const router = express.Router();

const validateReview = [
  check('review')
    .if(check('review').exists()).isLength({min: 1})
    .withMessage('Review text is required'),
  check('stars')
    .isInt({min: 1, max: 5})
    .withMessage('Stars must be an integer from 1 to 5'),
handleValidationErrors
];

//get all reviews of current user
router.get('/current', requireAuth, async (req,res) => {
  const {user} = req;

  if (user) {
    const currentUserId = user.id;

    const previewImg = await SpotImage.findOne({
      where: {
        spotId: spot.id,
        preview: true
      },
      attributes: ['url']
    });
    
    const reviews = await Review.findAll({
      where: {
        userId: currentUserId
      },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }, {
        model: ReviewImage,
        attributes: ['id', 'url']
      },{
        model: Spot,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'description']
        }
      }]})
    // add ReviewImage in include later
    return res.json({'Reviews': reviews});
  }
});

//edit review
router.put('/:reviewId', requireAuth, validateReview, async(req,res) => {
  const { user } = req;
  const {reviewId} = req.params;
  const thisReview = await Review.findByPk(reviewId);

  if (thisReview) {
    if (+user.id === +thisReview.userId) {
      await thisReview.update(req.body);
      return res.json(thisReview);
    } else {
      return res.status(403).json({
        "message": "Forbidden"
      })
    }
  } else {
    res.status(404);
    return res.json({
      "message": "Review couldn't be found"
    });
  }
})

router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { user } = req;
  const {reviewId} = req.params;
  const thisReview = await Review.findByPk(reviewId);

  if (thisReview) {
    if (+user.id !== +thisReview.userId) {
      return res.status(403).json({
        "message": "Forbidden"
      })
    } else {
      await thisReview.destroy();
      return res.json({
        "message": "Successfully deleted"
      })
    }
  } else {
    res.status(404);
    return res.json({
      "message": "Review couldn't be found"
    });
  }
})

//add an img to a review based on review id
router.post('/:reviewId/images', requireAuth, async(req, res, next) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const { user } = req;
  const review = await Review.findByPk(reviewId);


  if (!review) return res.status(404).json({"message": "Review couldn't be found"});

  if (user.id !== review.userId) {
    return res.status(403).json({
      "message": "Forbidden"
    })
  };

  if ((await ReviewImage.findAll({where: {reviewId: review.id}})).length > 10) {
    return res.status(403).json({
      "message": "Maximum number of images for this resource was reached"
    })
  }

  const newImg = await review.createReviewImage({url});
  return res.status(201).json(newImg);
})

module.exports = router;