const keyword = ['login', 'verify', 'register', 'resetpassword', 'refresh'];

export function shouldNotIntercept(url: string): boolean {
  return keyword.some((key) => url.includes(key));
}
