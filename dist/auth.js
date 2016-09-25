var ngui;
(function (ngui) {
    var auth;
    (function (auth) {
        function $authConfigProvider() {
            var loginState = 'login', homeState = 'home', cookieName = '$cid', headerName = 'authorization', headerPrefix = 'Bearer';
            return {
                setLoginState: function (value) {
                    loginState = value;
                },
                setHomeState: function (value) {
                    homeState = value;
                },
                setCookieName: function (value) {
                    cookieName = value;
                },
                setHeaderName: function (value) {
                    headerName = value;
                },
                setHeaderPrefix: function (value) {
                    headerPrefix = value;
                },
                $get: function () {
                    return {
                        get loginState() {
                            return loginState;
                        },
                        get homeState() {
                            return homeState;
                        },
                        get cookieName() {
                            return cookieName;
                        },
                        get headerName() {
                            return headerName;
                        },
                        get headerPrefix() {
                            return headerPrefix;
                        }
                    };
                }
            };
        }
        var AuthService = (function () {
            function AuthService($rootScope, $state, $authConfig, $cookies) {
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$authConfig = $authConfig;
                this.$cookies = $cookies;
                this._data = $cookies.getObject($authConfig.cookieName);
                return this;
            }
            Object.defineProperty(AuthService.prototype, "data", {
                get: function () {
                    return this._data;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AuthService.prototype, "token", {
                get: function () {
                    return this._data && this._data.token;
                },
                enumerable: true,
                configurable: true
            });
            AuthService.prototype.setData = function (data) {
                this._data = data;
            };
            AuthService.prototype.clear = function () {
                this._data = null;
                this.$cookies.remove(this.$authConfig.cookieName);
            };
            AuthService.prototype.returnToState = function (state) {
                if (Array.isArray(state) && state.length > 0) {
                    this.$state.go(state[0], state.length > 1 ? state[1] : null);
                }
                else if (Array.isArray(this.$rootScope.$returnToState) && this.$rootScope.$returnToState.length > 0) {
                    var to = this.$rootScope.$returnToState[0];
                    var params = this.$rootScope.$returnToState.length > 1 ? this.$rootScope.$returnToState[1] : null;
                    this.$state.go(to, params);
                }
                else {
                    this.$state.go(this.$authConfig.homeState);
                }
            };
            AuthService.$inject = ['$rootScope', '$state', '$nguiAuthConfig', '$cookies'];
            return AuthService;
        }());
        auth.AuthService = AuthService;
        var SecureTokenInjector = (function () {
            function SecureTokenInjector($q, $injector) {
                this.$q = $q;
                this.$injector = $injector;
                return this;
            }
            SecureTokenInjector.prototype.request = function (config) {
                if (config.notToken || config.noToken) {
                    return config;
                }
                return this.$q(function (resolve, reject) {
                    var authService = this.$injector.get('$nguiAuthService');
                    var authConfig = this.$injector.get('$nguiAuthConfig');
                    if (config.headers && authService.token) {
                        config.headers[authConfig.headerName] = authConfig.headerPrefix + ' ' + authService.token;
                    }
                    resolve(config);
                });
            };
            SecureTokenInjector.prototype.responseError = function (response) {
                if (response.status === 401) {
                    var authService = this.$injector.get('$authService');
                    authService.clear();
                }
                return this.$q.reject(response);
            };
            SecureTokenInjector.$inject = ['$q', '$injector'];
            return SecureTokenInjector;
        }());
        var Initer = (function () {
            function Initer($rootScope, $state, $authService, $authConfig) {
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$authService = $authService;
                this.$authConfig = $authConfig;
                $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                    var to = $state.get(toState.name);
                    if (toState.secret && !$authService.token) {
                        $rootScope.$returnToState = [toState, toParams];
                        $state.transitionTo($authConfig.loginState);
                        event.preventDefault();
                    }
                });
            }
            Initer.$inject = ['$rootScope', '$state', '$nguiAuthService', '$nguiAuthConfig'];
            return Initer;
        }());
        angular.module("ngui-auth", ['ng', 'ngCookies', 'ui.router'])
            .provider('$nguiAuthConfig', $authConfigProvider)
            .factory('$nguiAuthService', AuthService)
            .factory('$nguiAuthSecureTokenInjector', SecureTokenInjector)
            .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('$nguiAuthSecureTokenInjector');
            }])
            .run(Initer);
    })(auth = ngui.auth || (ngui.auth = {}));
})(ngui || (ngui = {}));
