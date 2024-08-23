import { CanActivateFn } from "@angular/router";

export function AdminGuard(): CanActivateFn {
    let token = localStorage.getItem("token");
    return () => {
        if (token!=null) {
            return true;
        }
        return false;
    };
}