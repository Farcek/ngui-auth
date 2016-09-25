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
    interface IAuthData {
        token: string;
        username: string;
    }
    class AuthService {
        private $rootScope;
        private $state;
        private $authConfig;
        private $cookies;
        static $inject: string[];
        private _data;
        constructor($rootScope: any, $state: ng.ui.IStateService, $authConfig: IAuthConfig, $cookies: ng.cookies.ICookiesService);
        data: IAuthData;
        token: string;
        setData(data: IAuthData): void;
        clear(): void;
        returnToState(state: any): void;
    }
}
declare namespace angular.ui {
    interface IState {
        secret?: boolean;
    }
}
