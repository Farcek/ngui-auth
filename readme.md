## project nguiAuth

``` 
basic authcation process
```
---


- js import
```
--- requared
<script src="/bower_components/angular/angular.js"></script>
<script src="/bower_components/angular-cookies/angular-cookies.js"></script>

<script src="/bower_components/ngui-auth/dist/auth.js"></script>

```
- config
```
    // auth config
    .config(['$nguiAuthConfigProvider',
        function ($nguiAuthConfigProvider:ngui.auth.IAuthConfigProvider) {
            $nguiAuthConfigProvider
                .setLoginState('sysop-login')
        }
    ])
```

- login success
```
    $nguiAuthService.setData({session data});
    $nguiAuthService.returnToState();
```