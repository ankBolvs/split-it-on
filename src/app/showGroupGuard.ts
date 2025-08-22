import { ShowGroupsComponent } from './view/showGroups.component';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable()
export class ShowGroupGuard {
  private firstNavigation = true;

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.firstNavigation) {
      this.firstNavigation = false;

      if (route.component != ShowGroupGuard) {
        this.router.navigateByUrl('/');
        return false;
      }
    }

    return true;
  }
}
