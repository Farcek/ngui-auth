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
            function AuthService($state, $authConfig, $cookies) {
                this.$state = $state;
                this.$authConfig = $authConfig;
                this.$cookies = $cookies;
                this._data = $cookies.getObject($authConfig.cookieName);
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
            Object.defineProperty(AuthService.prototype, "isLogined", {
                get: function () {
                    return !!(this._data && this._data.token);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AuthService.prototype, "returnState", {
                get: function () {
                    return this._returnState;
                },
                enumerable: true,
                configurable: true
            });
            AuthService.prototype.setData = function (data) {
                this._data = data;
                this.$cookies.putObject(this.$authConfig.cookieName, this._data);
            };
            AuthService.prototype.setReturnState = function (state, params) {
                this._returnState = {
                    state: state,
                    params: params
                };
            };
            AuthService.prototype.clear = function () {
                this._data = null;
                this.$cookies.remove(this.$authConfig.cookieName);
            };
            AuthService.prototype.returnToState = function (stateName, stateParams) {
                if (stateName) {
                    this.$state.go(stateName, stateParams);
                }
                else if (this._returnState && this._returnState.state) {
                    this.$state.go(this._returnState.state, this._returnState.params);
                }
                else {
                    this.$state.go(this.$authConfig.homeState);
                }
            };
            AuthService.$inject = ['$state', '$nguiAuthConfig', '$cookies'];
            return AuthService;
        }());
        auth.AuthService = AuthService;
        var SecureTokenInjector;
        (function (SecureTokenInjector) {
            function factory($q, $injector) {
                return {
                    request: function (config) {
                        if (config.notToken || config.noToken) {
                            return config;
                        }
                        return $q(function (resolve, reject) {
                            var authService = $injector.get('$nguiAuthService');
                            var authConfig = $injector.get('$nguiAuthConfig');
                            if (config.headers && authService.token) {
                                config.headers[authConfig.headerName] = authConfig.headerPrefix + ' ' + authService.token;
                            }
                            resolve(config);
                        });
                    },
                    responseError: function (response) {
                        if (response.status === 401) {
                            var authService = $injector.get('$authService');
                            authService.clear();
                        }
                        return $q.reject(response);
                    }
                };
            }
            SecureTokenInjector.factory = factory;
            factory.$inject = ['$q', '$injector'];
        })(SecureTokenInjector = auth.SecureTokenInjector || (auth.SecureTokenInjector = {}));
        var Initer = (function () {
            function Initer($rootScope, $state, $authService, $authConfig) {
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$authService = $authService;
                this.$authConfig = $authConfig;
                $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                    var to = $state.get(toState.name);
                    if (toState.secret && !$authService.token) {
                        $authService.setReturnState(toState, toParams);
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
            .service('$nguiAuthService', AuthService)
            .factory('$nguiAuthSecureTokenInjector', SecureTokenInjector.factory)
            .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('$nguiAuthSecureTokenInjector');
            }])
            .run(Initer);
    })(auth = ngui.auth || (ngui.auth = {}));
})(ngui || (ngui = {}));
