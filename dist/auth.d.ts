declare namespace ngui.auth {
    interface IAuthConfigProvider extends ng.IServiceProvider {
        setLoginState(stateName: string): any;
        setHomeState(stateName: string): any;
        setCookieName(name: string): any;
        setHeaderName(name: string): any;
        setHeaderPrefix(prefix: string): any;
    }
    interface IAuthConfig {
        loginState: string;
        homeState: string;
        cookieName: string;
        headerName: string;
        headerPrefix: string;
    }
    class AuthService {
        private $rootScope;
        private $state;
        private $authConfig;
        private $cookies;
        static $inject: string[];
        private cnToken;
        private _token;
        private _data;
        constructor($rootScope: any, $state: ng.ui.IStateService, $authConfig: IAuthConfig, $cookies: ng.cookies.ICookiesService);
        data: string;
        token: string;
        setData(data: string): void;
        setToken(token: string): void;
        clear(): void;
        returnToState(state: any): void;
    }
}
declare namespace angular.ui {
    interface IState {
        secret?: boolean;
    }
}
