type NavigateFn = (route: string) => void;
let _navigate: NavigateFn = (r) => { window.location.href = r; }; 

export const setNavigate = (fn: NavigateFn) => { _navigate = fn; };
export const navigate    = (route: string)   => _navigate(route);