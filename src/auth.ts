namespace ngui.auth {

    interface IAuthConfigProvider extends ng.IServiceProvider {
        setLoginState(stateName: string)
        setHomeState(stateName: string)
        setCookieName(name: string)
        setHeaderName(name: string)
        setHeaderPrefix(prefix: string)

    }
    interface IAuthConfig {
        loginState: string
        homeState: string
        cookieName: string
        headerName: string
        headerPrefix: string
    }

    function $authConfigProvider(): IAuthConfigProvider {
        let loginState = 'login', homeState = 'home', cookieName = '$cid', headerName = 'authorization', headerPrefix = 'Bearer';
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
    class AuthService {
        public static $inject = ['$rootScope', '$state', '$authConfig', '$cookies'];
        private cnToken: string
        private _token: string
        private _data: string
        constructor(private $rootScope, private $state: ng.ui.IStateService, private $authConfig: IAuthConfig, private $cookies: ng.cookies.ICookiesService) {
            this.cnToken = $authConfig.cookieName;
            this._token = $cookies.get(this.cnToken);
        }
        get data(): string {
            return '';
        }
        get token(): string {
            return '';
        }
        setData(data: string) {
            this._data = data
        }
        setToken(token: string) {
            this.$cookies.put(this.cnToken, this._token = token);
        }
        clear() {
            this._token = null;
            this._data = null;
            this.$cookies.remove(this.cnToken);
        }
        returnToState(state) {
            if (Array.isArray(state) && state.length > 0) {
                this.$state.go(state[0], state.length > 1 ? state[1] : null);
            } else if (Array.isArray(this.$rootScope.$returnToState) && this.$rootScope.$returnToState.length > 0) {
                var to = this.$rootScope.$returnToState[0];
                var params = this.$rootScope.$returnToState.length > 1 ? this.$rootScope.$returnToState[1] : null;
                this.$state.go(to, params);
            } else {
                this.$state.go(this.$authConfig.homeState);
            }
        }
    }
    class SecureTokenInjector {
        public static $inject = ['$q', '$injector'];
        constructor(private $q, private $injector) {

        }
        request(config) {
            if (config.notToken || config.noToken) {
                return config;
            }

            return this.$q(function (resolve, reject) {
                var authService: AuthService = this.$injector.get('$authService');
                var authConfig: IAuthConfig = this.$injector.get('$authConfig');


                if (config.headers && authService.token) {
                    config.headers[authConfig.headerName] = authConfig.headerPrefix + ' ' + authService.token;
                }
                resolve(config);
            });
        }
        responseError(response) {
            if (response.status === 401) {
                var authService: AuthService = this.$injector.get('$authService');
                authService.clear();
            }
            return this.$q.reject(response);
        }
    }
    class Initer {
        public static $inject = ['$rootScope', '$state', '$authService', '$authConfig'];
        constructor(private $rootScope, private $state: ng.ui.IStateService, private $authService: AuthService, private $authConfig: IAuthConfig) {
            $rootScope.$on("$stateChangeStart", (event, toState, toParams, fromState, fromParams) => {
                var to = $state.get(toState.name);

                if (toState.secret && !$authService.token) {

                    $rootScope.$returnToState = [toState, toParams];

                    $state.transitionTo($authConfig.loginState);
                    event.preventDefault();
                }
            });
        }
    }
    angular.module("ngui-auth", [])
        .provider('$authConfig', $authConfigProvider)
        .factory('$authService', AuthService)
        .factory('$authSecureTokenInjector', SecureTokenInjector)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('SecureTokenInjector');
        }])
        .run(Initer)
        ;
}