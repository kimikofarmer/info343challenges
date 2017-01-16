
/*
    script for the index.html file
*/

//Need to figure out how to print both title and body and format them

Parse.initialize("SxlZkBOBqpbVIgeu2ozjO5iF6NxDawx67OvpiJL1", "Bgik2lBhjpNz43JbWtiwcGCQch3eO6uMQ62PpU9y");

$(function() {
    'use strict';

    // new Review class for Parse
    var Review = Parse.Object.extend('Review');

    // new query that will return all reviews ordered by createAt
    var reviewsQuery = new Parse.Query(Review);
    reviewsQuery.ascending('createdAt');
    reviewsQuery.notEqualTo('done', true);

    // reference to the review list element
    var reviewsList = $('#reviews-list');

    //reference to the error message alert
    var errorMessage = $('#error-message');

    //current set of reviews
    var reviews = [];

    //reference to our rating element
    var ratingElem = $('#rating');

    function displayError(err) {
        errorMessage.text(err.message);
        errorMessage.fadeIn();
    }

    function clearError() {
        errorMessage.hide();
    }

    function showSpinner() {
        $('.fa-spin').show();
    }

    function hideSpinner() {
        $('.fa-spin').hide();
    }

    function fetchReviews() {
        showSpinner();
        reviewsQuery
            .find().then(onData, displayError)
            .always(hideSpinner);
    }

    function onData(results) {
        reviews = results;
        renderReviews();
    }
    
    var total = 0;
    function renderReviews() {
        reviewsList.empty();

        //appends each element of the review box to the web page
        reviews.forEach(function(review) {
            var personsReview = $(document.createElement('div'))
                .addClass('reviewBox')
                .addClass(review.get('done') ? 'delete-review' : '')
                .appendTo(reviewsList);

            var rating = $(document.createElement('span'))
                .addClass('readOnlyRating')
                .raty({readOnly: true, 
                    score: (review.get('rating') || 1), 
                    hints: ['terrible', 'bad', 'ok', 'great', 'wonderful']})
                .appendTo(personsReview);

            var title = $(document.createElement('span'))
                .text(" " +  review.get('title'))
                .addClass('bigTitle')
                .appendTo(personsReview);

            var helpful = $(document.createElement('span'))
                .addClass("fa fa-thumbs-o-up")
                .appendTo(personsReview)
                .click(function () {
                    review.increment('up');
                    review.save()
                    .then(renderReviews, displayError);
                });

            var unhelpful = $(document.createElement('span'))
                .addClass("fa fa-thumbs-o-down")
                .appendTo(personsReview)
                .click(function () {
                    review.increment('down');
                    review.save()
                    .then(renderReviews, displayError);
                });

            var ratingMessage = $(document.createElement('p'))
                .text(review.get('body'))
                .addClass('bodyMessage')
                .appendTo(personsReview)


            var total = review.get('up') + review.get('down');
            var helpfulness = $(document.createElement('span'))
                .addClass("helpfulness")
                .appendTo(personsReview)
                .html("</br>")
                .text(0 + review.get('up') + ' out of ' + total + ' found this review helpful');

            var destroy = $(document.createElement('span'))
                .addClass("fa fa-times")
                .appendTo(personsReview)
                .click(function() {
                review.set('done', !review.get('done'));
                review.save().then(renderReviews, displayError);
            });

            total += review.get('rating');

            $('#averageRating').raty({
                readOnly: true, 
                score: (total / parseInt(reviews.length)), 
                hints: ['terrible', 'bad', 'ok', 'great', 'wonderful']})
            });
    }

    //when the user subits the new review form...
    $('#new-review-form').submit(function(evt) {
        evt.preventDefault();

        var titleInput = $(this).find('[name="title"]');
        var bodyInput = $(this).find('[name="body"]');
        var title = titleInput.val();
        var body = bodyInput.val();
        var review = new Review();
        review.set('title', title);
        review.set('body', body);
        review.set('up', 0);
        review.set('down', 0);
        review.set('rating', ratingElem.raty('score') || 0);
        review.save().then(fetchReviews, displayError).then(function() {
            titleInput.val('');
            bodyInput.val('');
            ratingElem.raty('set', {});
        });

        return false;
    });

    //go and fetch reviews from the server
    fetchReviews();

    //enable the rating user interface element
    ratingElem.raty();

    //window.setInternal(fetchTasks, 3000);
});