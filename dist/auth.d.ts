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
        data: IAuthData;
        token: string;
        returnState: IReturnState;
        setData(data: IAuthData): void;
        setReturnState(state: string, params?: {}): void;
        clear(): void;
        returnToState(stateName?: string, stateParams?: {}): void;
    }
}
declare namespace angular.ui {
    interface IState {
        secret?: boolean;
    }
}
