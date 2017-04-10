//Users service used for users REST endpoint
angular.module('mean.mean-admin').factory("Schools", ['$resource',
    function($resource) {
        return $resource('/admin/schools/:schoolId', {
           schoolId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
