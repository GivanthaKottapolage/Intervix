const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');

const findReviewByIdOrReviewId = async (id) => {
    const query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
        query.$or = [{ _id: id }, { review_id: id }];
    } else {
        query.review_id = id;
    }
    return Review.findOne(query);
};

const createReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { review_text, rating } = req.body;
        if (!review_text || !rating) {
            return res.status(400).json({ message: 'Missing review text or rating' });
        }

        const review = new Review({
            user_id: user._id,
            review_text,
            rating: Number(rating)
        });

        await review.save();
        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

const getMyReviews = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reviews = await Review.find({ user_id: user._id }).sort({ created_at: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your reviews', error: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const reviews = await Review.find()
            .populate('user_id', 'fullName email')
            .sort({ created_at: -1 });

        res.json(reviews.map(r => ({
            review_id: r.review_id || r._id,
            user_id: r.user_id?._id,
            userName: r.user_id?.fullName || 'Anonymous',
            userEmail: r.user_id?.email || '',
            review_text: r.review_text,
            rating: r.rating,
            created_at: r.created_at
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

const updateReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const review = await findReviewByIdOrReviewId(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership or admin
        if (review.user_id.toString() !== user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { review_text, rating } = req.body;
        if (review_text !== undefined) review.review_text = review_text;
        if (rating !== undefined) review.rating = Number(rating);

        await review.save();
        res.json({ message: 'Review updated successfully', review });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};

const deleteReview = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Please login first' });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const review = await findReviewByIdOrReviewId(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check ownership or admin
        if (review.user_id.toString() !== user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Review.deleteOne({ _id: review._id });
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
};

const getPublicReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user_id', 'fullName cvData')
            .sort({ created_at: -1 })
            .limit(6);

        const formatted = reviews.map(r => {
            const fullName = r.user_id?.fullName || 'Anonymous User';
            const initials = fullName
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

            return {
                review_id: r.review_id || r._id,
                quote: r.review_text,
                name: fullName,
                role: r.user_id?.cvData?.role_applied || 'Candidate',
                initials: initials || 'AU',
                rating: r.rating || 5,
                created_at: r.created_at
            };
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public reviews', error: error.message });
    }
};

module.exports = {
    createReview,
    getMyReviews,
    getAllReviews,
    updateReview,
    deleteReview,
    getPublicReviews
};

