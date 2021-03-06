declare namespace ngui.auth {
    interface IAuthConfigProvider extends ng.IServiceProvider {
        setLoginState(stateName: string): any;
        setHomeState(stateName: string): any;
        setCookieName(name: string): any;
        setHeaderName(name: string): any;
        setHeaderPrefix(prefix: string): any;
        setCookieOption(opt: ng.cookies.ICookiesOptions): any;
    }
    interface IAuthConfig {
        loginState: string;
        homeState: string;
        cookieName: string;
        headerName: string;
        headerPrefix: string;
        cookieOption: ng.cookies.ICookiesOptions;
    }
    interface IAuthData {
        token: string;
        username: string;
    }
    interface IReturnState {
        state: string;
        params: {};
    }
    class AuthService {
        private $state;
        private $authConfig;
        private $cookies;
        static $inject: string[];
        private _data;
        private _returnState;
        constructor($state: ng.ui.IStateService, $authConfig: IAuthConfig, $cookies: ng.cookies.ICookiesService);
        readonly data: IAuthData;
        readonly token: string;
        readonly isLogined: boolean;
        readonly returnState: IReturnState;
        setData(data: IAuthData): void;
        setReturnState(state: string, params?: {}): void;
        clear(): void;
        returnToState(stateName?: string, stateParams?: {}): void;
    }
    module SecureTokenInjector {
        function factory($q: any, $injector: any): {
            request: (config: any) => any;
            responseError: (response: any) => any;
        };
    }
}
declare namespace angular.ui {
    interface IState {
        secret?: boolean;
    }
}
