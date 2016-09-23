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
                this.cnToken = $authConfig.cookieName;
                this._token = $cookies.get(this.cnToken);
            }
            Object.defineProperty(AuthService.prototype, "data", {
                get: function () {
                    return '';
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AuthService.prototype, "token", {
                get: function () {
                    return '';
                },
                enumerable: true,
                configurable: true
            });
            AuthService.prototype.setData = function (data) {
                this._data = data;
            };
            AuthService.prototype.setToken = function (token) {
                this.$cookies.put(this.cnToken, this._token = token);
            };
            AuthService.prototype.clear = function () {
                this._token = null;
                this._data = null;
                this.$cookies.remove(this.cnToken);
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
            AuthService.$inject = ['$rootScope', '$state', '$authConfig', '$cookies'];
            return AuthService;
        }());
        var SecureTokenInjector = (function () {
            function SecureTokenInjector($q, $injector) {
                this.$q = $q;
                this.$injector = $injector;
            }
            SecureTokenInjector.prototype.request = function (config) {
                if (config.notToken || config.noToken) {
                    return config;
                }
                return this.$q(function (resolve, reject) {
                    var authService = this.$injector.get('$authService');
                    var authConfig = this.$injector.get('$authConfig');
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
            Initer.$inject = ['$rootScope', '$state', '$authService', '$authConfig'];
            return Initer;
        }());
        angular.module("ngui-auth", [])
            .provider('$authConfig', $authConfigProvider)
            .factory('$authService', AuthService)
            .factory('$authSecureTokenInjector', SecureTokenInjector)
            .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('SecureTokenInjector');
            }])
            .run(Initer);
    })(auth = ngui.auth || (ngui.auth = {}));
})(ngui || (ngui = {}));
