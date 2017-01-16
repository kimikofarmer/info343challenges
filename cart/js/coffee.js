angular.module('Coffees', ['ui.router', 'angular-uuid', 'LocalStorageModule'])
    .constant('storageKey', 'cart')
    .constant('firebaseUrl', 'https://fiery-fire-4521.firebaseio.com//')
    .factory('products', function(uuid, localStorageService, storageKey) {
        return localStorageService.get(storageKey) || [];
    })
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('main', {
                url: '/order.html',
                templateUrl: 'views/cart.html',
                controller: 'CoffeesController'
            })
            .state('checkout', {
                url:'/order.html/checkout',
                templateUrl: 'views/checkout.html',
                controller: 'CheckoutController'
            })
            .state('confirm', {
                url: '/order.html/confirmation',
                templateUrl: 'views/confirmation.html',
                controller: 'ConfirmationController'
            });

        $urlRouterProvider.otherwise('/order.html');
    })

    //Checks if the credit card year is no more than 10 years ahead in the future
    .directive('ccYear', function() {
        return {
            require: 'ngModel',
            link: function(scope, elem, attrs, controller) {
                controller.$validators.ccYear = function(modelValue) {
                    var today = new Date().getFullYear();
                    return (new Date(modelValue) <= today + 10);
                }
            }
        };
    })

    //Checks if credit card number is valid
    //Credit: //https://github.com/rs2media/ng-luhn-check/blob/master/dist/ng-luhn-check.js
    .directive('luhnCheck', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ngModel) {
                var luhnChk = function(luhn) {
                    var len = luhn.length,
                        mul = 0,
                        prodArr = [
                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                            [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
                        ],
                        sum = 0;
                    while (len--) {
                        sum += prodArr[mul][parseInt(luhn.charAt(len), 10)];
                        mul ^= 1;
                    }
                    return sum % 10 === 0 && sum > 0;
                };
                function luhnCheck(value) {
                    ngModel.$setValidity('luhn-check', luhnChk(value));
                    return value;
                }
                ngModel.$parsers.push(luhnCheck);
                ngModel.$formatters.push(luhnCheck);
            }
        };
    })
    .controller('ConfirmationController', function($scope, coffees) {
    })
    .controller('CoffeesController', function($scope, $http) {
        'use strict';

        $http.get('data/products.json')
            .then(function(results) {
                $scope.coffees = results.data;
            });

        //stores the information in local storage and displays it on the next load
        $scope.cart = angular.fromJson(localStorage.getItem('coffees')) || [];
        $scope.totalCart = localStorage.getItem('totalCart') || 0;
        function saveCart() {
            localStorage.setItem('coffees', angular.toJson($scope.cart));
            localStorage.setItem('totalCart', angular.toJson($scope.totalCart));
        }

        //Displays an error if the user leaves fields empty
        $scope.error = "Empty fields";
        function displayError(err) {
        	alert(err);
        } 

        //Helps assist in sorting by coffee category type
		$scope.setSort = function(categoryName) {
            $scope.category = categoryName;
        };

        //Take in the parameters that the user inputted when putting it in their cart
        //and saves it as a new product to display in the cart
        $scope.addToCart = function (name, price, quantity, grindType) {
            var products = {
                name: name,
                quantity: quantity,
                grind: grindType,
                price: price,
                extPrice: (quantity * price)
            };
            if (quantity > 0 && quantity <= 10 && grindType) {
                $scope.cart.push(products);
            } else if (quantity > 10) {
                displayError("Max: 10lbs per coffee type");
            } else {
                displayError("Please fill out each selection");
            }
            saveCart();
        }

        //Removes items in the cart
        $scope.remove = function(item){
        	var index = $scope.cart.indexOf(item);
        	$scope.cart.splice(index, 1);
        	saveCart();
        }

        //Calculates the total price
        $scope.totalPrice = function() {
        	var total = 0;
        	$scope.cart.forEach(function(cost) {
                total += cost.extPrice;
            });
            return total;
        }
    })

    //Gathers the checkout information to push to Firebase
    .controller('CheckoutController', function($scope, storageKey) {
            $scope.submit = function() {
                $scope.checkout = $firebaseArray(new Firebase("https://fiery-fire-4521.firebaseio.com/"));
                $scope.order.$add({
                    shipping: {
                        name: $scope.shipping.sname,
                        address1: $scope.shipping.asddress1,
                        address2: $scope.shipping.saddress2 || "",
                        city: $scope.shipping.scity,
                        state: $scope.shipping.sstate,
                        zip: $scope.shipping.szip
                    },
                    billing: {
                        name: $scope.billing.bname,
                        address1: $scope.billing.baddress1,
                        address2: $scope.billing.baddress2 || "",
                        city: $scope.billing.bcity,
                        state: $scope.billing.bstate,
                        zip: $scope.billing.bzip
                    },
                    payment: {
                        name: $scope.card.cname,
                        card: $scope.card.cnumber,
                        cvv: $scope.card.ccode,
                        month: $scope.card.cmonth,
                        year: $scope.card.cyear
                    },
                    order: {
                        items: $scope.cart,
                        total: $scope.total
                    },
                    createdAt: Firebase.ServerValue.TIMESTAMP
                });
            }; 
        });