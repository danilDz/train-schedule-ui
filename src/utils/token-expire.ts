export function getTokenExpireDate() {
  const expireHours = process.env.REACT_APP_JWT_EXPIRE_HOURS!;
  const expires = new Date();
  expires.setHours(expires.getHours() + parseInt(expireHours));
  return expires;
}
