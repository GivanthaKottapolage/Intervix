const express = require('express');
const {
    createReview,
    getAllReviews,
    getMyReviews,
    updateReview,
    deleteReview,
    getPublicReviews
} = require('../controllers/reviewController');

const reviewRouter = express.Router();

reviewRouter.post('/', createReview);
reviewRouter.get('/public', getPublicReviews);
reviewRouter.get('/', getAllReviews);
reviewRouter.get('/my', getMyReviews);
reviewRouter.put('/:id', updateReview);
reviewRouter.delete('/:id', deleteReview);

module.exports = reviewRouter;
