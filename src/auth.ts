namespace ngui.auth {

    export interface IAuthConfigProvider extends ng.IServiceProvider {
        setLoginState(stateName: string)
        setHomeState(stateName: string)
        setCookieName(name: string)
        setHeaderName(name: string)
        setHeaderPrefix(prefix: string)
        setCookieOption(opt: ng.cookies.ICookiesOptions)

    }
    export interface IAuthConfig {
        loginState: string
        homeState: string
        cookieName: string
        headerName: string
        headerPrefix: string
        cookieOption: ng.cookies.ICookiesOptions
    }

    function $authConfigProvider(): IAuthConfigProvider {
        let loginState = 'login', homeState = 'home', cookieName = '$cid', headerName = 'authorization', headerPrefix = 'Bearer';
        let cookiesOptions: ng.cookies.ICookiesOptions = null;
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
            setCookieOption: function (opt) {
                cookiesOptions = opt;
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
                    },
                    get cookieOption() {
                        return cookiesOptions;
                    }
                };
            }
        };
    }
    export interface IAuthData {
        token: string
        username: string
    }
    export interface IReturnState { state: string, params: {} }

    export class AuthService {
        public static $inject = ['$state', '$nguiAuthConfig', '$cookies'];
        private _data: IAuthData
        private _returnState: IReturnState
        constructor(private $state: ng.ui.IStateService, private $authConfig: IAuthConfig, private $cookies: ng.cookies.ICookiesService) {
            this._data = $cookies.getObject($authConfig.cookieName);

        }
        get data(): IAuthData {
            return this._data;
        }
        get token(): string {
            return this._data && this._data.token;
        }
        get isLogined(): boolean {
            return !!(this._data && this._data.token);
        }
        get returnState(): IReturnState {
            return this._returnState;
        }
        setData(data: IAuthData) {
            this._data = data
            this.$cookies.putObject(this.$authConfig.cookieName, this._data, this.$authConfig.cookieOption);
        }
        setReturnState(state: string, params?: {}) {
            this._returnState = {
                state: state,
                params: params
            }
        }
        clear() {
            this._data = null;
            this.$cookies.remove(this.$authConfig.cookieName);
        }
        returnToState(stateName?: string, stateParams?: {}) {
            if (stateName) {
                this.$state.go(stateName, stateParams);
            } else if (this._returnState && this._returnState.state) {
                this.$state.go(this._returnState.state, this._returnState.params);
            } else {
                this.$state.go(this.$authConfig.homeState);
            }
        }
    }

    export module SecureTokenInjector {
        export function factory($q, $injector) {
            return {
                request: (config) => {
                    if (config.notToken || config.noToken) {
                        return config;
                    }

                    return $q(function (resolve, reject) {
                        var authService: AuthService = $injector.get('$nguiAuthService');
                        var authConfig: IAuthConfig = $injector.get('$nguiAuthConfig');


                        if (config.headers && authService.token) {
                            config.headers[authConfig.headerName] = authConfig.headerPrefix + ' ' + authService.token;
                        }
                        resolve(config);
                    });
                },
                responseError: (response) => {
                    if (response.status === 401) {
                        var authService: AuthService = $injector.get('$nguiAuthService');
                        authService.clear();
                    }
                    return $q.reject(response);
                }
            }
        }
        factory.$inject = ['$q', '$injector'];
    }

    class Initer {
        public static $inject = ['$rootScope', '$state', '$nguiAuthService', '$nguiAuthConfig'];
        constructor(private $rootScope, private $state: ng.ui.IStateService, private $authService: AuthService, private $authConfig: IAuthConfig) {
            $rootScope.$on("$stateChangeStart", (event, toState, toParams, fromState, fromParams) => {
                var to = $state.get(toState.name);

                if (toState.secret && !$authService.token) {

                    $authService.setReturnState(toState, toParams);

                    $state.transitionTo($authConfig.loginState);
                    event.preventDefault();
                }
            });
        }
    }
    angular.module("ngui-auth", ['ng', 'ngCookies', 'ui.router'])
        .provider('$nguiAuthConfig', $authConfigProvider)
        .service('$nguiAuthService', AuthService)
        .factory('$nguiAuthSecureTokenInjector', SecureTokenInjector.factory)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('$nguiAuthSecureTokenInjector');
        }])
        .run(Initer)
        ;
}

namespace angular.ui {

    export interface IState {
        secret?: boolean
    }
}