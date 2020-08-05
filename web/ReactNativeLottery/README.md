# README

## eslint & eslint-hooks

```bash
npm run postinstall
```

## firebase
https://rnfirebase.io/
https://rnfirebase.io/crashlytics/usage

## Q&A

### 1.Permission denied @rb_sysopen $/Users/xx/.fastlane/spaceship/xx/cookie

```bash
#please delete any existing fastlane cookies. The authentication endpoint has changed recently 
rm $HOME/.fastlane/spaceship/*/cookie
```