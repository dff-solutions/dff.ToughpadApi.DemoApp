
angular
    .module('dff.app.packagepay', ['dff.log'])
    .value('dffPackagepayPayment', dff.app.packagepay.Payment)
    .value('dffPackagepayLogistician', dff.app.packagepay.Logistician)
    .value('dffPackagepayPackage', dff.app.packagepay.Package)
    .value('dffPackagepayEndOfTour', dff.app.packagepay.EndOfTour)
    .value('dffPackagepayCardType', dff.app.packagepay.CardType)
    .value('dffPackagepayCustomerType', dff.app.packagepay.CustomerType)
    .value('dffPackagepayGirocardProcess', dff.app.packagepay.GirocardProcess)
    .value('dffPackagepayGirocardProcessing', dff.app.packagepay.GirocardProcessing)
    .value('dffPackagepayPaymentResult', dff.app.packagepay.PaymentResult)
    .value('dffPackagepayProcessType', dff.app.packagepay.ProcessType)
    .value('dffPackagepayWHAT', dff.app.packagepay.WHAT)
    .value('dffPackagepayVERIFY_ERROR', dff.app.packagepay.VERIFY_ERROR)
    .factory('dffPackagepayIncomingMessageLogger', function (dffLoggingService) {
        return new dff.app.packagepay.IncomingMessageLogger(dffLoggingService);
    })
    .factory('dffPackagepayServiceConnectionLogger', function (dffLoggingService) {
        return new dff.app.packagepay.ServiceConnectionLogger(dffLoggingService);
    })
    .provider('dffPackagepayService', function () {
        var incomingMessageListeners = [];
        var connectionChangeListeners = [];

        this.addIncomingMessageListener = function (listener) {
            incomingMessageListeners.push(listener);
        };

        this.addServiceConnectionChangeListener = function (listener) {
            connectionChangeListeners.push(listener);
        };

        this.$get = function ($injector, $window, dffLoggingService, Logtype) {
            var iml = [];
            var ccl = [];

            incomingMessageListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        iml.push($injector.get(listener));
                    }
                    else {
                        iml.push(listener);
                    }
                });

            connectionChangeListeners
                .forEach(function (listener) {
                    if (typeof listener === "string")  {
                        ccl.push($injector.get(listener));
                    }
                    else {
                        ccl.push(listener);
                    }
                });

            return new dff.app.packagepay.PackagepayService($window, dffLoggingService, Logtype, iml, ccl);
        };
    })
    .config(function (dffPackagepayServiceProvider) {
        dffPackagepayServiceProvider.addIncomingMessageListener("dffPackagepayIncomingMessageLogger");
        dffPackagepayServiceProvider.addServiceConnectionChangeListener("dffPackagepayServiceConnectionLogger");
    });
